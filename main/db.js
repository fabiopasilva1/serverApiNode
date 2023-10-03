require("dotenv").config();
const { Pool } = require("pg");
const mysql = require("mysql2");

const driver = process.env.DB_TYPE;

let pool;

if (driver === "postgres") {
	pool = new Pool({
		user: process.env.DB_USERNAME,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
	});
} else if (driver === "mysql") {
	pool = mysql.createConnection({
		user: process.env.DB_USERNAME,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
	});

	// Conectar ao banco de dados
	pool.connect((err) => {
		if (err) {
			console.error("Erro ao conectar ao MySQL:", err);
		} else {
			console.log("Conectado ao MySQL");
		}
	});
} else {
	console.error("Tipo de banco de dados não suportado:", driver);
	process.exit(1);
}

module.exports = pool;
