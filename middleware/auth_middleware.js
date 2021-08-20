const jwt = require('jsonwebtoken')

module.exports = {
    auth:
        function auth(req, res, next) {
            const authToken = req.headers['authorization']
            if (authToken) {
                const token = authToken.split(' ')
                if (token[1]) {
                    jwt.verify(token[1], 'testeJWT', (err, data) => {
                        if (err) {
                            res.json({ error: 'Token inválido' }).status(401)
                        } else {
                            req.loggedUser = {
                                email: data.email,
                                id: data.id
                            }
                            next()
                        }
                    })
                } else {
                    res.json({ error: "Token vazio" }).status(401)
                }

            } else {
                res.json({ error: 'Sem cabeçalho de token' }).status(401)
            }
        }
}