require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mqtt = require("mqtt");
const jwt = require("jsonwebtoken");
const app = express();
const indexRoute = require("./routes");
const server = http.createServer(app);
const io = socketIo(server, { cors: "*" });
const port = process.env.SERVER_PORT || 3001;
const mqttBrocker = process.env.MQTT_BROKER_HOST || "127.0.0.1";
const mqttConfig = {
	username: process.env.MQTT_USERNAME || "",
	password: process.env.MQTT_PASSWORD || "",
};
const mqttClient = mqtt.connect(`mqtt://${mqttBrocker}`, mqttConfig);
const jwtSecret = process.env.SERVER_SECRET_KEY;
// Middleware para autenticar o token JWT
// Middleware para autenticar o token JWT
function verifyToken(socket, next) {
	const token = socket && socket.handshake?.auth?.token;

	if (!token) {
		return next && next(new Error("Token JWT ausente"));
	}
	try {
		return jwt.verify(token, jwtSecret);
	} catch (err) {
		return next && next();
	}
}
app.use("/", indexRoute);
const auth = verifyToken();
io.use(verifyToken);

io.on("connection", (socket) => {
	console.log("Cliente conectado via Socket.IO");

	socket.on("subscribeToMqtt", (topic) => {
		console.log(`Cliente inscrito no tópico MQTT: ${topic}`);
		mqttClient.subscribe(topic);
	});

	mqttClient.on("message", (mqttTopic, message) => {
		io.emit("mqttMessage", { message: message.toString() });
	});
});

server.listen(port, () => {
	console.log("Servidor Socket.IO e MQTT rodando na porta ", port);
});
