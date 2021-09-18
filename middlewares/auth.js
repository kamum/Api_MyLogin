const jwt = require('jsonwebtoken')
const {promisify} = require('util')
require('dotenv').config()

module.exports = {
    eAdmin: async function validarToken(req, res, next) {
        //return res.json({messagem: 'Validar token'})
        const authHeader = req.headers.authorization
        if (!authHeader) {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Necessário realizar o login para acessar a página!"
            });
        }
        
        const [bearer, token] = authHeader.split(' ')
    
        if(!token) {
            return res.status(400).json({
                erro: true,
                mensagem: 'Erro: Necessário realizar o login.'
            })
        }
    
        try{
            const decoded = await promisify(jwt.verify)(token, process.env.SECRET)
            req.usuarioId = decoded.id
            //req.levelAcess = decoded.levelAcess
            return next()
        }catch(err){
            return res.status(401).json({
                erro: true,
                mensagem: 'Erro: Necessário realizar o login.'
            })
        }
    }
}