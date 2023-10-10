require("dotenv").config();
const jwt = require("jsonwebtoken");

const express = require("express");
const bodyParser = require("body-parser");
const loginRoute = express.Router();
const SECRET_KEY = process.env.SERVER_SECRET_KEY;

loginRoute.use(bodyParser.json());
loginRoute.use(bodyParser.urlencoded({ extended: true }));

loginRoute.post("/", (req, res) => {
	const { token } = req?.body;
	console.log(token);
	if (token === SECRET_KEY) {
		// Lógica de autenticação, verificar credenciais do usuário, etc.
		const user = {
			id: 1,
			username: "ecoweb",
		};

		// Gerar token JWT
		const token = jwt.sign(user, SECRET_KEY);

		// Retornar o token para o cliente
		res.json({ token });
	} else {
		res.json({ error: 401 });
	}
});

module.exports = loginRoute;
