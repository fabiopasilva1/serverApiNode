require("dotenv").config();

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const mqtt = require("mqtt");
const app = express();

const indexRoute = require("../src/routes/indexRoute");
const loginRoute = require("../src/routes/loginRoute");
const apiRoute = require("../src/routes/apiRoute");
const { socketAuthenticateJWT } = require("../main/middlewares");

const server = http.createServer(app);
const io = socketIo(server, { cors: "*" });
const port = process.env.SERVER_PORT || 3000;

app.use(cors());
app.use("/", indexRoute);
app.use("/login", loginRoute);
app.use("/api", apiRoute);
app.use(socketAuthenticateJWT);
const mqttConfig = {
	protocol: "mqtt",
	username: process.env.MQTT_USERNAME || "",
	password: process.env.MQTT_PASSWORD || "",
	clientId: Math.random().toString(16).substring(2, 6),
};
const mqttBroker = process.env.MQTT_BROKER_HOST || "mqtt://localhost";
const mqttClient = mqtt.connect(mqttBroker, mqttConfig);
io.use(socketAuthenticateJWT);

io.on("connection", (socket) => {
	let lastSubscribedTopic = null;

	socket.on("subscribeToMqtt", (topic) => {
		if (lastSubscribedTopic !== topic) {
			if (lastSubscribedTopic) {
				console.log("Desinscrito do tópico:", lastSubscribedTopic);
				mqttClient.unsubscribe(lastSubscribedTopic);
			}

			if (topic) {
				console.log("Inscrito no tópico:", topic);
				mqttClient.subscribe(topic);
				lastSubscribedTopic = topic;
			}
		}
	});

	socket.on("disconnect", () => {
		if (lastSubscribedTopic) {
			console.log("Desconectado, desinscrito do tópico:", lastSubscribedTopic);
			mqttClient.unsubscribe(lastSubscribedTopic);
			lastSubscribedTopic = null;
		}
	});

	console.log("Cliente conectado via Socket.IO", socket.id);
});
mqttClient.on("message", (mqttTopic, message) => {
	const messageString = message.toString();
	console.log(`Mensagem recebida no tópico ${mqttTopic}: ${messageString}`);

	io.emit("mqttMessage", { topic: mqttTopic, message: messageString });
});
server.listen(port, () => {
	console.log(`Servidor rodando em http://localhost:${port}`);
});
