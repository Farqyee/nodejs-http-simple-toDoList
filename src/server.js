// server.js

// Load environmental variables and required modules
require("dotenv").config(); // Ensure environment variables are loaded
const http = require("http"); // Create a server
const fs = require("fs"); // Handle file system operations
const path = require("path"); // Handle file and directory paths

// Import custom modules for handling authentication and tasks
const {
	loginUser,
	registerUser,
	checkUsername,
	cekSession,
} = require("./auth");
const { addTodo, deleteTodo, getTodos, editTodo } = require("./todo");
const { connectDB } = require("./database");

// Function to handle all incoming HTTP requests
async function handleRequest(req, res) {
	// Log the incoming request for debugging purposes
	console.log(`Received request: Method - ${req.method}, URL - ${req.url}`);

	if (req.method === "GET" && req.url === "/") {
		// Serve the main HTML page
		fs.readFile("./public/index.html", (err, data) => {
			if (err) {
				res.writeHead(500);
				res.end("Server error");
				return;
			}
			res.writeHead(200, { "Content-Type": "text/html" });
			res.write(data);
			res.end();
		});
	} else if (req.method === "GET" && req.url === "/login") {
		// Serve login page if not logged in
		const isLogged = await cekSession(req, res);
		if (isLogged) {
			res.writeHead(302, { location: "/todo" });
			res.end();
			return;
		}
		fs.readFile("./public/auth.html", (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-type": "application/json" });
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200, { "Content-Type": "text/html" });
			res.end(data);
		});
	}
	// Other handlers for routes and methods, including /register, /todo, etc.
	// Recommended: Move each case into separate route files
	else if (req.method === "POST" && req.url === "/register") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", async () => {
			const { username, password } = JSON.parse(body);
			const isReg = await checkUsername(username);
			if (isReg) {
				try {
					await registerUser(username, password);
					res.writeHead(201, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ message: "User Registered Succesfully" }));
				} catch (err) {
					res.writeHead(500, { "Content-Type": "application/json" });
					res.end(JSON.stringify({ error: err.message }));
				}
			} else {
				res.writeHead(409, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "User already registered" }));
			}
		});
	} else if (req.method === "POST" && req.url === "/login") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", async () => {
			const { username, password } = JSON.parse(body);
			const isAuth = await loginUser(username, password);
			if (isAuth) {
				res.writeHead(200, {
					"Content-Type": "application/json",
					"Set-Cookie": `session=${username}; Secure; SameSite=Strict`,
					//Httponly cookies' purpose is being inaccessible by script.
					location: "/todo",
				});
				console.log(`sessions object = ${JSON.stringify(username)}`);
				res.end(
					JSON.stringify({
						message: `User is logged in`,
					})
				);
			} else {
				res.writeHead(401, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "Invalid Credentials" }));
			}
		});
	} else if (req.method === "POST" && req.url === "/todo") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", async () => {
			const { username, task } = JSON.parse(body);
			try {
				await addTodo(username, task);
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: "Task added" }));
			} catch (err) {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: err.message }));
			}
		});
	} else if (req.method === "GET" && req.url.startsWith("/todo")) {
		const isLogged = await cekSession(req, res);
		if (!isLogged) {
			res.writeHead(302, { location: "/login" });
			res.end();
			return;
		}
		fs.readFile("./public/todo.html", (err, data) => {
			if (err) {
				res.writeHead(404, { "Content-type": "application/json" });
				res.end(JSON.stringify(err));
				return;
			}
			res.writeHead(200, { "Content-Type": "text/html" });
			res.end(data);
		});
		// const username = req.url.split("?username=")[1];
		// console.log("hi");
		// try {
		//   const todos = await getTodos(username);
		//   res.writeHead(200, { "Content-Type": "application/json" });
		//   res.end(JSON.stringify(todos));
		// } catch (error) {
		//   res.writeHead(500, { "Content-Type": "application/json" });
		//   res.end(JSON.stringify({ error: error.message }));
		// }
	} else if (req.method === "GET" && req.url === "/getTodo") {
		try {
			const username = await cekSession(req, res);
			const data = await getTodos(username);
			if (data.length != 0) {
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify(data));
			} else {
				res.writeHead(404, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: "data not found" }));
			}
		} catch (e) {
			console.log(e);
		}
	} else if (req.method === "PUT" && req.url === "/todo") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", async () => {
			const { _id, username, task } = JSON.parse(body);
			try {
				await editTodo(username, _id, task);
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: "Task Updated" }));
			} catch (err) {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ error: err.message }));
			}
		});
	} else if (req.method === "DELETE" && req.url === "/todo") {
		let body = "";
		req.on("data", (chunk) => (body += chunk));
		req.on("end", async () => {
			const { _id, username } = JSON.parse(body);
			try {
				await deleteTodo(_id, username);
				res.writeHead(200, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: "Task Deleted" }));
			} catch (error) {
				res.writeHead(500, { "Content-Type": "application/json" });
				res.end(JSON.stringify({ message: error.message }));
			}
		});
	}
	// Serve static files (CSS, JS, etc.)
	else if (
		req.method === "GET" &&
		/\.(html|css|js|png|jpg|gif|ico)$/i.test(req.url)
	) {
		fs.readFile("./public" + req.url, function (err, data) {
			if (!err) {
				var dotoffset = req.url.lastIndexOf(".");
				var mimetype =
					dotoffset == -1
						? "text/plain"
						: {
								".html": "text/html",
								".ico": "image/x-icon",
								".jpg": "image/jpeg",
								".png": "image/png",
								".gif": "image/gif",
								".css": "text/css",
								".js": "text/javascript",
						  }[req.url.substr(dotoffset)];
				res.setHeader("Content-type", mimetype);
				res.end(data);
				console.log(req.url, mimetype);
			} else {
				console.log("file not found: " + req.url);
				res.writeHead(404, "Not Found");
				res.end();
			}
		});
	}
	// Handle all other cases
	else {
		res.writeHead(404, { "Content-Type": "text/plain" });
		res.end("Not Found");
	}
}

// Start the server after connecting to the database
async function startServer() {
	try {
		await connectDB(); // Establish a connection to the database
		const server = http.createServer(handleRequest); // Create an HTTP server instance
		const port = process.env.port || 3000;
		server.listen(port, () => {
			console.log(`Server running on http://localhost:${port}`);
		});
	} catch (err) {
		console.error("Error starting server:", err.message);
	}
}

startServer();
