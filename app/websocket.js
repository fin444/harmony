function handleMessage(ws, req, data) {
	console.log("received message from", req.socket.remoteAddress, ":", data.toString())
}

function handleClose(ws, req) {
	console.log("client disconnected from", req.socket.remoteAddress)
}

export function initWebsocket(wss) {
	wss.on("connection", (ws, req) => {
		console.log("client connected from", req.socket.remoteAddress)
		ws.on("message", (data) => handleMessage(ws, req, data))
		ws.on("close", () => handleClose(ws, req))
	})
}
