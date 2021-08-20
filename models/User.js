const Sequelize = require('sequelize')
const connection = require('../database/connection')

const User = connection.define('users', {
    name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: {
            msg: 'Email: já existe'
        },
        validate: {
            isEmail: {
                msg: "Email inválido"
            },
        }
    },
    nick_name: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },

})

User.sync({ force: false }).then(() => {
    console.log('Tabela criada')
}).catch(erro => { console.log('Erro na criação da tabela: ', erro) })

module.exports = User