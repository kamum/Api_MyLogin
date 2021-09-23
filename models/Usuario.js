const Sequelize = require('sequelize')
const db = require('./db')

const Usuario = db.define('users', {
    id:{
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING
    },
    recover_password:{
        type: Sequelize.STRING
    },
    image: {
        type: Sequelize.STRING
    }
})

//Criar a tabela
//User.sync();

//Verifica se a alterações na tabela
//Usuario.sync({alter: true});

module.exports = Usuario;

