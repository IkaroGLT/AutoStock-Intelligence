import pytest

# Simulação das regras centrais de negócio do AutoStock para os testes unitários (AS-09 / RF-13)

class ProdutoInvalidoError(Exception):
    pass

class EstoqueInsuficienteError(Exception):
    pass

class ServicoEstoque:
    def __init__(self):
        self.produtos = {} # SKU -> {"nome": str, "saldo": int, "minimo": int}
        self.historico_movimentacoes = []

    def cadastrar_produto(self, sku: str, nome: str, saldo_inicial: int = 0, minimo: int = 5):
        if not sku or not sku.strip():
            raise ProdutoInvalidoError("SKU não pode ser vazio.")
        if sku in self.produtos:
            raise ProdutoInvalidoError(f"SKU '{sku}' já cadastrado (unicidade violada).")
        if saldo_inicial < 0:
            raise ProdutoInvalidoError("Saldo inicial não pode ser negativo.")
        
        self.produtos[sku] = {"nome": nome, "saldo": saldo_inicial, "minimo": minimo}
        return True

    def registrar_entrada(self, sku: str, quantidade: int, motivo: str = "Entrada normal"):
        if sku not in self.produtos:
            raise ProdutoInvalidoError("Produto não encontrado.")
        if quantidade <= 0:
            raise ProdutoInvalidoError("Quantidade de entrada deve ser maior que zero.")
        
        self.produtos[sku]["saldo"] += quantidade
        self.historico_movimentacoes.append({"tipo": "ENTRADA", "sku": sku, "qtd": quantidade, "motivo": motivo})
        return self.produtos[sku]["saldo"]

    def registrar_saida(self, sku: str, quantidade: int, motivo: str = "Saída normal"):
        if sku not in self.produtos:
            raise ProdutoInvalidoError("Produto não encontrado.")
        if quantidade <= 0:
            raise ProdutoInvalidoError("Quantidade de saída deve ser maior que zero.")
        
        saldo_atual = self.produtos[sku]["saldo"]
        if saldo_atual - quantidade < 0:
            raise EstoqueInsuficienteError("Operação bloqueada: geraria estoque negativo.")
        
        self.produtos[sku]["saldo"] -= quantidade
        self.historico_movimentacoes.append({"tipo": "SAIDA", "sku": sku, "qtd": quantidade, "motivo": motivo})
        return self.produtos[sku]["saldo"]

    def corrigir_lancamento(self, sku: str, quantidade_original: int, quantidade_corrigida: int, motivo: str):
        """Implementação da regra RF-13: Retificação de lançamentos de entrada"""
        if not motivo or not motivo.strip():
            raise ProdutoInvalidoError("Justificativa obrigatória para correção.")
        if sku not in self.produtos:
            raise ProdutoInvalidoError("Produto não encontrado.")
        
        diferenca = quantidade_corrigida - quantidade_original
        saldo_projetado = self.produtos[sku]["saldo"] + diferenca
        if saldo_projetado < 0:
            raise EstoqueInsuficienteError("Correção rejeitada: resultaria em estoque negativo.")
        
        self.produtos[sku]["saldo"] = saldo_projetado
        self.historico_movimentacoes.append({
            "tipo": "CORRECAO_RF13", 
            "sku": sku, 
            "original": quantidade_original, 
            "corrigido": quantidade_corrigida, 
            "compensacao": diferenca,
            "motivo": motivo
        })
        return self.produtos[sku]["saldo"]


# --- TESTES UNITÁRIOS COM DADOS ISOLADOS E PROGRESSIVOS ---

def test_unicidade_sku():
    servico = ServicoEstoque()
    servico.cadastrar_produto("SKU-001", "Produto A", saldo_inicial=10)
    with pytest.raises(ProdutoInvalidoError):
        servico.cadastrar_produto("SKU-001", "Produto Duplicado", saldo_inicial=5)

def test_saida_estoque_permitida():
    servico = ServicoEstoque()
    servico.cadastrar_produto("SKU-002", "Caneta", saldo_inicial=10)
    novo_saldo = servico.registrar_saida("SKU-002", 4)
    assert novo_saldo == 6

def test_bloqueio_estoque_negativo():
    servico = ServicoEstoque()
    servico.cadastrar_produto("SKU-003", "Caderno", saldo_inicial=10)
    with pytest.raises(EstoqueInsuficienteError):
        servico.registrar_saida("SKU-003", 15)

def test_rf13_correcao_simples():
    servico = ServicoEstoque()
    servico.cadastrar_produto("SKU-004", "Mochila", saldo_inicial=10)
    # Entrada de 15 corrigida para 10 (diferença -5). Saldo inicial 10 + (-5) = 5
    saldo_final = servico.corrigir_lancamento("SKU-004", quantidade_original=15, quantidade_corrigida=10, motivo="Erro de digitação NF")
    assert saldo_final == 5

def test_rf13_rejeitar_correcao_com_estoque_insuficiente():
    servico = ServicoEstoque()
    servico.cadastrar_produto("SKU-005", "Estojo", saldo_inicial=5)
    with pytest.raises(EstoqueInsuficienteError):
        servico.corrigir_lancamento("SKU-005", quantidade_original=30, quantidade_corrigida=0, motivo="Correção inválida")

def test_rf13_exigir_justificativa():
    servico = ServicoEstoque()
    servico.cadastrar_produto("SKU-006", "Borracha", saldo_inicial=10)
    with pytest.raises(ProdutoInvalidoError):
        servico.corrigir_lancamento("SKU-006", quantidade_original=15, quantidade_corrigida=10, motivo="")