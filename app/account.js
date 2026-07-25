import {db} from "./database.js"

const tokens = {}

function generateToken(id) {
	while (true) {
		let rand = Math.floor(Math.random() * Math.pow(16, 8)).toString(16)
		if (!(rand in tokens)) {
			tokens[rand] = id
			return rand
		}
	}
}

export function checkToken(token) {
	return token in tokens
}

export async function tryLogin(username, password) {
	let user = await db.getUserByName(username)
	if (user === undefined || user.password !== password) {
		return null
	} else {
		return generateToken(user.id)
	}
}

export async function trySignup(username, password) {
	// make sure user does not exist
	let user = await db.getUserByName(username)
	if (user === undefined) {
		user = await db.addUser(username, password, 1)
		return generateToken(user.id)
	} else {
		return null
	}
}
