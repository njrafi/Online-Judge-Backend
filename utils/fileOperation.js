const constants = require("./constants");
const fs = require("fs");
const path = require("path");

getExtension = (language) => {
	switch (language) {
		case constants.languages.cpp:
			return "cpp";
		case constants.languages.python:
			return "py";
	}
};

exports.writeCodeToFile = (code, language) => {
	console.log("Writing code to file");
	const fileName = "new." + getExtension(language); // update to random string
	const filepath = path.join(__dirname, "..", "sourceCodes", fileName);
	return new Promise((resolve, reject) => {
		fs.writeFile(filepath, code, (err) => {
			if (err) reject(err);
			resolve(filepath);
		});
	});
};
