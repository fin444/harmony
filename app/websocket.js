import {tokenUser} from "./account.js"
import {db} from "./database.js"

const users = {}
const sockets = {}
var socketNum = 0

// helpers
function send(socket, type, data) {
	socket.send(JSON.stringify({type: type, ...data}))
}

// message types
const specs = {
	"token": {token: "string"}
}
const handlers = {
	"token": mToken
}

async function mToken(data, num, socket) {
	if (num in users) {
		console.log("user", num, "tried to pass their token twice!")
		return
	}
	let user = tokenUser(data.token)
	if (user === undefined) {
		send(socket, "invalidToken", {})
		return
	}
	users[num] = user
	sockets[num] = socket
	send(socket, "groupList", {groups: await db.getUserGroups(user)})
}

// main functions
function validateSpec(data, spec) {
	for (const [key, type] of Object.entries(spec)) {
		if (type.endsWith("?")) {
			if (data[key] !== null && typeof data[key] !== type.substring(0, type.length - 1)) {
				return false
			}
		} else if (typeof data[key] !== type) {
			return false
		}
	}
	return true
}

async function handleMessage(str, num, socket) {
	let data
	try {
		data = JSON.parse(str)
	} catch (e) {
		console.log("invalid message (json parse)", str)
		return
	}
	if (data.type !== "token" && !(num in sockets)) {
		console.log("invalid message (no auth)", data)
		return
	}
	if (!(data.type in specs && data.type in handlers)) {
		console.log("invalid message (unknown type)", data)
		return
	}
	if (!validateSpec(data, specs[data.type])) {
		console.log("invalid message (spec fail)", data)
		return
	}
	try {
		await handlers[data.type](data, num, socket)
	} catch(e) {
		console.log("error handling message!", data)
		console.log(e)
	}
}

function handleClose(num) {
	console.log("client disconnected")
}

export function initWebsocket(wss) {
	wss.on("connection", (ws, req) => {
		let num = socketNum++
		console.log("client connected from", req.socket.remoteAddress)
		ws.on("message", (str) => handleMessage(str.toString(), num, ws))
		ws.on("close", () => handleClose(num))
	})
}
