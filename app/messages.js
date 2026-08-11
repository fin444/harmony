import {tokenUser} from "./account.js"
import {db} from "./database.js"
import {addUser, broadcast, send} from "./websocket.js"

export const specs = {
	token: {token: "str"},
	getGroupInfo: {id: "id"},
	getMessages: {channelId: "id", index: "int?"},
	typingStatus: {isTyping: "bool"},
	sendMessage: {channelId: "id", contents: "str", fileId: "id?"},
	getUserInfo: {id: "id"},
	setPfp: {fileId: "id"},
	createThing: {thingType: "str", name: "str", groupId: "id?"},
	renameThing: {thingType: "str", id: "id", name: "str"},
	deleteThing: {thingType: "str", id: "id"},
	inviteUser: {groupId: "id", userId: "id"},
}

function extractFields(obj, fields) {
	if (Array.isArray(obj)) {
		return obj.map((arr) => { return extractFields(arr, fields) })
	}
	let extracted = {}
	for (let f of fields) {
		extracted[f] = obj[f]
	}
	return extracted
}

async function sendUserInfo(socket, user) {
	send(socket, "userInfo", extractFields(await db.getUser(user), ["id", "username", "pfpId"]))
}
async function sendGroupList(socket, user) {
	send(socket, "groupList", {
		groups: extractFields(await db.getUserGroups(user), ["id", "name"])
	})
}
async function sendGroupInfo(socket, group) {
	// TODO broadcast instead of send
	send(socket, "groupInfo", {
		id: group,
		channels: extractFields(await db.getGroupChannels(group), ["id", "name"])
	})
}

export const handlers = {
	token: async function(data, num, user, socket) {
		if (user !== undefined) {
			console.log("user", num, user, "tried to pass their token twice!")
			return
		}
		user = tokenUser(data.token)
		if (user === undefined) {
			send(socket, "invalidToken", {})
			return
		}
		addUser(num, user, socket)
		send(socket, "validToken", {userId: user})
		sendUserInfo(socket, user)
		sendGroupList(socket, user)
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

	sendMessage: async function(data, num, user, socket) {
		let users = (await db.getChannelUsers(data.channelId)).map((o) => {return o.userId})
		if (!users.includes(user)) {
			console.log("can't send message because user is not in channel", data)
			return
		}

		let message = await db.addMessage(
			user,
			data.channelId,
			(data.fileId === null || data.fileId === undefined) ? null : data.fileId,
			data.contents,
			Date.now()
		)
		let index = await db.getMessageIndex(message.id)

		broadcast(users, "messages", {
			channelId: message.channelId,
			messages: [{
				index: index,
				userId: user,
				contents: message.contents,
				fileId: message.fileId,
				timestamp: message.timestamp
			}]
		})
	},

	getUserInfo: async function(data, num, user, socket) {
		sendUserInfo(socket, data.id)
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
			let groups = (await db.getUserGroups(user)).map(obj => obj.groupId)
			if (groups.includes(data.groupId)) {
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
