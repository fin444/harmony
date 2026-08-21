import express from "express"
import {createServer} from "http"
import path from "node:path"
import {WebSocketServer} from "ws"

import {db} from "./database.js"
import {initHTTP} from "./http.js"
import {initWebsocket} from "./websocket.js"

db.init()

// webserver init
const app = express()
const server = createServer(app)
const wss = new WebSocketServer({server})

// webserver content
app.use(express.static(path.join(import.meta.dirname, "public")))
app.use(express.raw({limit: "10mb"}))
initHTTP(app)
initWebsocket(wss)

// launch webserver
const port = 3000
const hostname = "localhost"
server.listen(port, hostname, () => {
	console.log(`listening on http://${hostname}:${port}`)
})
