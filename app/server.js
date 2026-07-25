import express from "express"
import {createServer} from "http"
import {Pool} from "pg"
import {WebSocketServer} from "ws"

import env from "../env.json" with {type: "json"}
import {initHTTP} from "./http.js"
import {initWebsocket} from "./websocket.js"

// database init
const pool = new Pool(env)
pool.connect().then(() => {
	console.log("connected to database")
})

// webserver init
const app = express()
const server = createServer(app)
const wss = new WebSocketServer({server})

// webserver content
app.use(express.static("public"))
initHTTP(app)
initWebsocket(wss)

// launch webserver
const port = 3000
const hostname = "localhost"
server.listen(port, hostname, () => {
	console.log(`listening on http://${hostname}:${port}`)
})
