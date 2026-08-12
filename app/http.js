import {tokenUser, tryLogin, trySignup} from "./account.js"

async function handleLogin(query, res, fn, errText) {
	if (typeof query.username !== "string" || typeof query.password !== "string") {
		res.statusCode = 400
		res.send("Bad request")
		return
	}

	let token = await fn(query.username, query.password)
	if (token === null) {
		res.statusCode = 401
		res.send(errText)
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

	if (tokenUser(token) === undefined) {
		res.statusCode = 401
		res.send("Access denied")
		return false
	} else {
		return true
	}
}

export function initHTTP(app) {
	app.get("/", (req, res) => res.sendFile(import.meta.dirname + "/public/login.html"))

	app.get("/login", (req, res) => handleLogin(req.query, res, tryLogin, "Invalid credential(s)"))
	app.get("/signup", (req, res) => handleLogin(req.query, res, trySignup, "Account already exists"))

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
