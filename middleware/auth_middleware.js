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
                            res.status(401).json({ error: 'Token inválido' })
                        } else {
                            req.loggedUser = {
                                email: data.email,
                                id: data.id
                            }
                            next()
                        }
                    })
                } else {
                    res.status(401).json({ error: "Token vazio" })
                }

            } else {
                res.status(401).json({ error: 'Sem cabeçalho de token' })
            }
        }
}