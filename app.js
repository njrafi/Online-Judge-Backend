const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
require("dotenv").config();

const mongoDbUri = process.env.MONGO_DB_URI;
const app = express();
app.use(bodyParser.json());
const submissionRoutes = require("./routes/submission");

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, PATCH, DELETE"
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
	next();
});

app.use("/submit", submissionRoutes);

app.use("/", (req, res, next) => {
	const message = "Endpoint not found. Please Check documentation";
	res.status(200).json({
		message: message
	})
});

app.use((error, req, res, next) => {
	console.log(error);
	const status = error.statusCode || 500;
	const message = error.message || "Bad Request";
	const errorData = error.data || "Bad Request";
	res.status(status).json({
		message: message,
		errorData: errorData,
	});
});

mongoose
	.connect(mongoDbUri, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then((result) => {
		const port = parseInt(process.env.PORT) || 8080
		console.log("connected to mongoDb Database");
		console.log("server started at port " + port);
		app.listen(port);
	})
	.catch((err) => console.log(err));
