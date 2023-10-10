const fs = require("fs");
const winston = require("winston");

const logger = winston.createLogger({
	format: winston.format.json(),
});
// Grava os logs em um arquivo
logger.add(
	new winston.transports.File({
		filename: "logs.json",
	})
);

module.exports = logger;
