# Nexa Quest

O Nexa Quest é o projeto integrador da Nexa Play. A plataforma incentiva a prática de Libras com missões que rendem pontos, níveis e conquistas.

**Site publicado** — aguardando hospedagem. **Teste local** — [http://localhost:3000](http://localhost:3000) depois da instalação.

## Funcionalidades

- Cadastro, login e painel com progresso individual.
- Missões com busca, paginação e gestão por administradores.
- Uma recompensa por missão concluída e um nível a cada 100 pontos.
- Jornadas concluídas quando o participante termina todas as missões que fazem parte delas no catálogo atual.
- Medalhas por primeira missão, nível 2 e jornada completa.
- Desafio extra de Libras liberado no nível 2 e opção de compartilhar o resumo de conquistas.
- Histórico de conclusões e correção de datas.

## Tecnologias

HTML, CSS e JavaScript no navegador. Node.js e Express na API REST. Sequelize com MySQL para persistência, JWT para autenticação e bcrypt para hash de senhas.

## Documentação

- [Instalação e uso](arquivos-adicionais/instalacao-e-uso.md)
- [Modelagem conceitual](docs/modelagem-conceitual.md)
- [Modelagem lógica](docs/modelagem-logica.md)
- [Diagrama entidade-relacionamento](docs/der.md)
- [Scripts SQL de estrutura e carga inicial](arquivos-adicionais/)
- [Referência da API](docs/api.md)

Execute `npm test` para rodar os testes automatizados. O guia de instalação inclui um roteiro de validação com MySQL.
