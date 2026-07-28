import {Pool} from "pg"

import env from "../env.json" with {type: "json"}

const pool = new Pool(env)

export const db = {
	init: function() {
		pool.connect().then(() => {
			console.log("connected to database")
		})
	},

	// user
	getUser: async function(id) {
		return (await pool.query(`select * from "user" where "id" = $1`, [id])).rows[0]
	},
	getUserByName: async function(username) {
		return (await pool.query(`select * from "user" where "username" = $1`, [username])).rows[0]
	},
	addUser: async function(username, password, pfpId) {
		return (await pool.query(`insert into "user"("username", "password", "pfpId") values($1, $2, $3) returning *`, [username, password, pfpId])).rows[0]
	}
}
