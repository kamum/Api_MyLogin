
 teste
 SEQUENCIA PARA CRIAR PROJETO
Criar o arquivo package.

### npm init

Gerenciar requisições, rota e URLS, entre outras funcionalidades.
### npm install express

Instalar o módulo para reiniciar o servidor sempre que houver alteração no código fonte, o "g" sginifica globalmente.
### npm install -g nodemon

Verificar o banco de dados MySQL no pront de comando
### mysql -h localhost - u root -p

Instalar o Workbench para gerenciar o banco de dados de forma gráfica.

Comandos básicos de MySQL
Criar base de dados.
### create database "nome do banco" set utf8mb4 collate utf8mb4_unicode_ci;

Criar a tabela.

### CREATE TABLE `users`(
###	 `id` int NOT NULL AUTO_INCREMENT,
###	 `name` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
###	 `email` varchar(220) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
###	 PRIMARY KEY (`id`)
### )ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci

Selecionar registro no banco de dados.
### SELECT id, name, email FROM users;

Cadastrar registro no banco de dados
### INSERT INTO users (name, email) VALUE ('Jonathan', 'jonathanmundi@gmail.com');

Limitar quantidade de registros selecionados no banco de dados.
### SELECT id, name, email, From users LIMIT 3;

Limitar quantidade de registros selecionados no banco de dados e indicar o inicio
### SELECT id, name, email FROM users LIMIT 2 OFFSET 4;
Exemplo:
pg 1 = 1, 2
pg 2 = 3,4
pg 3 = 5,6

Acrescentar codição na busca de registro
### SELECT id, name, email FROM users WHERE email = 'jonathanmundi@gmail.com' LIMIT 1;

Acrescentar mais de uma condição na busca de registros.
### SELECT id, name, email FROM users WHERE email = 'jonathanmundi@gmail.com' AND name= 'Jonathan' LIMIT 1;
### SELECT id, name, email FROM users WHERE email = 'jonathanmundi@gmail.com' OR name= 'Jonathan' LIMIT 1;

Ordenar os registro retornado do banco de dados
### SELECT id, name, email FROM users ORDER BY id ASC; 
### SELECT id, name, email FROM users ORDER BY id DESC;

Editar registro do banco de dados
### UPDATE users SET name = 'Jonathan3a', email='jonathan3a@gmail.com.br' WHERE id =3;

Deletar os registros do banco de dados
### DELETE FROM users WHERE id=7;

Sequelize é uma biblioteca Javascript que facilita o gerenciamento de um banco de dados SQL
### npm install --save sequelize

Instalar o drive do banco de dados
### npm install --save mysql2


Instalar o módulo para criptografar as senhas
### npm install --save bcryptjs

Instalar a dependência para JWT
### npm install --save jsonwebtoken

Gerenciar variáveis de ambiente
### npm install --save dotenv

Permitir acesso a API
### npm install --save cors

Validar campo de registro de usuário
### npm install --save yup

Módulo para enviar email
### npm install --save nodemailer

Multer é um middleware node.js para manipulação multipart/form-data, que é usado principalmente para fazer upload de arquivos.
### npm install --save multer