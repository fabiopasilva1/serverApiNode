const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mqttClient = require(".");
var pool = require("../main/db");
const jwtSecret = `Bearer ${process.env.SERVER_SECRET_KEY}`;
const cors = require("cors");
router.use(cors());
function verifyToken(req, next) {
	const token = req.headers?.authorization;

	if (!token) {
		throw new Error("Token JWT ausente");
	}
	try {
		if (token === jwtSecret) {
			return true;
		}
	} catch (error) {
		throw new Error("Token inválido");
	}
}

router.get("/api", (req, res, next) => {
	const verify = verifyToken(req, next);
	const table = req.query.table;
	const where = req.query.filter && `WHERE ${req.query.filter}`;
	const order = req.query.order && req.query.order.split(":");
	const orderBy = order[0];
	const orderDirection = order[1];
	const OrderByDirection = ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;
	console.log(req.query);
	if (verify) {
		pool.query(
			"SELECT * FROM " + table + " pv " + where + "" + OrderByDirection + "",
			(err, results) => {
				if (err) {
					console.error("Erro ao executar a consulta:", err);
					res.status(500).send("Erro ao consultar o banco de dados");
				} else {
					res.json(results);
				}
			}
		);
		// pool.query(`SELECT *  FROM ${table} pv ${where}`, (err, results) => {
		// 	if (err) {
		// 		console.error("Erro ao executar a consulta:", err);
		// 		res.status(500).send("Erro ao consultar o banco de dados");
		// 	} else {
		// 		res.json(results);
		// 	}
		// });
		// pool.query("show tables", (err, results) => {
		// 	if (err) {
		// 		console.error("Erro ao executar a consulta:", err);
		// 		res.status(500).send("Erro ao consultar o banco de dados");
		// 	} else {
		// 		res.json(results);
		// 	}
		// });
	} else {
		res.json({
			error: "Acesso não permitido, credenciais inválidads",
			status: 401,
		});
	}
});

module.exports = router;
