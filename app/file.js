import fs from "node:fs"
import path from "node:path"

import {db} from "./database.js"

function idToPath(id) {
	return path.join(import.meta.dirname, "../files", id.toString())
}

export async function uploadFile(name, content) {
	let id = (await db.addFile(name)).id
	try {
		fs.writeFileSync(idToPath(id), content)
		return id
	} catch (err) {
		console.log(err)
		return null
	}
}

export async function getFile(id) {
	try {
		let data = fs.readFileSync(idToPath(id))
		return data
	} catch (err) {
		console.log(err)
		return null
	}
}

export async function getFileName(id) {
	return (await db.getFile(id)).name
}
