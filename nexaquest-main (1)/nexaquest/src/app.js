const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const usuarioRoutes = require('./routes/usuarioRoutes');
const authRoutes = require('./routes/authRoutes');
const missaoRoutes = require('./routes/missaoRoutes');
const progressoRoutes = require('./routes/progressoRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(usuarioRoutes);
app.use(authRoutes);
app.use(missaoRoutes);
app.use(progressoRoutes);

sequelize.authenticate()
  .then(() => console.log('Conectado ao banco de dados Nexa Quest'))
  .catch(err => console.error('Erro ao conectar no banco:', err));

sequelize.sync();

app.listen(3000, () => console.log('Servidor rodando em http://localhost:3000'));
