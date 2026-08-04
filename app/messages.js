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
	createThing: {thingType: "str", name: "str", groupId: "id?"},
	renameThing: {thingType: "str", id: "id", name: "str"},
	deleteThing: {thingType: "str", id: "id"},
	inviteUser: {groupId: "id", userId: "id"},
}

async function sendGroupList(socket, user) {
	send(socket, "groupList", {groups: await db.getUserGroups(user)})
}
async function sendGroupInfo(socket, group) {
	// TODO broadcast instead of send
	send(socket, "groupInfo", {id: group, channels: await db.getGroupChannels(group)})
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
		if (data.thingType === "group") {
			let group = await db.addGroup(data.name)
			await db.addUserToGroup(user, group.id)
			sendGroupList(socket, user)
		} else if (data.thingType === "channel") {
			if (data.groupId === null || data.groupId === undefined) {
				console.log("thingType is channel but groupId is null", data)
				return
			}
			let groups = await db.getUserGroups(user)
			if (data.groupId in groups) {
				await db.addChannel(data.name, data.groupId)
				sendGroupInfo(socket, data.groupId)
			} else {
				console.log("user cannot add channel to group because they are not in it", data)
			}
		} else {
			console.log("unknown thingType:", data)
		}
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
