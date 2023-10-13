require("dotenv").config();
const { Pool } = require("pg");
const mysql = require("mysql2");

const driver = process.env.DB_TYPE;

let pool;

function createPostgresPool() {
	return new Pool({
		user: process.env.DB_USERNAME,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});
}

function createMysqlPool() {
	const connection = mysql.createConnection({
		user: process.env.DB_USERNAME,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});

	// Adiciona um ouvinte de evento de erro para lidar com desconexões
	connection.on("error", (err) => {
		console.error("Erro na conexão MySQL:", err);
		if (
			err.code === "PROTOCOL_CONNECTION_LOST" ||
			err.code === "ETIMEDOUT" ||
			err.code === "ECONNRESET" ||
			err.code === "EHOSTUNREACH"
		) {
			console.log("Tentando reconectar ao ", driver);
			// Reconectar em caso de perda de conexão
			setTimeout(() => {
				pool = createMysqlPool();
			}, 3000);
		} else {
			throw err;
		}
	});
	connection.on("connect", () => {
		console.log("Conexão inicial estabelecida com sucesso! driver:", driver);
	});

	return connection;
}

if (driver === "postgres") {
	console.log("Conectando... ", driver);
	pool = createPostgresPool();
} else if (driver === "mysql") {
	console.log("Conectando...", driver);
	pool = createMysqlPool();
} else {
	console.error("Tipo de banco de dados não suportado:", driver);
	process.exit(1);
}

module.exports = pool;
