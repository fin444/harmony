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

function validateToken(req, res) {
	let token = req.get("Cookie")?.split("; ")?.find((row) => row.startsWith("token="))?.split("=")[1]
	if (typeof token !== "string" || tokenUser(token) === undefined) {
		return false
	} else {
		return true
	}
}

export function initHTTP(app) {
	app.get("/", (req, res) => {
		if (validateToken(req, res)) {
			res.redirect("/app")
		} else {
			res.append("Set-Cookie", "token=deleted")
			res.sendFile(import.meta.dirname + "/public/index.html")
		}
	})

	app.get("/login", (req, res) => handleLogin(req.query, res, tryLogin, "Invalid credential(s)"))
	app.get("/signup", (req, res) => handleLogin(req.query, res, trySignup, "Account already exists"))

	app.get("/app", (req, res) => {
		if (validateToken(req, res)) {
			res.sendFile(import.meta.dirname + "/public/app.html")
		} else {
			res.redirect("/")
		}
	})

	app.get("/file", async function(req, res) {
		if (validateToken(req, res)) {
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
			res.append("Content-Disposition", `inline; filename="${await getFileName(id)}"`)
			res.send(data)
		} else {
			res.statusCode = 401
			res.send("not logged in")
		}
	})

	app.put("/file", async function(req, res) {
		if (await validateToken(req, res)) {
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
		} else {
			res.statusCode = 401
			res.send("not logged in")
		}
	})
}
