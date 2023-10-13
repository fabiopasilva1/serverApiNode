const express = require("express");
const { authenticateJWT } = require("../../main/middlewares");
const cors = require("cors");
var { driver, createPostgresPool, createMysqlPool } = require("../../main/db");
const bodyParser = require("body-parser");
const apiRoute = express.Router();
console.log(driver);
apiRoute.use(cors());
apiRoute.use(authenticateJWT);
apiRoute.get("/", (req, res) => {
	res.json("Bem vindo ao servidor Api Node");
});
let pool;
apiRoute.get("/equipamentos", (req, res, next) => {
	if (req) {
		if (driver === "postgres") {
			console.log("Conectando... ", driver);
			pool = createPostgresPool();
		} else if (driver === "mysql") {
			console.log("Conectando...", driver);
			pool = createMysqlPool();
		} else {
			console.error("Tipo de banco de dados não suportado:", driver, error);
			process.exit(1);
		}
		// Adiciona um ouvinte de evento de erro para lidar com desconexões
		pool.on("error", (err) => {
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
					pool = createMysqlPool(); // Atualize a variável pool aqui
				}, 3000);
			} else {
				throw err;
			}
		});
		pool.on("connect", () => {
			console.log("Conexão inicial estabelecida com sucesso! driver:", driver);
		});
		if (pool) {
			pool.on("connect", () => {
				console.log(
					"Conexão inicial estabelecida com sucesso! driver:",
					driver
				);
			});
		}
		const table = req.query.table;
		const where = req.query.filter && `WHERE ${req.query.filter}`;
		const order = req.query.order && req.query.order.split(":");
		const orderBy = order && order[0];
		const orderDirection = order && order[1];
		const OrderByDirection =
			(orderDirection &&
				` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`) ||
			"";

		pool &&
			pool
				.promise()
				.query(
					"SELECT * FROM " + table + " pv " + where + "" + OrderByDirection + ""
				)
				.then(([rows, fields]) => {
					res.json(rows);
				})
				.catch(console.log);
	}
});

apiRoute.get("/historico", (req, res, next) => {
	if (req) {
		if (driver === "postgres") {
			console.log("Conectando... ", driver);
			pool = createPostgresPool();
		} else if (driver === "mysql") {
			console.log("Conectando...", driver);
			pool = createMysqlPool();
		} else {
			console.error("Tipo de banco de dados não suportado:", driver, error);
			process.exit(1);
		}
		// Adiciona um ouvinte de evento de erro para lidar com desconexões
		pool.on("error", (err) => {
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
					pool = createMysqlPool(); // Atualize a variável pool aqui
				}, 3000);
			} else {
				throw err;
			}
		});
		pool.on("connect", () => {
			console.log("Conexão inicial estabelecida com sucesso! driver:", driver);
		});
		if (pool) {
			pool.on("connect", () => {
				console.log(
					"Conexão inicial estabelecida com sucesso! driver:",
					driver
				);
			});
		}
		const table = req.query.table;
		console.log(table);
		const where = (req.query.filter && `WHERE ${req.query.filter}`) || "";
		const order = req.query.order && req.query.order.split(":");
		const orderBy = order && order[0];
		const orderDirection = order && order[1];
		const OrderByDirection =
			(orderDirection &&
				` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`) ||
			"";

		pool &&
			pool
				.promise()
				.query(
					"SELECT * FROM " + table + " " + where + "" + OrderByDirection + ""
				)
				.then(([rows, fields]) => {
					res.json(rows);
				})
				.catch(console.log);
	}
});
module.exports = apiRoute;
