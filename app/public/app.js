import {sendHandlers} from "./socket.js";

const groupListElm = document.getElementById("group-list");
const curUserPfp = document.getElementById("profile-image");
const channelListElm = document.getElementById("channel-list");

const groupHeaderTextElm = document.getElementById("group-header-text");
const messageInputFieldElm = document.getElementById("type");
const messageSendButtonElm = document.getElementById("send");

const messageAreaElm = document.getElementById("messages");
const newGroupButtonElm = document.getElementById("new-group");

export let messageQueue = [];
export let userCache = {};

export const userSession = {
    curUserId: -1,
    curGroupId: -1,
    curChannelId: -1
};



let groupList = [];
let channelList = [];


let ownerPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let ownerUsername = "test_curuser";
let otherPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";

// Functions



export function processMessageQueue() {
    for (let event of messageQueue) {
        if (!event.dataReady()) {
            if (!event.requestSent) event.requestData();
            return;
        }
        event.execute();
        messageQueue.pop(0);
    }
}

function getFormattedDate(date) {
    return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export function populateGroupList(groups) { 
    groupListElm.replaceChildren();   
    for(let group of groups) {
        let groupButtonElm = document.createElement("button");
        groupButtonElm.textContent = "ID: " + group.id + " " + group.name;
        groupButtonElm.className = 'sidebar-content-button';
        groupButtonElm.dataset.groupId = group.id;
        groupButtonElm.type = 'button';
        groupButtonElm.addEventListener("click", () => {
            const groupButtons = document.querySelectorAll('.sidebar-content-button');
            groupButtons.forEach(b => b.classList.remove('is-selected'));
            groupButtonElm.classList.toggle('is-selected');
            const groupId = group.id;
            userSession.curGroupId = groupId;
            sendHandlers.getGroupInfo(groupId);
        });
        groupListElm.append(groupButtonElm);
    }
}
export function populateChannelList(channels) {
    channelListElm.replaceChildren();   
    for(let channel of channels) {
        let channelButtonElm = document.createElement("button");
        channelButtonElm.textContent = channel.name;
        channelButtonElm.className = 'sidebar-content-button';
        channelButtonElm.dataset.channelId = channel.id;
        //add listener
        channelListElm.append(channelButtonElm);
    }
}

function populateMessages(messages) {
    for(let message of messages) {
        
    }
}

function clearMessages() {
    messageAreaElm.replaceChildren();
}


function setChatView(chatName, messages) {

    
}

function createGroup(name) {
    console.log("Create group function called with name: ", name);
    sendHandlers.createThing("group", name);
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
            let messageDiv = getMessageDiv(this.message.contents, username, ownerPfp, this.message.fileId);
            messageAreaElm.prepend(messageDiv);
        }
    });
}


export function getMessageDiv(message, username, pfpUrl, timestamp, file) {
    let parentElm = document.createElement("div");
    parentElm.className = "chat-element-div";

    let timestampElm = document.createElement("p");
    timestampElm.className = "chat-timestamp";
    timestampElm.textContent = timestamp;

    let bodyElm = document.createElement("p");
    bodyElm.className = "chat-message";
    bodyElm.textContent = message;

    let usernameElm = document.createElement("p");
    usernameElm.className = "chat-username";
    usernameElm.textContent = username;

    let pfpElm = document.createElement("img");
    pfpElm.className = "chat-profile-pic";
    pfpElm.src = pfpUrl;

    // TODO: FILE ATTACHMENTS

    parentElm.append(timestampElm);
    parentElm.append(pfpElm);
    parentElm.append(usernameElm);
    parentElm.append(bodyElm);

    return parentElm;
}

export function sendMessage() {
    if (userSession.curChannelId < 0) {
        console.log("Cannot send message. Not currently in a channel.");
        return;
    }
    let messageText = messageInputFieldElm.value;
    messageInputFieldElm.value = "";
    
    if(messageText === "") {
        console.log("Cannot send message. Nothing in message text field.");
        return;
    }

    console.log("Sending message in channel ", userSession.curChannelId, ": ", messageText);

    sendHandlers.sendMessage(userSession.curChannelId, messageText, null);
    sendHandlers.getMessages(userSession.curChannelId, -1);
}



export function initializePage () {
    console.log("Initializing page");
    curUserPfp.src = ownerPfp;
    newGroupButtonElm.addEventListener("click", () => createGroup("test"));
    messageSendButtonElm.addEventListener("click", () => sendMessage());
    messageInputFieldElm.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
    console.log("Current user id: ", userSession.curUserId);
}
