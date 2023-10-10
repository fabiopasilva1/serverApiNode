const express = require("express");

const indexRoute = express.Router();

indexRoute.get("/", (req, res) => {
	res.send("Bem vindo ao servidor Api Node");
});

module.exports = indexRoute;
