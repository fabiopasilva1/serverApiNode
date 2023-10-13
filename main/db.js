require("dotenv").config();
const { Pool } = require("pg");
const mysql = require("mysql2");

const driver = process.env.DB_TYPE;

let pool;

function createPostgresPool() {
	return new Pool({
		user: process.env.DB_USERNAME,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});
}

function createMysqlPool() {
	return mysql.createConnection({
		user: process.env.DB_USERNAME,
		host: process.env.DB_HOST,
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: process.env.DB_PORT,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});
}

module.exports = { createPostgresPool, createMysqlPool, driver };
