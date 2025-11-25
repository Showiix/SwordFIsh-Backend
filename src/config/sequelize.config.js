require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'swordfish_db',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '+08:00'
  },
  test: {
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'swordfish_test',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '+08:00'
  },
  production: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: 'mysql',
    dialectOptions: {
      charset: 'utf8mb4',
      collate: 'utf8mb4_unicode_ci'
    },
    timezone: '+08:00',
    logging: false
  }
};
