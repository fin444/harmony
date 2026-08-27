import { getElement, prependMessage, fixMessages } from "./dom.js";
import { sendHandlers } from "./socket.js";


export const session = {
    url: new URL(window.location.href),
    userId: -1,
    userName: "",
    groupName: "",
    channelName: "",
    oldestMessageIndex: -1,
    token: null,
    messageFileId: null,
    messageReplyId: null
};


export let messageQueue = [];
export let userCache = {};

export let groupList = [];
export let channelList = [];

export function inChannel() {
    return getChannel() >= 0;
}

export function setGroup(id) {
    session.url.searchParams.set('group', id);
    window.history.pushState({}, '', session.url);
}

export function setChannel(id) {
    session.url.searchParams.set('channel', id);
    window.history.pushState({}, '', session.url);
}

export function getGroup() {
    let ret = Number(session.url.searchParams.get('group'));
    console.log("getGroup() is returning ", ret);
    return ret ? ret : -1;
}

export function getChannel() {
    let ret = Number(session.url.searchParams.get('channel'));
    console.log("getChannel() is returning ", ret);
    return ret ? ret : -1;
}

export function resetOldestMessageIndex(){
    session.oldestMessageIndex = -1;
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
            if(session.oldestMessageIndex == -1 || session.oldestMessageIndex > this.message.index) {
                session.oldestMessageIndex = this.message.index;
            }
            let userMatch = userCache[this.message.userId];
            let username = userMatch ? userMatch.name : "Unknown";
            let messageDiv = getElement.messageDiv(this.message.id, this.message.contents, username, this.message.userId, this.message.timestamp, this.message.index, this.message.fileId, this.message.replyMessageId);
            prependMessage(messageDiv);
            
        }
    });
}


export function uploadFile(file, handler) {
    let reader = new FileReader();
    reader.onload = (e) => {
        fetch(`/file?token=${session.token}&name=${file.name}`, {
            method: "PUT",
            body: e.target.result,
            headers: {"Content-Type": "application/octet-stream"}
        }).then(res => {
            if (!res.ok) {
                throw(response.text());
            }
            return res.text();
        }).then(res => {
            let i = parseInt(res);
            if (isNaN(i)) {
                throw(res, "is NaN!");
            } else {
                handler(i);
            }
        }).catch(async err => {
            console.log("ERROR OCCURRED: ", await err);
            handler(null);
        });
    };
    reader.readAsArrayBuffer(file);
}

export function processMessageQueue() {
    console.log("Processing message queue");
    while (messageQueue.length > 0) {
        let event = messageQueue[0];
        if (!event.dataReady()) {
            if (!event.requestSent) event.requestData();
            return;
        }
        event.execute();
        messageQueue.shift();
    }
    fixMessages();
}