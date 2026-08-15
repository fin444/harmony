import { appendMessage, getMessageDiv, prependMessage } from "./dom.js";
import { ownerPfp } from "./app.js";
import { sendHandlers } from "./socket.js";

export const session = {
    userId: -1,
    groupId: -1,
    channelId: -1
};

export let messageQueue = [];
export let userCache = {};

export let groupList = [];
export let channelList = [];

export function inChannel() {
    return session.channelId > 0;
}

export function setGroupId(id) {
    session.groupId = id;
}

export function setChannelId(id) {
    session.channelId = id;
}

export function addMessageToQueue(message){
    messageQueue.push({
        message: message,
        requestSent: false,
        dataReady: function () {
            return userCache[this.message.userId] !== undefined;
        },
        requestData: function () {
            this.requestSent = true;
            sendHandlers.getUserInfo(this.message.userId);
        },
        execute: function () {
            this.requestSent = false;
            let userMatch = userCache[this.message.userId];
            let username = userMatch ? userMatch.name : "Unknown";
            let messageDiv = getMessageDiv(this.message.contents, username, ownerPfp, this.message.timestamp, this.message.fileId);
            prependMessage(messageDiv);
        }
    });
}


export function processMessageQueue() {
    console.log("Message queue before:", messageQueue);
    while (messageQueue.length > 0) {
        let event = messageQueue[0];
        if (!event.dataReady()) {
            if (!event.requestSent) event.requestData();
            return;
        }
        event.execute();
        messageQueue.shift();
    }
     console.log("Message queue after:", messageQueue);
}