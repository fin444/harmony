import {tokenUser} from "./account.js"

const sockets = {}

// helpers
function send(socket, type, data) {
	socket.send(JSON.stringify({type: type, ...data}))
}

// message types
const specs = {
}
const handlers = {
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

async function handleMessage(ws, req, str) {
	let data
	try {
		data = JSON.parse(str)
	} catch (e) {
		console.log("invalid message (json parse)", str)
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
		await handlers[data.type](data, ws)
	} catch(e) {
		console.log("error handling message!", data)
		console.log(e)
	}
}

function handleClose(ws, req) {
	console.log("client disconnected from", req.socket.remoteAddress)
}

export function initWebsocket(wss) {
	wss.on("connection", (ws, req) => {
		console.log("client connected from", req.socket.remoteAddress)
		ws.on("message", (str) => handleMessage(ws, req, str.toString()))
		ws.on("close", () => handleClose(ws, req))
	})
}
