const express = require("express")
const cors = require('cors')
const yup = require('yup');
const nodemailer = require('nodemailer')
const { Op } = require('sequelize')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()
const fs = require('fs')
const path = require('path')

const { eAdmin } = require('./middlewares/auth')
const Usuario = require('./models/Usuario')
const upload = require('./middlewares/uploadImgProfile')

const app = express()

app.use(express.json())

app.use('/files', express.static(path.resolve(__dirname, "public", "upload")));

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'X-PINGOTHER,Content-Type, Authorization')
    res.header()
    app.use(cors())
    next()
})
app.use(cors())

app.get("/users/:page", eAdmin, async (req, res) => {

    const { page = 1 } = req.params;
    const limit = 20;
    let lastPage = 1;

    const countUser = await Usuario.count();
    if (countUser === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não encontrado."
        });
    } else {
        lastPage = Math.ceil(countUser / limit);
    }



    await Usuario.findAll({
        attributes: ['id', 'name', 'email', 'password'],
        order: [['id', 'DESC']],
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
    const { id } = req.params
    //await Usuario.findAll({where: {id: id}})
    await Usuario.findByPk(id)
        .then((user) => {
            if(user.image){
                var addressImage = process.env.URL_IMG + "/files/users/" + user.image;
            }else{
                var addressImage = process.env.URL_IMG + "/files/users/perfil-sem-foto-220615.png";
            }
            return res.json({
                erro: false,
                user: user,
                addressImage
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

    const schema = yup.object().shape({

        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
        email: yup.string("Erro: Necessário preencher o campo email!")
            .required("Erro: Necessário preencher o campo email!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")

    });

    try {
        await schema.validate(dados);
    } catch (err) {
        console.log(err)
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }

    /*if(!(await schema.isValid(dados))){
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Necessário preencher todos os campos."
        })
    }*/

    const user = await Usuario.findOne({
        where: {
            email: req.body.email,
        }
    })

    if (user) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Este email já está sendo usado."
        })
    }

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

    const schema = yup.object().shape({

        /* password: yup.string("Erro: Necessário preencher o campo senha!")
         .required("Erro: Necessário preencher o campo senha!")
         .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),*/
        email: yup.string("Erro: Necessário preencher o campo email!")
            .required("Erro: Necessário preencher o campo email!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")

    });

    try {
        await schema.validate(req.body);
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }

    const user = await Usuario.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: id
            }
        }
    })
    if (user) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Este email já está sendo usado."
        })
    }

    await Usuario.update(req.body, { where: { id } })
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

    const schema = yup.object().shape({

        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),

    });

    try {
        await schema.validate(req.body);
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }

    let senhaCrypt = await bcrypt.hash(password, 8)

    await Usuario.update({ password: senhaCrypt }, { where: { id } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "senha alterada com sucesso!"
            })
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "A senha não pode ser alterada."
            });
        });
});

app.delete("/user/:id", eAdmin, async (req, res) => {
    const { id } = req.params
    await Usuario.destroy({ where: { id } })
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
        }
    }
    )
    if (usuario === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário ou senha incorreta."
        })
    }

    if (!(await bcrypt.compare(req.body.password, usuario.password))) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário ou senha incorreta."
        })
    }
    const token = jwt.sign({ id: usuario.id }, process.env.SECRET, {
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
    await Usuario.findByPk(req.usuarioId, { attributes: ['id', 'name', 'email'] })
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

app.post("/add-user-login", async (req, res) => {
    var dados = req.body;

    const schema = yup.object().shape({
        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),
        email: yup.string("Erro: Necessário preencher o campo e-mail!")
            .email("Erro: Necessário preencher o campo e-mail!")
            .required("Erro: Necessário preencher o campo e-mail!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")
    });

    try {
        await schema.validate(dados);
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        });
    }

    const user = await Usuario.findOne({
        where: {
            email: req.body.email
        }
    });

    if (user) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Este e-mail já está cadastrado!"
        });
    }

    dados.password = await bcrypt.hash(dados.password, 8);

    await Usuario.create(dados)
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Usuário cadastrado com sucesso!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Usuário não cadastrado com sucesso!"
            });
        });
});

app.get("/view-profile", eAdmin, async (req, res) => {
    const id = req.usuarioId;

    await Usuario.findByPk(id)
        .then((user) => {

            if(user.image){
                var addressImage = process.env.URL_IMG + "/files/users/" + user.image;
            }else{
                var addressImage = process.env.URL_IMG + "/files/users/perfil-sem-foto-220615.png";
            }
            
            return res.json({
                erro: false,
                user: user,
                addressImage
            })
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Nenhum usuário encontrado!"
            });
        });
});

app.put("/edit-profile/", eAdmin, async (req, res) => {
    const id = req.usuarioId;

    const schema = yup.object().shape({

        email: yup.string("Erro: Necessário preencher o campo email!")
            .required("Erro: Necessário preencher o campo email!"),
        name: yup.string("Erro: Necessário preencher o campo nome!")
            .required("Erro: Necessário preencher o campo nome!")

    });

    try {
        await schema.validate(req.body);
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }

    const user = await Usuario.findOne({
        where: {
            email: req.body.email,
            id: {
                [Op.ne]: id
            }
        }
    })
    if (user) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Este email já está sendo usado."
        })
    }

    await Usuario.update(req.body, { where: { id } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Perfil editado com sucesso!"
            })
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "O Perfil não pode ser editado."
            });
        });
});

app.put("/edit-profile-password", eAdmin, async (req, res) => {
    const id = req.usuarioId;
    const { password } = req.body;

    const schema = yup.object().shape({

        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),

    });

    try {
        await schema.validate(req.body);
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }

    let senhaCrypt = await bcrypt.hash(password, 8)

    await Usuario.update({ password: senhaCrypt }, { where: { id } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "senha alterada com sucesso!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "A senha não pode ser alterada."
            });
        });
});

app.post('/recover-password', async (req, res) => {

    var dados = req.body;

    const usuario = await Usuario.findOne({
        attributes: ['id', 'name', 'email'],
        where: {
            email: dados.email
        }

    });
    if (usuario === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Usuário não encontrado."
        })
    };

    dados.recover_password = (await bcrypt.hash(usuario.id + usuario.name + usuario.email, 8)
    ).replace(/\./g, "").replace(/\//g, "");

    await Usuario.update(dados, { where: { id: usuario.id } })
        .then(() => {
            var transport = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            var message = {
                from: process.env.EMAIL_FROM_PASS,
                to: dados.email,
                subject: "Recuperar senha",
                text: "Prezado(a), Jonh\n\nVocê solicitou alteração de senha.\n\nPara continuar o processo de recuperação de sua senha, clique no link abaixo ou cole o endereço no seu navegador:" + dados.url + dados.recover_password + " \n\n Se você não solicitou essa alteração, nenhuma ação é necessária. Sua senha permanecerá a mesma até que você ative este código.\n\n",
                html: "Prezado(a), Jonh<br/><br/>Você solicitou alteração de senha.<br/><br/>Para continuar o processo de recuperação de sua senha, clique no link abaixo ou cole o endereço no seu navegador: <a href='" + dados.url + dados.recover_password + "'> " + dados.url + dados.recover_password + "</a><br/><br/> Se você não solicitou essa alteração, nenhuma ação é necessária. Sua senha permanecerá a mesma até que você ative este código.<br/><br/>"
            };

            transport.sendMail(message, function (err) {
                if (err) return res.status(400).json({
                    erro: true,
                    mensagem: "Erro: O email não pode ser enviado."
                });

                return res.json({
                    erro: false,
                    mensagem: "Uma mensagem foi enviada para o seu email!"
                });
            })
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: O email não pode ser enviado."
            });
        });

});

app.get('/val-key-recover-pass/:key', async (req, res) => {

    const { key } = req.params;

    const usuario = await Usuario.findOne({
        attributes: ['id'],
        where: {
            recover_password: key
        }

    });
    if (usuario === null) {
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Link inválido."
        })
    };

    return res.json({
        erro: false,
        mensagem: "Chave válida!",
    })

});

app.put('/update-password/:key', async (req, res) => {
    const { key } = req.params;
    const { password } = req.body

    const schema = yup.object().shape({

        password: yup.string("Erro: Necessário preencher o campo senha!")
            .required("Erro: Necessário preencher o campo senha!")
            .min(6, "Erro: A senha deve ter no mínimo 6 caracteres!"),

    });

    try {
        await schema.validate(req.body);
    } catch (err) {
        return res.status(400).json({
            erro: true,
            mensagem: err.errors
        })
    }

    let senhaCrypt = await bcrypt.hash(password, 8)

    await Usuario.update({ password: senhaCrypt, recover_password: null }, { where: { recover_password: key } })
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

});

app.put('/edit-profile-image', eAdmin, upload.single('image'), async (req,res) =>{
    
    if(req.file){

        await Usuario.findByPk(req.usuarioId)
        .then(usuario => {
            const oldImg = "./public/upload/users/" + usuario.dataValues.image;

            fs.access(oldImg, (err) => {
                if(!err){
                    fs.unlink(oldImg, () => {})
                }
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "Erro: Perfil não encontrado."
            });
        });
        await Usuario.update({image: req.file.filename}, { where: { id: req.usuarioId } })
        .then(() => {
            return res.json({
                erro: false,
                mensagem: "Imagem editada com sucesso!"
            });
        }).catch(() => {
            return res.status(400).json({
                erro: true,
                mensagem: "A imagem do usuário não foi editada."
            });
        })
    }else{
        return res.status(400).json({
            erro: true,
            mensagem: "Erro: Insira uma imagem válida JPG ou PNG!"
        });
    }    
});

app.listen(8080, () => {
    console.log("Servidor inciado na porta 8080: http://localhost:8080")
});