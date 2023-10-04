const router = require("express").Router();
const jwt = require("jsonwebtoken");
var pool = require("../main/db");
const jwtSecret = `Bearer ${process.env.SERVER_SECRET_KEY}`;
const cors = require("cors");
const bodyParser = require("body-parser");
const io = require(".");

router.use(cors());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
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

router.get("/api/equipamentos", (req, res, next) => {
	const verify = verifyToken(req, next);
	const table = req.query.table;
	const where = req.query.filter && `WHERE ${req.query.filter}`;
	const order = req.query.order && req.query.order.split(":");
	const orderBy = order[0];
	const orderDirection = order[1];
	const OrderByDirection = ` ORDER BY ${orderBy} ${orderDirection.toUpperCase()}`;

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
	} else {
		res.json({
			error: "Acesso não permitido, credenciais inválidads",
			status: 401,
		});
	}
});
const SECRET_KEY = process.env.SERVER_SECRET_KEY;
router.post("/login", (req, res) => {
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

module.exports = router;
