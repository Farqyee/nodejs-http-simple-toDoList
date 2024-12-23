const bcrypt = require("bcryptjs");
const { getDB } = require("./database");

async function checkUsername(username) {
	const db = getDB();
	const isReg = await db.collection("users").findOne({ username });
	if (isReg) {
		return false;
	}
	return true;
}
async function registerUser(username, password) {
	const db = getDB();
	const hash = await bcrypt.hash(password, 10);
	await db.collection("users").insertOne({ username, password: hash });
	console.log("user Registered");
}

async function loginUser(username, password) {
	const db = getDB();
	const user = await db.collection("users").findOne({ username });
	if (user && (await bcrypt.compare(password, user.password))) {
		console.log("Login success");
		return true;
	}
	console.log("Login failed");
	return false;
}
async function cekSession(req, res) {
	const sessionId = req.headers.cookie?.split("=")[1];
	if (sessionId) {
		return sessionId;
	}
	return false;
}
module.exports = { registerUser, loginUser, checkUsername, cekSession };
