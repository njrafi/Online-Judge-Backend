const { spawn, execFile } = require("child_process");
const stream = require("stream");

const compileFile = (filePath, language) => {
	console.log("Compiling ", language);
	return new Promise((resolve, reject) => {
		switch (language) {
			case "python":
				resolve(filePath);
				break;
			case "cpp":
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

exports.runCode = async (filePath, language, input, timeLimit) => {
	let compiledFile;
	try {
		compiledFile = await compileFile(filePath, language);
	} catch (err) {
		console.error(err);
		return;
	}

	const codeExecuterProcess = getExecuter(compiledFile, language);

	return new Promise((resolve, reject) => {
		let output = "";
		const timeout = setTimeout(() => {
			console.log("Timeout", codeExecuterProcess.pid);
			try {
				codeExecuterProcess.stdin.pause();
				codeExecuterProcess.kill();
			} catch (e) {
				console.error("Cannot kill process");
				reject("Cannot kill process");
			}
		}, timeLimit * 1000);

		codeExecuterProcess.stdout.on("data", (data) => {
			console.log(`stdout: ${data}`);
			output += data;
		});

		codeExecuterProcess.stderr.on("data", (data) => {
			clearTimeout(timeout);
			console.error(`stderr: ${data}`);
			reject(data);
		});

		codeExecuterProcess.on("close", (code) => {
			clearTimeout(timeout);
			console.log(`child process exited with code ${code}`);
			resolve(output);
		});

		const stdinStream = new stream.Readable();
		stdinStream.push(input); // Add data to the internal queue for users of the stream to consume
		stdinStream.push(null); // Signals the end of the stream (EOF)
		stdinStream.pipe(codeExecuterProcess.stdin);
	});
};
