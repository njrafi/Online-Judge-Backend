const fileOperation = require("../utils/fileOperation");

exports.postSubmitCode = async (req, res, next) => {
	console.log("In Submit Code");
	const code = req.body.code;
	const language = req.body.language;
	const timeLimit = req.body.timeLimit || 2;
	const input = req.body.input;
	console.log(code);
	console.log(language);
	console.log(input);

	try {
		let codeFilePath = await fileOperation.writeCodeToFile(code, language);
		console.log(codeFilePath);
	} catch (err) {
		console.log(err);
	}

	res.status(200).json({
		status: "Submitted",
	});
};
