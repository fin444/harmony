import {tokenUser} from "./account.js"
import {db} from "./database.js"
import {addUser, broadcast, send} from "./websocket.js"

export const specs = {
	token: {token: "str"},
	getGroupInfo: {id: "id"},
	getMessages: {channelId: "id", index: "int"},
	typingStatus: {isTyping: "bool"},
	sendMessage: {channelId: "id", contents: "str", fileId: "id?"},
	getUserInfo: {username: "str"},
	setPfp: {fileId: "id"},
	createThing: {thingType: "str", name: "str"},
	renameThing: {thingType: "str", id: "id", name: "str"},
	deleteThing: {thingType: "str", id: "id"},
	inviteUser: {groupId: "id", userId: "id"},
}

export const handlers = {
	token: async function(data, num, user, socket) {
		if (user === undefined) {
			console.log("user", num, user, "tried to pass their token twice!")
			return
		}
		user = tokenUser(data.token)
		if (user === undefined) {
			send(socket, "invalidToken", {})
			return
		}
		addUser(num, user, socket)
		send(socket, "groupList", {groups: await db.getUserGroups(user)})
	},

	getGroupInfo: async function(data, num, user, socket) {
		// TODO
	},

	getMessages: async function(data, num, user, socket) {
		// TODO
	},

	typingStatus: async function(data, num, user, socket) {
		// TODO
	},

		// TODO
	sendMessage: async function(data, num, user, socket) {
	},

	getUserInfo: async function(data, num, user, socket) {
		// TODO
	},

	setPfp: async function(data, num, user, socket) {
		// TODO
	},

	createThing: async function(data, num, user, socket) {
		// TODO
	},

	renameThing: async function(data, num, user, socket) {
		// TODO
	},

	deleteThing: async function(data, num, user, socket) {
		// TODO
	},

	inviteUser: async function(data, num, user, socket) {
		// TODO
	},
}
