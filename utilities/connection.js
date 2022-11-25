const { Sequelize } = require('sequelize');
const config = require('../config/config').config

exports.connection = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: config.dialect,
    logging: false,
    dialectOptions: {
        multipleStatements: true
    },
    define: {
        timestamps: false
    }
}); 