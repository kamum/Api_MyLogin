const express = require("express")
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const {eAdmin} = require('./middlewares/auth')
const Usuario = require('./models/Usuario')
const app = express()

app.use(express.json())

app.use((req, res, next) => {
    res.header( 'Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'X-PINGOTHER,Content-Type, Authorization')
    res.header()
    app.use(cors())
    next()
})
app.use(cors())

app.get("/users/:page", eAdmin, async (req, res) => {

   const {page = 1} = req.params;
    const limit = 2;
    let lastPage = 1;

    const countUser = await Usuario.count();
    if(countUser === null){
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não encontrado."
        });
    }else {
        lastPage = Math.ceil (countUser / limit);
    }
    


    await Usuario.findAll({
        attributes: ['id', 'name', 'email', 'password'],
        order: [['id','ASC']],
        offset: Number((page * limit) - limit), 
        limit: limit
    })
    .then((users) => {
        return res.json({
            erro: false,
            users,
            countUser,
            lastPage
            
        })
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não encontrado."
        })
    })
   
})

app.get("/user/:id", eAdmin, async (req, res) => {
    const {id} = req.params
    //await Usuario.findAll({where: {id: id}})
    await Usuario.findByPk(id)
    .then((user) => {
        return res.json({
            erro: false,
            user: user
        })
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não cadastrado."
        })
    })
})

app.post("/user", eAdmin, async (req, res) => {
    let dados = req.body
    dados.password = await bcrypt.hash(dados.password, 8)

    await Usuario.create(dados)
    .then(() => {
        return res.json({
            erro: false,
            mensagem: "Usuário cadastrado com sucesso!"
        })

    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não cadastrado."
        })
    })
})

app.put("/user/", eAdmin, async (req, res) => {
    const { id } = req.body
    await Usuario.update(req.body, {where: {id: id}})
    .then(() => {
        return res.json({
            erro: false,
            mensagem: "Usuário editado com sucesso!"
        })
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não editado."
        })
    })
    return res.json({
        erro: false,
    })
})

app.put("/user-senha", eAdmin, async (req, res) => {
    const { id, password } = req.body

    let senhaCrypt = await bcrypt.hash(password, 8)

    await Usuario.update({password: senhaCrypt}, {where: {id: id}})
    .then(() => {
        return res.json({
            erro: false,
            mensagem: "senha alterada com sucesso!"
        })
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "A senha não pode ser alterada."
        })
    })
    return res.json({
        erro: false,
    })
})

app.delete("/user/:id", eAdmin, async (req, res) => {
    const {id} = req.params
    await Usuario.destroy({where: {id}})
    .then(() => {
        return res.json({
            erro: false,
            mensagem: "Usuário deletado com sucesso!"
        })
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não pode ser deletado."
        })
    })
    return res.json({
        erro: false,
        id
    })
})

app.post('/login', async (req, res) => {
    
    // await sleep(1000)

    // function sleep(ms){
    //     return new Promise((resolve) => {
    //         setTimeout(resolve, ms);
    //     })
    // }
    
    const usuario = await Usuario.findOne({
            attributes: ['id', 'name', 'email', 'password'],
            where: {
                email: req.body.email
            }}
        )
    if(usuario === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário ou senha incorreta."
        })
    }

    if(!(await bcrypt.compare(req.body.password, usuario.password))) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário ou senha incorreta."
        })
    }
    const token = jwt.sign({id: usuario.id}, process.env.SECRET,{
        //expiresIn: 600 // 10min
        expiresIn: '7d' // 7 dias
    })
    
    return res.json({
        erro: false,
        mensagem: "Login realizado com sucesso!.",
        token
    })
})

app.get("/val-token", eAdmin, async (req, res) => {
    await Usuario.findByPk(req.usuarioId, {attributes: ['id', 'name', 'email']})
    .then((usuario) => {
        return res.json({
            erro: false,
            usuario
        })
    }).catch(() => {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro. Necessário realizar o  login."
        })
    })
   
})


app.listen(8080, () => {
    console.log("Servidor inciado na porta 8080: http://localhost:8080")
})