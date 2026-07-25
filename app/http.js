import {checkToken, tryLogin, trySignup} from "./account.js"

function handleLogin(query, res, fn) {
	if (typeof query.username !== "string" || typeof query.password !== "string") {
		res.statusCode = 400
		res.send("Bad request")
		return
	}

	let token = fn(query.username, query.password)
	if (token === null) {
		res.statusCode = 401
		res.send("Invalid login")
	} else {
		res.send(token)
	}
}

function validateToken(token, res) {
	if (typeof token !== "string") {
		res.statusCode = 400
		res.send("Bad request")
		return false
	}

	if (checkToken(token)) {
		return true
	} else {
		res.statusCode = 401
		res.send("Access denied")
		return false
	}
}

export function initHTTP(app) {
	app.get("/", (req, res) => res.sendFile(import.meta.dirname + "/public/login.html"))

	app.get("/login", (req, res) => handleLogin(req.query, res, tryLogin))
	app.get("/signup", (req, res) => handleLogin(req.query, res, trySignup))

	app.get("/app", (req, res) => {
		if (validateToken(req.query.token, res)) {
			res.sendFile(import.meta.dirname + "/public/app.html")
		}
	})

	app.get("/file", (req, res) => {
		if (validateToken(req.query.token, res)) {
			// TODO
		}
	})

	app.put("/file", (req, res) => {
		if (validateToken(req.query.token, res)) {
			// TODO
		}
	})
}
