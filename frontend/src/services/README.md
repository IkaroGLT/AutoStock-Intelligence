# Serviços do frontend

## Estado atual (Issue #18)

`demoStorage.ts` centraliza a persistência **demonstrativa** em `localStorage`.
Os dados permanecem exclusivamente no navegador; não são sincronizados
com o backend. As chaves `autostock-products` e `autostock-movements` foram
mantidas para preservar os registros locais existentes.

## Integração futura (AS-05)

- Implementar um cliente HTTP configurável por ambiente, após validar os
  contratos da API FastAPI definidos pela equipe de backend.
- Separar chamadas de produtos e movimentações por domínio, mantendo o ID
  como chave estável para as operações.
- Substituir o armazenamento demonstrativo por serviços da API sem apagar
  silenciosamente dados que possam existir no navegador.
- Tratar estados de carregamento, sucesso e erro e os códigos HTTP previstos
  na AS-05; autenticação/autorização real dependem da AS-03.
- Manter validações críticas e cálculo transacional de estoque no backend.

Não cadastrar endpoints ou credenciais fictícias como se fossem serviços reais.
