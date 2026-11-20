# Instalação e uso

1. Instale Node.js 20 ou superior e MySQL 8.0.16 ou superior. Abra o terminal na pasta do projeto.
2. Execute o arquivo inteiro [nexaquestdb.sql](nexaquestdb.sql) no MySQL Workbench ou no terminal MySQL. Ele cria e seleciona o banco, cria as tabelas e insere três missões de Libras para demonstração.
3. Prepare a configuração no PowerShell.

   ```powershell
   npm ci
   Copy-Item .env.example .env
   node -p "require('node:crypto').randomBytes(32).toString('hex')"
   ```

   Mantenha o `.env` existente se já houver um. No macOS ou Linux, use `cp .env.example .env`.

4. Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER` e `DB_PASSWORD`. Cole a chave gerada em `JWT_SECRET`. Execute `npm start` e abra [http://localhost:3000](http://localhost:3000).

O Sequelize cria tabelas que estiverem faltando e adiciona o índice único das conclusões. Se a base antiga tiver duplicatas no par usuário–missão, revise o histórico e a pontuação num backup antes de criar o índice.

## Roteiro de uso

1. Cadastre uma conta e entre. O Painel deve mostrar o nível 1 e zero pontos.
2. Em **Missões**, conclua as duas atividades de **Primeiros passos em Libras**. Cada uma rende 50 pontos.
3. Volte ao **Painel** e confira o nível 2, os 100 pontos e as duas missões na lista de concluídas.
4. Crie outra conta e execute `npm run tornar-admin -- seu-email@exemplo.com` no terminal. Entre novamente com essa conta para cadastrar, editar ou remover missões.
5. Uma missão removida aparece como **Missão removida** no histórico. O saldo permanece.

## Publicação

Use um serviço Node.js com HTTPS e conexão a um MySQL persistente. Configure `npm ci` para instalação, `npm start` para iniciar, e as variáveis de `.env.example` nos segredos do serviço. Execute a estrutura e a carga inicial do banco na instância de hospedagem. Valide cadastro, login e conclusão de missão pelo endereço público antes de registrar o link no README. Mantenha `.env` fora do Git.
