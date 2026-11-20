# Referência da API


| Método e rota | Função |
| --- | --- |
| `POST /usuarios` | Cria uma conta de operador com `nome`, `email` e `senha`. |
| `POST /login` | Recebe `email` e `senha` e devolve o token da sessão. |
| `GET /usuarios/perfil` | Devolve o perfil da sessão atual. |
| `GET /missoes` | Lista missões com os filtros opcionais `pagina`, `limite` e `nome`. |
| `POST /missoes` | Cadastra uma missão como administrador. |
| `PUT /missoes/:id` ou `DELETE /missoes/:id` | Edita ou remove uma missão como administrador. |
| `POST /progressos` | Registra a conclusão da missão indicada em `missao_id`. |
| `GET /progressos` | Lista as suas conclusões. Administradores podem ver todas e usar `?meus=1` para ver só as próprias. |
| `PUT /progressos/:id` | Atualiza `data` de uma conclusão. Aceita `AAAA-MM-DD` ou uma data e hora ISO 8601 com fuso. |

As rotas protegidas usam o cabeçalho `Authorization: Bearer <token>`. A listagem de missões informa se há outra página no cabeçalho `X-Tem-Proxima-Pagina`.

As rotas de escrita aceitam JSON e os erros retornam um campo `mensagem`. O código 409 indica conflito, como uma conclusão duplicada.
