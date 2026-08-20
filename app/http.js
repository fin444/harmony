import {tokenUser, tryLogin, trySignup} from "./account.js"
import {uploadFile, getFile, getFileName} from "./file.js"

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
	app.get("/login", (req, res) => handleLogin(req.query, res, tryLogin, "Invalid credential(s)"))
	app.get("/signup", (req, res) => handleLogin(req.query, res, trySignup, "Account already exists"))

	app.get("/app", (req, res) => {
		if (validateToken(req.query.token, res)) {
			res.sendFile(import.meta.dirname + "/public/app.html")
		}
	})

	app.get("/file", async function(req, res) {
		if (validateToken(req.query.token, res)) {
			if (typeof req.query.id !== "string") {
				res.statusCode = 400
				res.send("bad request")
				return
			}
			let id = parseInt(req.query.id)
			let data = await getFile(id)
			if (data === null) {
				res.statusCode = 500
				res.send("server error :(")
				return
			}
			res.append("Content-Disposition", `inline; filename="${getFileName(id)}"`)
			res.send(data)
		}
	})

	app.put("/file", async function(req, res) {
		if (await validateToken(req.query.token, res)) {
			if (typeof req.query.name !== "string" || req.body === undefined) {
				res.statusCode = 400
				res.send("bad request")
				return
			}
			let result
			try {
				result = await uploadFile(req.query.name, req.body)
			} catch(e) {
				console.log(e)
				result = null
			}
			if (result === null) {
				res.statusCode = 500
				res.send("server error :(")
			} else {
				res.statusCode = 200
				res.send(result)
			}
		}
	})
}
