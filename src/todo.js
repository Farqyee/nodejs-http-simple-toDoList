const { ObjectId } = require("mongodb");
const { getDB } = require("./database");

async function addTodo(username, task) {
	const db = getDB();
	await db.collection("todos").insertOne({ username, task });
	console.log("Task added");
}

async function getTodos(username) {
	const db = getDB();
	return await db.collection("todos").find({ username }).toArray();
}

async function deleteTodo(taskId, username) {
	const db = getDB();
	await db
		.collection("todos")
		.deleteOne({ _id: ObjectId.createFromHexString(taskId), username });
	console.log("Task Deleted");
}
async function editTodo(username, taskId, task) {
	const db = getDB();
	const query = {
		_id: ObjectId.createFromHexString(taskId),
		username: username,
	};
	const data = { $set: { username: username, task: task } };
	console.log(`Edit TODO : ${JSON.stringify(data)}`);
	console.log(`Query Edit TODO : ${JSON.stringify(query)}`);

	await db.collection("todos").updateOne(query, data);
}

module.exports = { getTodos, deleteTodo, addTodo, editTodo };
