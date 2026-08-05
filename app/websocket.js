import {tokenUser} from "./account.js"
import {specs, handlers} from "./messages.js"

const users = {}
const sockets = {}
var socketNum = 0

// helpers
export function addUser(num, user, socket) {
	users[num] = user
	sockets[num] = socket
}

export function broadcast(filter, type, data) {
	for (num of users) {
		if (filter(users[num])) {
			send(sockets[num], type, data)
		}
	}
}

export function send(socket, type, data) {
	socket.send(JSON.stringify({type: type, ...data}))
}

// main functions
function validateSpec(data, spec) {
	for (let key in spec) {
		let type = spec[key], t = type, v = data[key]
		// nullability
		if (t.endsWith("?")) {
			if (v === null || v === undefined) {
				continue
			}
			t = t.substring(0, t.length - 1)
		}
		// types
		switch(t) {
			case "bool":
				if (typeof v !== "boolean") {
					return false
				}
				break
			case "id":
				if (!Number.isInteger(v) || v < 1) {
					return false
				}
				break
			case "int":
				if (!Number.isInteger(v)) {
					return false
				}
				break
			case "str":
				if (typeof v !== "string") {
					return false
				}
				break
			default:
				console.log("unknown spec type!", type)
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
	} else if (!(data.type in specs && data.type in handlers)) {
		console.log("invalid message (unknown type)", data)
	} else if (!validateSpec(data, specs[data.type])) {
		console.log("invalid message (spec fail)", data)
	} else {
		try {
			await handlers[data.type](data, num, users[num], socket)
		} catch(e) {
			console.log("error handling message!", data)
			console.log(e)
		}
	}
}

function handleClose(num) {
	delete users[num]
	delete sockets[num]
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
