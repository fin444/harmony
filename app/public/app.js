// Socket stuff

const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port);

const receiveHandlers = {
    invalidToken:       function () {
        window.location.href = "/";
    },
    validToken:         function (userId) {
        console.log("Valid token message from server");
        curUserId = userId;
    },
    groupList:          function (groups) {
        console.log("Group list message from server");
        populateGroupList(groups);
        
    },
    groupInfo:          function (id, channels) {
        console.log("Group info message from server");
        if(curGroupId === id) populateChannelList(channels);
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
    }
};

const sendHandlers = {
    token:          function (tok) {
        let data = {type: 'token', token: tok};
        socket.send(JSON.stringify(data));
    },
    getGroupInfo:   function (id) {},
    getMessages:    function (channelId, index) {},
    typingStatus:   function (isTyping) {},
    sendMessage:    function (channelId, contents, fileId) {},
    getUserInfo:    function (username) {},
    setPfp:         function (fileId) {},
    createThing:    function (thingType, name) {},
    renameThing:    function (thingType, id, name) {},
    deleteThing:    function (thingType, id) {},
    inviteUser:     function (groupId, userId) {},
};


socket.addEventListener('open', () => {
  console.log('WebSocket connected');
  let urlParams = new URLSearchParams(window.location.search);
  sendHandlers.token(urlParams.get('token'));
  initializePage();
});

socket.addEventListener("message", (event) => {
	console.log("message from server:", event.data)
    let data = JSON.parse(event.data);
    switch (data.type) {
        case "invalidToken":
            receiveHandlers.invalidToken();
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

const chatListElm = document.getElementById("chats");
const messageInputFieldElm = document.getElementById("type");
const messageSendButtonElm = document.getElementById("send");
const sidebarProfileImageElm = document.getElementById("profile-image");
const messageAreaElm = document.getElementById("messages");

// Variables
let curUserId = -1;
let curGroupId = -1;
let curChannelId = 0;
let groupList = [];
let channelList = [];

let ownerPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let ownerUsername = "test_curuser";
let otherPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let otherUsername = "test_other"

// Functions

function getFormattedDate(date) {
    return date.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function populateGroupList() {

}
function populateChannelList() {

}

function setChatView(chatName, messages) {

    
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
    let messageText = messageInputFieldElm.value;
    messageInputFieldElm.value = "";
    // TEMPORARY FUNCTIONALITY TEST - THIS WILL BE CHANGED!!
    if (messageText !== "") messageAreaElm.prepend(getMessageDiv(messageText, ownerUsername, ownerPfp, getFormattedDate(new Date()), ""));
}

function initializePage () {

    sidebarProfileImageElm.src = ownerPfp;
    // setChatList();

    // Test alr exiting messages
    messageAreaElm.prepend(getMessageDiv("hi", ownerUsername, ownerPfp, "4 Aug 2026 13:59:59", ""));
    messageAreaElm.prepend(getMessageDiv("hi 2", otherUsername, otherPfp, "4 Aug 2026 14:00:02", ""));
}

// Event listeners

messageSendButtonElm.addEventListener("click", sendMessage);
messageInputFieldElm.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});
