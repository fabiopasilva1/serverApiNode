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
let lastSubscribedTopic = null;
io.use(socketAuthenticateJWT);

io.on("connection", (socket) => {
	if (lastSubscribedTopic) {
		socket.emit("Mensagem-inicial", lastSubscribedTopic);
		mqttClient.subscribe(lastSubscribedTopic);
	}
	socket.on("subscribeToMqtt", (topic) => {
		if (lastSubscribedTopic === null && topic) {
			console.log("inscrito no topico ", topic);
			mqttClient.subscribe(topic);
			lastSubscribedTopic = topic;
		} else if (lastSubscribedTopic && topic) {
			console.log(
				"desinscrito do topico",
				lastSubscribedTopic,
				"inscrito no tópico ",
				topic
			);
			mqttClient.unsubscribe(lastSubscribedTopic);
			mqttClient.subscribe(topic);
			lastSubscribedTopic = topic;
		} else if (lastSubscribedTopic && !topic) {
			mqttClient.subscribe(lastSubscribedTopic);
		} else if (!lastSubscribedTopic && !topic) {
			mqttClient.unsubscribe("", () => {
				console.log("Desinscrito de todos os tópicos");
			});
		}
	});
	socket.on("unsubscribeFromMqtt", (topic) => {
		console.log(
			`Cliente desinscrito no tópico MQTT: ${topic || lastSubscribedTopic}`
		);
		mqttClient.unsubscribe(topic || lastSubscribedTopic);
	});
	socket.on("disconnect", () => {
		console.log(lastSubscribedTopic, "Disconectado");
		mqttClient.unsubscribe(lastSubscribedTopic);
		lastSubscribedTopic = null;
	});
	console.log("Cliente conectado via Socket.IO", socket.client.id);

	const uniqueMessages = new Set();
	mqttClient.on("message", (mqttTopic, message) => {
		const messageString = message.toString();
		console.log(`Mensagem recebida no tópico ${mqttTopic}: ${messageString}`);

		if (!uniqueMessages.has(messageString)) {
			uniqueMessages.add(messageString);
			io.emit("mqttMessage", { topic: mqttTopic, message: messageString });
			console.log("Enviando mensagem única via Socket.IO.");
		} else {
			console.log("Mensagem repetida, ignorando.");
		}
	});
	setInterval(() => {
		uniqueMessages.clear();
	}, 5000);
});

server.listen(port, () => {
	console.log(
		`Application run in ${
			process.env.SERVER_HOST || "http://localhost"
		}:${port}`
	);
});
