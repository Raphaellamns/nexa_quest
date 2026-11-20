# Nexa Quest

O Nexa Quest é o projeto integrador da Nexa Play. A plataforma incentiva a prática de Libras com missões que rendem pontos e níveis.

**Site publicado** — aguardando hospedagem. **Teste local** — [http://localhost:3000](http://localhost:3000) depois da instalação.

## Funcionalidades

- Cadastro, login e painel com progresso individual.
- Missões com busca, paginação e gestão por administradores.
- Uma recompensa por missão concluída e um nível a cada 100 pontos.
- Painel com nível, pontos e lista de missões concluídas.

## Tecnologias

HTML, CSS e JavaScript no navegador. Node.js e Express na API REST. Sequelize com MySQL para persistência, JWT para autenticação e bcrypt para hash de senhas.

## Documentação

- [Instalação e uso](arquivos-adicionais/instalacao-e-uso.md)
- [Modelo conceitual editável no brModelo](docs/brmodelo/Nexa-Quest-Conceitual.brM3) · [Descrição](docs/modelagem-conceitual.md)
- [Modelo lógico editável no brModelo](docs/brmodelo/Nexa-Quest-Logico.brM3) · [Dicionário de dados](docs/modelagem-logica.md)
- [DER exportado do brModelo](docs/der.md)
- [Scripts SQL de estrutura e carga inicial](arquivos-adicionais/)
- [Referência da API](docs/api.md)

Execute `npm test` para rodar os testes automatizados. O guia de instalação inclui um roteiro de validação com MySQL.
