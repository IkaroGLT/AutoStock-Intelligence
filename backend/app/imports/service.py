
import csv
import io
import sqlite3
import zipfile
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from openpyxl.utils.exceptions import InvalidFileException

from openpyxl import load_workbook

from app.db.connection import connect
from app.stock.service import registrar_movimentacao_em_transacao


LIMITE_ARQUIVO = 5_000_000

COLUNAS_OBRIGATORIAS = {
    "sku",
    "nome",
    "categoria",
    "preco_custo",
    "preco_venda",
    "quantidade",
    "estoque_minimo",
    "ativo",
}


class ErroImportacao(ValueError):
    """Erro de validação de um arquivo de importação."""


def converter_preco(valor):
    if valor is None or isinstance(valor, bool):
        raise ErroImportacao("Preço inválido.")

    texto = str(valor).strip().replace("R$", "").replace(" ", "")

    # Aceita, por exemplo, 1234.56, 1234,56 e 1.234,56.
    if "," in texto and "." in texto:
        if texto.rfind(",") > texto.rfind("."):
            texto = texto.replace(".", "").replace(",", ".")
        else:
            texto = texto.replace(",", "")
    else:
        texto = texto.replace(",", ".")

    try:
        numero = Decimal(texto)

        if not numero.is_finite() or numero < 0:
            raise InvalidOperation

        return int(
            (numero * 100).quantize(
                Decimal("1"),
                rounding=ROUND_HALF_UP,
            )
        )
    except (InvalidOperation, ValueError):
        raise ErroImportacao(f"Preço inválido: {valor}")


def converter_inteiro(valor, campo):
    if valor is None or isinstance(valor, bool):
        raise ErroImportacao(f"{campo} inválido.")

    texto = str(valor).strip()

    try:
        numero = int(texto)

        if texto not in (str(numero), f"{numero}.0") or numero < 0:
            raise ValueError

        return numero
    except (TypeError, ValueError):
        raise ErroImportacao(f"{campo} inválido.")


def converter_ativo(valor):
    if isinstance(valor, bool):
        return int(valor)

    texto = str(valor).strip().lower()

    if texto in {"1", "true", "sim", "yes"}:
        return 1

    if texto in {"0", "false", "não", "nao", "no"}:
        return 0

    raise ErroImportacao("Campo ativo inválido.")

def validar_cabecalho(cabecalho):
    nomes = [
        str(coluna).strip().lower()
        for coluna in cabecalho
        if coluna is not None and str(coluna).strip()
    ]

    if len(nomes) != len(set(nomes)):
        raise ErroImportacao(
            "O arquivo possui nomes de colunas duplicados."
        )

def ler_arquivo(nome, conteudo):
    nome = (nome or "").lower()

    if nome.endswith(".csv"):
        try:
            texto = conteudo.decode("utf-8-sig")
        except UnicodeDecodeError as erro:
            raise ErroImportacao("O CSV deve utilizar codificação UTF-8.") from erro

        leitor = csv.DictReader(io.StringIO(texto, newline=""))

        if not leitor.fieldnames:
            raise ErroImportacao("Arquivo vazio ou sem cabeçalho.")

        leitor.fieldnames = [
            str(coluna).strip().lower() if coluna is not None else ""
            for coluna in leitor.fieldnames
        ]
        validar_cabecalho(leitor.fieldnames)

        return [
            {
                chave: valor
                for chave, valor in linha.items()
                if chave is not None
            }
            for linha in leitor
            if any(valor not in (None, "") for valor in linha.values())
        ]

    if nome.endswith(".xlsx"):
        try:
            workbook = load_workbook(
                io.BytesIO(conteudo),
                read_only=True,
                data_only=True,
            )
        except (ValueError,OSError,KeyError,zipfile.BadZipFile,InvalidFileException,) as erro:
            raise ErroImportacao("Arquivo XLSX inválido.") from erro

        try:
            planilha = workbook.worksheets[0]
            linhas = planilha.iter_rows(values_only=True)
            

            cabecalho_original = next(linhas, None)

            if not cabecalho_original:
                raise ErroImportacao("Arquivo vazio ou sem cabeçalho.")

            cabecalho = [
                str(valor).strip().lower() if valor is not None else ""
                for valor in cabecalho_original
            ]
            validar_cabecalho(cabecalho)

            resultado = []

            for linha in linhas:
                if not any(valor is not None for valor in linha):
                    continue

                resultado.append(
                    dict(zip(cabecalho, linha))
                )
            

            return resultado
        finally:
            workbook.close()

    raise ErroImportacao("Formato aceito: CSV ou XLSX.")


def normalizar_linhas(linhas):
    if not linhas:
        raise ErroImportacao("Arquivo sem registros.")

    colunas = set(linhas[0].keys())
    ausentes = COLUNAS_OBRIGATORIAS - colunas

    if ausentes:
        raise ErroImportacao(
            f"Colunas ausentes: {sorted(ausentes)}"
        )

    normalizadas = []
    skus_encontrados = set()

    for numero_linha, linha in enumerate(linhas, start=2):
        sku = str(linha.get("sku") or "").strip()
        nome = str(linha.get("nome") or "").strip()
        categoria = str(linha.get("categoria") or "").strip()

        if not sku or not nome or not categoria:
            raise ErroImportacao(
                f"Linha {numero_linha}: SKU, nome e categoria são obrigatórios."
            )

        if sku in skus_encontrados:
            raise ErroImportacao(
                f"Linha {numero_linha}: SKU duplicado no arquivo."
            )

        skus_encontrados.add(sku)

        ean_valor = linha.get("ean")
        ean = str(ean_valor).strip() if ean_valor is not None else None

        descricao = linha.get("descricao")
        if descricao is not None:
            descricao = str(descricao).strip() or None

        normalizadas.append({
            "sku": sku,
            "ean": ean or None,
            "nome": nome,
            "categoria": categoria,
            "descricao": descricao,
            "preco_custo": converter_preco(linha.get("preco_custo")),
            "preco_venda": converter_preco(linha.get("preco_venda")),
            "quantidade": converter_inteiro(
                linha.get("quantidade"), "quantidade"
            ),
            "estoque_minimo": converter_inteiro(
                linha.get("estoque_minimo"), "estoque_minimo"
            ),
            "ativo": converter_ativo(linha.get("ativo")),
        })

    return normalizadas


def importar_produtos(nome_arquivo, conteudo):
    if len(conteudo) > LIMITE_ARQUIVO:
        raise ErroImportacao("Arquivo maior que 5 MB.")

    linhas = ler_arquivo(nome_arquivo, conteudo)
    produtos = normalizar_linhas(linhas)

    extensao = (nome_arquivo or "").lower()

    if extensao.endswith(".xlsx"):
        tipo = "EXCEL"
    else:
        tipo = "CSV"

    con = connect()

    try:
        con.execute("BEGIN IMMEDIATE")

        sincronizacao = con.execute(
            """
            INSERT INTO sincronizacoes (
                tipo,
                arquivo_nome,
                status,
                total_lidos
            )
            VALUES (?, ?, 'EM_ANDAMENTO', ?)
            """,
            (tipo, nome_arquivo, len(produtos)),
        )

        sincronizacao_id = sincronizacao.lastrowid

        criados = 0
        atualizados = 0

        for produto in produtos:
            existente = con.execute(
                """
                SELECT id
                FROM produtos
                WHERE sku = ?
                """,
                (produto["sku"],),
            ).fetchone()

            if existente:
                produto_id = existente["id"]

                con.execute(
                    """
                    UPDATE produtos
                    SET ean = ?,
                        nome = ?,
                        categoria = ?,
                        descricao = ?,
                        preco_custo_centavos = ?,
                        preco_venda_centavos = ?,
                        ativo = ?,
                        atualizado_em = strftime(
                            '%Y-%m-%dT%H:%M:%fZ', 'now'
                        )
                    WHERE id = ?
                    """,
                    (
                        produto["ean"],
                        produto["nome"],
                        produto["categoria"],
                        produto["descricao"],
                        produto["preco_custo"],
                        produto["preco_venda"],
                        produto["ativo"],
                        produto_id,
                    ),
                )

                atualizado = con.execute(
                    """
                    UPDATE estoque
                    SET estoque_minimo = ?
                    WHERE produto_id = ?
                    """,
                    (produto["estoque_minimo"], produto_id),
                )

                if atualizado.rowcount != 1:
                    raise sqlite3.IntegrityError(
                        f"Produto {produto['sku']} não possui registro de estoque válido."
                    )

                atualizados += 1
                continue

            if produto["ativo"] == 0 and produto["quantidade"] > 0:
                raise ErroImportacao(
                    f"SKU {produto['sku']}: produto novo inativo "
                    "não pode receber quantidade inicial."
                )

            cursor = con.execute(
                """
                INSERT INTO produtos (
                    sku,
                    ean,
                    nome,
                    categoria,
                    descricao,
                    preco_custo_centavos,
                    preco_venda_centavos,
                    ativo
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    produto["sku"],
                    produto["ean"],
                    produto["nome"],
                    produto["categoria"],
                    produto["descricao"],
                    produto["preco_custo"],
                    produto["preco_venda"],
                    produto["ativo"],
                ),
            )

            produto_id = cursor.lastrowid

            con.execute(
                """
                INSERT INTO estoque (
                    produto_id,
                    quantidade_atual,
                    estoque_minimo
                )
                VALUES (?, 0, ?)
                """,
                (produto_id, produto["estoque_minimo"]),
            )

            if produto["quantidade"] > 0:
                registrar_movimentacao_em_transacao(
                    con,
                    produto_id=produto_id,
                    tipo="ENTRADA",
                    quantidade=produto["quantidade"],
                    motivo="Estoque inicial via importação",
                    origem="importacao",
                    referencia_externa=(
                        f"{sincronizacao_id}:{produto['sku']}"
                    ),
                )

            criados += 1

        con.execute(
            """
            UPDATE sincronizacoes
            SET status = 'CONCLUIDA',
                total_criados = ?,
                total_atualizados = ?,
                total_erros = 0,
                finalizada_em = strftime(
                    '%Y-%m-%dT%H:%M:%fZ', 'now'
                )
            WHERE id = ?
            """,
            (criados, atualizados, sincronizacao_id),
        )

        con.commit()

        return {
            "sincronizacao_id": sincronizacao_id,
            "total_lidos": len(produtos),
            "total_criados": criados,
            "total_atualizados": atualizados,
            "total_erros": 0,
            "observacao": "Saldo dos produtos existentes preservado.",
        }

    except Exception:
        con.rollback()
        raise

def listar_importacoes(*, limite=50, deslocamento=0):
    """Lista o histórico de importações CSV e XLSX."""

    con = connect()

    try:
        registros = con.execute(
            """
            SELECT
                id,
                tipo,
                arquivo_nome,
                status,
                total_lidos,
                total_criados,
                total_atualizados,
                total_erros,
                iniciada_em,
                finalizada_em,
                detalhes_erro
            FROM sincronizacoes
            WHERE tipo IN ('CSV', 'EXCEL')
            ORDER BY id DESC
            LIMIT ?
            OFFSET ?
            """,
            (limite, deslocamento),
        ).fetchall()

        return [dict(registro) for registro in registros]


    finally:
        con.close()
