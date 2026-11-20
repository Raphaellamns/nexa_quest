const path = require('node:path');
const { Sequelize } = require('sequelize');

require('dotenv').config({ path: path.join(__dirname, '../../.env'), quiet: true });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'nexaquest',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD ?? '',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
    ...(process.env.DB_SSL === 'true' && {
      dialectOptions: { ssl: { minVersion: 'TLSv1.2', rejectUnauthorized: true, verifyIdentity: true } },
    }),
  }
);

module.exports = sequelize;
