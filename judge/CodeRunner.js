const { spawn, execFile } = require("child_process");
const stream = require("stream");
const constants = require("../utils/constants");

const compileFile = (filePath, language) => {
	return new Promise((resolve, reject) => {
		if (!language) reject("No language Defined");
		if (!filePath) reject("No Filepath defined");
		console.log("Compiling ", language);
		switch (language) {
			case constants.languages.python:
				resolve(filePath);
				break;
			case constants.languages.cpp:
				// Command copied from toph
				const cppCompiler = spawn("g++", [
					"-static",
					"-s",
					"-x",
					"c++",
					"-O2",
					"-std=c++14",
					"-D",
					"ONLINE_JUDGE",
					filePath,
					"-lm",
				]);
				cppCompiler.stderr.on("data", (data) => {
					reject(data);
					console.error(`stderr: ${data}`);
				});

				cppCompiler.on("close", (code) => {
					console.log(`cppCompiler exited with code ${code}`);
					resolve("./a"); // change
				});

				break;
			default:
				reject("Language not recognized");
		}
	});
};

const getExecuter = (filePath, language) => {
	console.log("Executing " + language);
	switch (language) {
		case "python":
			return spawn("python", [filePath]);
		case "cpp":
			return execFile(filePath);
		default:
			return spawn("python", [filePath]);
	}
};

exports.runCode = async (filePath, language, input, timeLimit = 2) => {
	return new Promise(async (resolve, reject) => {
		// Compiling the file
		let compiledFile;
		try {
			compiledFile = await compileFile(filePath, language);
		} catch (err) {
			reject({
				verdict: constants.verdict.ce,
				output: String(err),
			});
			return;
		}

		// Executing the compiled file
		const codeExecuterProcess = getExecuter(compiledFile, language);

		// Setting time out
		const timeout = setTimeout(() => {
			console.log("Timeout", codeExecuterProcess.pid);
			try {
				codeExecuterProcess.stdin.pause();
				codeExecuterProcess.kill();
			} catch (e) {
				console.error("Cannot kill process");
			}
			reject({
				verdict: constants.verdict.tle,
				output: constants.verdict.tle,
			});
			return;
		}, timeLimit * 1000);

		// Getting output
		let output = "";
		codeExecuterProcess.stdout.on("data", (data) => {
			//console.log(`stdout: ${data}`);
			output += data;
		});

		// Any Other error
		codeExecuterProcess.stderr.on("data", (data) => {
			clearTimeout(timeout);
			console.error(`stderr: ${data}`);
			reject({
				verdict: constants.verdict.re,
				output: String(data),
			});
			return;
		});

		// Code run finished
		codeExecuterProcess.on("close", (code) => {
			clearTimeout(timeout);
			console.log(`child process exited with code ${code}`);
			resolve({
				verdict: constants.verdict.ac,
				output: output,
			});
		});

		// Setting the stdin
		const stdinStream = new stream.Readable();
		stdinStream.push(input); // Add data to the internal queue for users of the stream to consume
		stdinStream.push(null); // Signals the end of the stream (EOF)
		stdinStream.pipe(codeExecuterProcess.stdin);
	});
};
