// Socket stuff

const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port);

const receiveHandlers = {
    invalidToken:       function () {
        window.location.href = "/";
    },
    validToken:         function (userId) {
        console.log("Valid token message from server");
        curUserId = userId;
        initializePage();
    },
    groupList:          function (groups) {
        console.log("Group list message from server");
        populateGroupList(groups);
    },
    groupInfo:          function (id, channels) {
        console.log("Group info message from server");
        if(curGroupId === id) {
            // populateChannelList(channels);
        }
        // TEMPORARY TEST
        // curChannelId = 0;
        // console.log("Channel ID set", curChannelId);
    },
    messages:           function (channelId, messages) {
        console.log("Messages message from server");
        if(curChannelId === channelId) populateMessages(messages);
    },
    typingIndicator:    function (channelId, usersTyping) {
        console.log("Typing indicator message from server");
        if(curChannelId === channelId) displayTypingIndicator(usersTyping);
    },
    userInfo:           function (id, name, pfpId) {
        console.log("User info message from server");
        if(id === curUserId) {
            // Set profile pfp, etc.
        }
        userCache.push( {id: id, name: name, pfpId: pfpId} );
    }
};

const sendHandlers = {
    token:          function (tok) {
        let data = {type: 'token', token: tok};
        socket.send(JSON.stringify(data));
    },
    getGroupInfo:   function (id) {
        let data = {type: 'getGroupInfo', id: id};
        // socket.send(JSON.stringify(data));
        curChannelId = 1; // Baked in test
        console.log("Current group set to ", curGroupId);
        console.log("Channel ID set", curChannelId);
        sendHandlers.getMessages(curChannelId, -1);
    },
    getMessages:    function (channelId, index) {
        let data = {type: 'getMessages', channelId: channelId, index: index};
        socket.send(JSON.stringify(data));
    },
    typingStatus:   function (isTyping) {
        let data = {type: 'typingStatus', isTyping: isTyping};
        socket.send(JSON.stringify(data));
    },
    sendMessage:    function (channelId, contents, fileId) {
        let data = {type: 'sendMessage', channelId: channelId, contents: contents, fileId: fileId};
        socket.send(JSON.stringify(data));
    },
    getUserInfo:    function (username) {
        let data = {type: 'getUserInfo', username: username};
        socket.send(JSON.stringify(data));
    },
    setPfp:         function (fileId) {
        let data = {type: 'setPfp', fileId: fileId};
        socket.send(JSON.stringify(data));
    },
    createThing:    function (thingType, name) {
        let data = {type: 'createThing', thingType: thingType, name: name};
        socket.send(JSON.stringify(data));
    },
    renameThing:    function (thingType, id, name) {
        let data = {type: 'renameThing', thingType: thingType, id: id, name: name};
        socket.send(JSON.stringify(data));
    },
    deleteThing:    function (thingType, id) {
        let data = {type: 'deleteThing', thingType: thingType, id: id};
        socket.send(JSON.stringify(data));
    },
    inviteUser:     function (groupId, userId) {
        let data = {type: 'inviteUser', groupId: groupId, userId: userId};
        socket.send(JSON.stringify(data));
    },
};


socket.addEventListener('open', () => {
  console.log('WebSocket connected');
  let urlParams = new URLSearchParams(window.location.search);
  sendHandlers.token(urlParams.get('token'));
});

socket.addEventListener("message", (event) => {
	
    let data = JSON.parse(event.data);
    console.log("message from server:", data)
    switch (data.type) {
        case "invalidToken":
            receiveHandlers.invalidToken();
            break;
        case "validToken":
            receiveHandlers.validToken(data.userId);
            break;
        case "groupList":
            receiveHandlers.groupList(data.groups);
            break;
        case "groupInfo":
            receiveHandlers.groupInfo(data.id, data.channels);
            break;
        case "messages":
            receiveHandlers.messages(data.channelId, data.messages);
            break;
        case "typingIndicator":
            receiveHandlers.typingIndicator(data.channelId, data.usersTyping);
            break;
        case "userInfo":
            receiveHandlers.userInfo(data.id, data.name, data.pfpId);
            break;
        default:
            return;
    }
});

// Constants


const groupListElm = document.getElementById("group-list");
const curUserPfp = document.getElementById("profile-image");

const channelListElm = document.getElementById("channel-list");

const groupHeaderTextElm = document.getElementById("group-header-text");
const messageInputFieldElm = document.getElementById("type");
const messageSendButtonElm = document.getElementById("send");

const messageAreaElm = document.getElementById("messages");
const newGroupButtonElm = document.getElementById("new-group");

// Variables
let userCache = [];
let curUserId = -1;
let curGroupId = -1;
let curChannelId = -1;
let groupList = [];
let channelList = [];

let ownerPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let ownerUsername = "test_curuser";
let otherPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let otherUsername = "test_other"

// Functions

function getFormattedDate(date) {
    return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function populateGroupList(groups) { 
    groupListElm.replaceChildren();   
    for(let group of groups) {
        let groupButtonElm = document.createElement("button");
        groupButtonElm.textContent = group.name;
        groupButtonElm.className = 'sidebar-content-button';
        groupButtonElm.dataset.groupId = group.id;
        groupButtonElm.type = 'button';
        groupButtonElm.addEventListener("click", () => {
            const groupId = group.id;
            curGroupId = groupId;
            sendHandlers.getGroupInfo(groupId);
        });
        groupListElm.append(groupButtonElm);
    }
}
function populateChannelList(channels) {
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
        let messageDiv = getMessageDiv(message.contents, "testUsername", ownerPfp, message.fileId);
        messageAreaElm.prepend(messageDiv);
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


function getMessageDiv(message, username, pfpUrl, timestamp, file) {
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

function sendMessage() {
    if (curChannelId < 0) {
        console.log("Cannot send message. Not currently in a channel.");
        return;
    }
    let messageText = messageInputFieldElm.value;
    messageInputFieldElm.value = "";
    
    if(messageText === "") {
        console.log("Cannot send message. Nothing in message text field.");
        return;
    }

    console.log("Sending message in channel ", curChannelId, ": ", messageText);

    sendHandlers.sendMessage(curChannelId, messageText, null);
    sendHandlers.getMessages(curChannelId, -1);
}

function initializePage () {
    console.log("Initializing page");
    curUserPfp.src = ownerPfp;
    newGroupButtonElm.addEventListener("click", () => createGroup("test"));
    messageSendButtonElm.addEventListener("click", () => sendMessage());
    messageInputFieldElm.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
    console.log("Current user id: ", curUserId);


}



// Event listeners



