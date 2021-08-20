const express = require('express')
const route = express.Router()
const UserModel = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const authMiddleware = require('../middleware/auth_middleware')

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'upload/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
})
const upload = multer({ storage })

route.get("/", function (req, res) {
    res.send('<h1> Bem vindo ao api :3 </h1>')
})
route.get('/user/:id?', authMiddleware.auth, (req, res) => {
    id = req.params.id
    if (id) {
        if (isNaN(id)) {
            res.status(400).json({ error: 'Não é um número ' + id })
        } else {
            id = parseInt(id)
            UserModel.findByPk(id, { raw: true }).then(user => {
                if (user) {
                    delete user.password
                    res.status(200).json(user)
                } else {
                    res.status(404).json({ error: "Usuário não encontrado" })
                }
            })
        }
    } else {
        UserModel.findAll({
            raw: true, order: [
                ['id', 'desc']
            ]
        }
        ).then(users => {
            users.forEach(user => {
                delete user.password
            })
            res.status(200).json(users)
        })
    }

})

route.post('/upload', authMiddleware.auth, upload.array('img'), (req, res) => {
    let files = {
        size: [],
        name: []
    }
    for (var file of req.files) {
        files.size.push(file.size)
        files.name.push(file.originalname)
    }
    res.status(200).json(files)
})


route.post('/user', (req, res) => {
    const { email, nick_name, name, password } = req.body
    let salt = bcrypt.genSaltSync(10)
    let hash = bcrypt.hashSync(password, salt)
    UserModel.create({
        email, nick_name, name, password: hash
    }).then(() => {
        console.log('criado com sucesso')
        res.status(201).json(req.body)
    }).catch(e => {
        console.log(e.message)
        res.status(404).json({ error: e.errors.map(err => err.message) })
    })
})

route.post('/auth', (req, res) => {
    let { password, email } = req.body
    UserModel.findOne({
        where: {
            email
        }
    }).then(user => {
        if (!user) {
            res.status(404).json({ error: 'usuario não encontrado' })
        } else {
            let compare = bcrypt.compareSync(password, user.password)
            if (compare) {
                delete user.password
                jwt.sign({ id: user.id, email: user.email }, 'testeJWT', { expiresIn: '2h' }, (err, token) => {
                    if (err) {
                        res.json(err).status(401)
                    } else {
                        res.json(token).status(200)
                    }
                })
            } else {
                res.send('usuario não encontrado').status(404)
            }
        }
    }).catch(e => {
        res.status(400).json({ error: e.errors.map(err => err.message) })
    })
})

route.put('/user/:id', authMiddleware.auth, (req, res) => {
    id = req.params.id
    if (id) {
        if (isNaN(id)) {
            res.send('Isso não é um numero' + id).status(400)
        } else {
            id = parseInt(id)
            UserModel.update(
                req.body,
                { where: { id }, plane: true },
            ).then(() => {
                res.json('Usuário atualizado').status(200)
            }).catch(e => {
                console.log(e)
                res.status(400).json({ error: e.message })
            })
        }
    } else {
        res.status(400).json({ error: 'Id é obrigatorio' })
    }
})

route.delete('/user/:id', authMiddleware.auth, (req, res) => {
    id = req.params.id
    if (isNaN(id)) {
        res.status(400).json({ error: 'Isso não é um numero' + id })
    } else {
        id = parseInt(id)
        UserModel.findByPk(id).then(user => {
            if (!user) {
                res.status(404).json({ error: 'Usuário não encontrado ' + id })
            } else {
                res.send('Usuário  encontrado ' + id).status(200)
                UserModel.destroy(
                    {
                        where: {
                            id
                        }
                    }
                )
            }
        }).catch(e => {
            res.status(404).json({ error: e.message })
        })

    }
})

module.exports = route