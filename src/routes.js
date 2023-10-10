const router = require("express").Router();
const jwt = require("jsonwebtoken");
var pool = require("../main/db");
const jwtSecret = `${process.env.SERVER_SECRET_KEY}`;
const cors = require("cors");
const bodyParser = require("body-parser");
const io = require(".");

router.use(cors());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
// Middleware para autenticar o token JWT
const authenticateJWT = (socket) => {
	const token = socket.body.token || socket.headers.authorization.split(" ")[1];

	if (!token) {
		return socket.next(new Error("Token JWT ausente"));
	}

	jwt.verify(token, jwtSecret, (err, decoded) => {
		if (err) {
			return socket.next(new Error("Falha na autenticação JWT", err));
		}

		// Adicione dados do usuário decodificado ao objeto do socket para uso posterior, se necessário
		socket.decoded = decoded;
		return true;
	});
};

router.get("/api/equipamentos", (req, res, next) => {
	if (req && authenticateJWT) {
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
				}
			}
		);
	}
});
const SECRET_KEY = process.env.SERVER_SECRET_KEY;
router.post("/login", (req, res) => {
	const { token } = req?.body;

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
