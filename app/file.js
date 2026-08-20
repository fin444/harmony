import fs from "node:fs"
import path from "node:path"

import {db} from "./database.js"

export async function uploadFile(name, content) {
	let id = (await db.addFile(name)).id
	try {
		fs.writeFileSync(path.join(import.meta.dirname, "../files", id.toString()), content)
		return id
	} catch (err) {
		return null
	}
}
