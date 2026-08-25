import {tokenUser} from "./account.js"
import {db} from "./database.js"
import {addUser, broadcast, broadcastAdaptive, broadcastAll, send} from "./websocket.js"

export const specs = {
	token: {token: "str"},
	getGroupInfo: {id: "id"},
	getMessages: {channelId: "id", index: "int?"},
	typingStatus: {channelId: "id", isTyping: "bool"},
	sendMessage: {channelId: "id", contents: "str", fileId: "id?"},
	getUserInfo: {id: "id"},
	setPfp: {fileId: "id"},
	createThing: {thingType: "str", name: "str", groupId: "id?"},
	renameThing: {thingType: "str", id: "id", name: "str"},
	deleteThing: {thingType: "str", id: "id"},
	inviteUser: {groupId: "id", username: "str"},
}

const typingStatuses = {}

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

async function getGroupList(user) {
	return extractFields(await db.getUserGroupsFull(user), ["id", "name"])
}
async function sendGroupList(socket, user) {
	send(socket, "groupList", {groups: await getGroupList(user)})
}

async function broadcastGroupInfo(group) {
	let users = await db.getGroupUsers(group)
	broadcast(users, "groupInfo", {
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
		await sendUserInfo(socket, user)
		await sendGroupList(socket, user)
	},

	getGroupInfo: async function(data, num, user, socket) {
		let groups = await db.getUserGroups(user)
		if (groups.includes(data.id)) {
			let channels = await db.getGroupChannels(data.id)
			send(socket, "groupInfo", {
				id: data.id,
				channels: extractFields(channels, ["id", "name"])
			})
			// if they are asking for group info they might not have latest typingIndicators
			for (let channel of channels) {
				let status = typingStatuses[channel.id]
				if (status !== undefined && status.size !== 0) {
					send(socket, "typingIndicator", {
						channelId: channel.id,
						usersTyping: Array.from(status)
					})
				}
			}
		} else {
			console.log("can't send group info because user is not in group", data)
		}
	},

	getMessages: async function(data, num, user, socket) {
		let users = await db.getChannelUsers(data.channelId)
		if (!users.includes(user)) {
			console.log("can't get messages because user is not in channel", data)
			return
		}
		send(socket, "messages", {
			channelId: data.channelId,
			messages: await db.getMessages(data.channelId, data.index, 30)
		})
	},

	typingStatus: async function(data, num, user, socket) {
		let users = await db.getChannelUsers(data.channelId)
		if (!users.includes(user)) {
			console.log("can't set typing status because user is not in channel", data)
			return
		}
		if (!(data.channelId in typingStatuses)) {
			typingStatuses[data.channelId] = new Set()
		}
		if (data.isTyping) {
			typingStatuses[data.channelId].add(user)
		} else {
			typingStatuses[data.channelId].delete(user)
		}
		broadcast(users, "typingIndicator", {
			channelId: data.channelId,
			usersTyping: Array.from(typingStatuses[data.channelId])
		})
	},

	sendMessage: async function(data, num, user, socket) {
		let users = await db.getChannelUsers(data.channelId)
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
				id: message.id,
				index: index,
				userId: user,
				contents: message.contents,
				fileId: message.fileId,
				timestamp: message.timestamp
			}]
		})
	},

	getUserInfo: async function(data, num, user, socket) {
		await sendUserInfo(socket, data.id)
	},

	setPfp: async function(data, num, user, socket) {
		let u = await db.setUserPfp(user, data.fileId)
		broadcastAll("userInfo", extractFields(u, ["id", "username", "pfpId"]))
	},

	createThing: async function(data, num, user, socket) {
		if (data.thingType === "group") {
			let group = await db.addGroup(data.name)
			await db.addUserToGroup(user, group.id)
			await sendGroupList(socket, user)
		} else if (data.thingType === "channel") {
			if (data.groupId === null || data.groupId === undefined) {
				console.log("thingType is channel but groupId is null", data)
				return
			}
			let groups = await db.getUserGroups(user)
			if (groups.includes(data.groupId)) {
				await db.addChannel(data.name, data.groupId)
				await broadcastGroupInfo(data.groupId)
			} else {
				console.log("user cannot add channel to group because they are not in it", data)
			}
		} else {
			console.log("unknown thingType", data)
		}
	},

	renameThing: async function(data, num, user, socket) {
		if (data.thingType === "group") {
			let users = await db.getGroupUsers(data.id)
			if (users.includes(user)) {
				await db.renameGroup(data.id, data.name)
				await broadcastAdaptive(users, "groupList", async function(userId) {
					return {groups: await getGroupList(userId)}
				})
			} else {
				console.log("user cannot rename group because they are not in it", data)
			}
		} else if (data.thingType === "channel") {
			let users = await db.getChannelUsers(data.id)
			if (users.includes(user)) {
				let channel = await db.renameChannel(data.id, data.name)
				await broadcastGroupInfo(channel.groupId)
			} else {
				console.log("user cannot rename channel because they are not in it", data)
			}
		} else {
			console.log("unknown thingType", data)
		}
	},

	deleteThing: async function(data, num, user, socket) {
		if (data.thingType === "group") {
			let users = await db.getGroupUsers(data.id)
			if (!users.includes(user)) {
				console.log("user cannot delete group because they are not in it", data)
				return
			}
			await db.deleteGroup(data.id)
			await broadcastAdaptive(users, "groupList", async function(userId) {
				return {groups: await getGroupList(userId)}
			})
		} else if (data.thingType === "channel") {
			let users = await db.getChannelUsers(data.id)
			if (!users.includes(user)) {
				console.log("user cannot delete channel because they are not in it", data)
				return
			}
			let group = await db.getChannelGroup(data.id)
			await db.deleteChannel(data.id)
			await broadcastGroupInfo(group)
		} else if (data.thingType === "message") {
			let message = await db.getMessage(data.id)
			if (message.userId !== user) {
				console.log("user cannot delete message because they are not in it", data)
				return
			}
			await db.deleteMessage(data.id)
			await broadcast(await db.getChannelUsers(message.channelId), "deleteMessage", {id: data.id})
		} else {
			console.log("unknown thingType", data)
		}
	},

	inviteUser: async function(data, num, user, socket) {
		let invitee = await db.getUserByName(data.username)
		if (invitee === undefined) {
			console.log("cannot invite non-existant user", data)
			return
		}
		let allowedGroups = await db.getUserGroups(user)
		if (!allowedGroups.includes(data.groupId)) {
			console.log("cannot invite user to group you are not in", data)
			return
		}
		await db.addUserToGroup(invitee.id, data.groupId)
		broadcast([invitee.id], "groupList", {groups: await getGroupList(invitee.id)})
	},
}
