const constants = require("./constants");
const fs = require("fs");
const path = require("path");
const customId = require("custom-id");

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
	const fileName = customId({}) + "." + getExtension(language); // update to random string
	const filepath = path.join(__dirname, "..", "sourceCodes", fileName);
	return new Promise((resolve, reject) => {
		fs.writeFile(filepath, code, (err) => {
			if (err) reject(err);
			resolve(filepath);
		});
	});
};

exports.deleteFile = (filepath) => {
	fs.unlink(filepath, (err) => {
		if (!err) console.log("File Delete Successful: ", filepath);
		else console.error(err);
	});
};
