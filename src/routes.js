const router = require("express").Router();
const jwt = require("jsonwebtoken");
const mqttClient = require(".");
var pool = require("../main/db");
const jwtSecret = `Bearer ${process.env.SERVER_SECRET_KEY}`;
const cors = require("cors");
router.use(cors());
function verifyToken(req, next) {
	const token = req.headers?.authorization;
	console.log({ token, jwtSecret });

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

	if (verify) {
		pool.query(
			"SELECT * FROM pointValues pv WHERE dataPointId = (SELECT id FROM dataPoints where xid = '8f4714_0')",
			(err, results) => {
				if (err) {
					console.error("Erro ao executar a consulta:", err);
					res.status(500).send("Erro ao consultar o banco de dados");
				} else {
					res.json(results);
				}
			}
		);
	} else {
		res.json({
			error: "Acesso não permitido, credenciais inválidads",
			status: 401,
		});
	}
});

module.exports = router;
