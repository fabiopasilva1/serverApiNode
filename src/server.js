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
const mqttBrocker = process.env.MQTT_BROKER_HOST || "127.0.0.1";
const mqttConfig = {
	username: process.env.MQTT_USERNAME || "",
	password: process.env.MQTT_PASSWORD || "",
	clientId: Math.random().toString(16).substring(2, 6),
};
const mqttClient = mqtt.connect(`mqtt://${mqttBrocker}`, mqttConfig);
// const mqttClient = mqtt.connect(`mqtt://localhost:1883`, mqttConfig);
app.use(cors());
app.use("/", indexRoute);
app.use("/login", loginRoute);
app.use("/api", apiRoute);

io.use(socketAuthenticateJWT);

io.on("connection", (socket) => {
	mqttClient.subscribe("ufm/dados/#", { qos: 2 });

	socket.on("disconnect", () => {
		console.log("Cliente desconectou", socket.id);
		socket.disconnect();
	});
	console.log("Cliente conectado via Socket.IO", socket.client.id);
	// Disconnect the socket after a certain event or condition

	const uniqueMessages = new Set();
	mqttClient.on("message", (mqttTopic, message) => {
		const messageString = message.toString();

		//console.log(`Mensagem recebida no tópico ${mqttTopic}: ${messageString}`);

		if (!uniqueMessages.has(messageString)) {
			uniqueMessages.add(messageString);
			console.log(`Mensagem recebida no tópico ${mqttTopic}: ${messageString}`);
			io.emit("mqttMessage", { topic: mqttTopic, message: messageString });
			console.log("Enviando mensagem única via Socket.IO.", socket.id);
		} else {
			console.log("Mensagem repetida, ignorando.");
		}
	});
	socket.on("disconnectSocket", () => {
		console.log("Disconnecting the socket", socket.id);
		mqttClient.unsubscribe("ufm/dados/#");
		socket.disconnect();
	});

	setInterval(() => {
		uniqueMessages.clear();
	}, 15000);
});

server.listen(port, () => {
	console.log(
		`Application run in ${
			process.env.SERVER_HOST || "http://localhost"
		}:${port}`
	);
});
