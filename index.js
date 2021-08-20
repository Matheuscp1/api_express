var http = require('http')
const express = require('express')
const app = express()
const route = require('./router/router')
const sequelize = require('./database/connection')
const UserModel = require('./models/User')

sequelize.authenticate().then(() => {
    console.log('Conexão estabelicida.')
}).catch((error) => {

    console.error('Erro na conexão:', error);
})


/* http.createServer(app).listen(80, () => {
    console.log('servindo funfando na porta:' )
}) */

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(express.static('public'))
app.use(route)
app.listen(8080, (erro) => {
    if (erro) {
        console.log(erro)
    } else {
        console.log("Servidor inicia na porta")
    }
})