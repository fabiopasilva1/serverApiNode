require("dotenv").config();
const jwtSecret = process.env.SERVER_SECRET_KEY;
const jwt = require("jsonwebtoken");

// Middleware para autenticar o token JWT
const authenticateJWT = (socket, next) => {
	const token = socket.headers.authorization.split(" ")[1];

	if (!token) {
		return socket.next(new Error("Token JWT ausente"));
	}

	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			return socket.next(new Error("Falha na autenticação JWT"));
		}

		// Adicione dados do usuário decodificado ao objeto do socket para uso posterior, se necessário
		socket.decoded = decoded;
		socket.next();
	});
};
const socketAuthenticateJWT = (socket, next) => {
	const token = socket.handshake?.auth.token;

	if (!token) {
		return next(new Error("Token JWT ausente"));
	}

	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			return next(new Error("Falha na autenticação JWT"));
		}

		// Adicione dados do usuário decodificado ao objeto do socket para uso posterior, se necessário
		socket.decoded = decoded;
		next();
	});
};

module.exports = { authenticateJWT, socketAuthenticateJWT };
