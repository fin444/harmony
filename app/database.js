import {Pool, types} from "pg"

import env from "../env.json" with {type: "json"}

const pool = new Pool(env)

export const db = {
	init: function() {
		types.setTypeParser(20, parseInt)
		pool.connect().then(() => {
			console.log("connected to database")
		})
	},

	// file
	addFile: async function(name) {
		return (await pool.query(
			`insert into "file"("name")
				values($1) returning *`,
			[name]
		)).rows[0]
	},

	// group
	addGroup: async function(name) {
		return (await pool.query(
			`insert into "group"("name")
				values($1) returning *`,
			[name]
		)).rows[0]
	},

	// user
	addUser: async function(username, password, pfpId) {
		return (await pool.query(
			`insert into "user"("username", "password", "pfpId")
				values($1, $2, $3) returning *`,
			[username, password, pfpId])
		).rows[0]
	},
	getUser: async function(id) {
		return (await pool.query(
			`select * from "user" where "id" = $1`,
			[id]
		)).rows[0]
	},
	getUserByName: async function(username) {
		return (await pool.query(
			`select * from "user" where "username" = $1`,
			[username]
		)).rows[0]
	},

	// group_user
	addUserToGroup: async function(userId, groupId) {
		return (await pool.query(
			`insert into "group_user"("userId", "groupId")
				values($1, $2) returning *`,
			[userId, groupId]
		)).rows[0]
	},
	getUserGroupsFull: async function(id) {
		return (await pool.query(
			`select * from "group_user"
				inner join "group" on "group_user"."groupId" = "group"."id"
				where "group_user"."userId" = $1`,
			[id]
		)).rows
	},
	getUserGroups: async function(id) {
		return (await this.getUserGroupsFull(id)).map(obj => obj.groupId)
	},
	getGroupUsers: async function(id) {
		return (await pool.query(
			`select * from "group_user"
				inner join "user" on "group_user"."userId" = "user"."id"
				where "group_user"."groupId" = $1`,
			[id]
		)).rows.map(obj => obj.userId)
	},

	// channel
	addChannel: async function(name, groupId) {
		return (await pool.query(
			`insert into "channel"("name", "groupId")
				values($1, $2) returning *`,
			[name, groupId]
		)).rows[0]
	},
	getGroupChannels: async function(group) {
		return (await pool.query(
			`select * from "channel" where "groupId" = $1`,
			[group]
		)).rows
	},
	getChannelUsers: async function(id) {
		return (await pool.query(
			`select "group_user"."userId" from "group_user"
				inner join "channel" on "group_user"."groupId" = "channel"."groupId"
				where "channel"."id" = $1`,
			[id]
		)).rows.map(obj => obj.userId)
	},

	// message
	addMessage: async function(userId, channelId, fileId, contents, timestamp) {
		return (await pool.query(
			`insert into "message"("userId", "channelId", "fileId", "contents", "timestamp")
				values($1, $2, $3, $4, $5) returning *`,
			[userId, channelId, fileId, contents, timestamp]
		)).rows[0]
	},
	getMessageIndex: async function(id) {
		return (await pool.query(
			`select "index" from (
					select "id", row_number() over(order by "timestamp") "index"
						from "message" where "channelId" = (
							select "channelId" from "message" where "id" = $1
						)
				) as "indices" where "indices"."id" = $1`,
			[id]
		)).rows[0].index
	},
}
