const express = require("express");
const { authenticateJWT } = require("../../main/middlewares");
const cors = require("cors");
var pool = require("../../main/db");
const bodyParser = require("body-parser");
const apiRoute = express.Router();

apiRoute.use(cors());
apiRoute.use(authenticateJWT);
apiRoute.get("/", (req, res) => {
	res.json("Bem vindo ao servidor Api Node");
});

apiRoute.get("/equipamentos", (req, res, next) => {
	if (req) {
		const table = req.query.table;
		const where = req.query.filter && `WHERE ${req.query.filter}`;
		const order = req.query.order && req.query.order.split(":");
		const orderBy = order && order[0];
		const orderDirection = order && order[1];
		const OrderByDirection =
			(orderDirection &&
				` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`) ||
			"";

		pool.query(
			"SELECT * FROM " + table + " pv " + where + "" + OrderByDirection + "",
			(err, results) => {
				if (err) {
					console.error("Erro ao executar a consulta:", err);
					res.status(500).send("Erro ao consultar o banco de dados");
				} else {
					res.json(results);
					pool.close();
					process.exit(1, () => {
						console.log("Connection close success!");
					});
				}
			}
		);
	}
});

module.exports = apiRoute;
