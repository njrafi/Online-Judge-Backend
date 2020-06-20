const fileOperation = require("../utils/fileOperation");
const codeRunner = require("../judge/CodeRunner");

exports.postSubmitCode = async (req, res, next) => {
	console.log("In Submit Code");
	const code = req.body.code;
	const language = req.body.language;
	const timeLimit = req.body.timeLimit || 2;
	const input = req.body.input;
	console.log(code);
	console.log(language);
	console.log(input);

	let codeFilePath = null;
	try {
		codeFilePath = await fileOperation.writeCodeToFile(code, language);
		console.log(codeFilePath);
	} catch (err) {
		next(err);
		return err;
	}

	try {
		const output = await codeRunner.runCode(
			codeFilePath,
			language,
			input,
			timeLimit
		);
		res.status(200).json({
			output: output,
        });
        return
	} catch (err) {
		next(err);
		return err;
	}
	res.status(200).json({
		status: "Submitted",
	});
};
