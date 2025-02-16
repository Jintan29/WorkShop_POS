const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('db_workshop_pos', 'postgres', '12345678', {
    host: 'localhost',
    dialect: 'postgres' ,
    logging: false // ไม่ต้อง log ออกมา
  });

module.exports = sequelize;