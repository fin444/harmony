// Socket stuff


const receiveHandlers = {
    invalidToken:       function () {},
    groupList:          function (groups) {},
    groupInfo:          function (id, channels) {},
    messages:           function (channelId, messages) {},
    typingIndicator:    function (channelId, usersTyping) {},
    userInfo:           function (id, name, pfpId) {}

};
const sendHandlers = {
    token:          function (tok) {},
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

const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port)

socket.addEventListener('open', (event) => {
  console.log('WebSocket connected');
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

const messageInputFieldElm = document.getElementById("type");
const messageSendButtonElm = document.getElementById("send");
const sidebarProfileImageElm = document.getElementById("profile-image");
const messageAreaElm = document.getElementById("messages");

// Variables

let ownerPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let ownerUsername = "test_curuser";
let otherPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let otherUsername = "test_other"

// Functions

function setChatView(chatName, messages) {
    // document.getElementById("header-chat-name").textContent = chatName;
    // // TODO Set header image
    // messageInputField.placeholder = "Message " + chatName;

    // let messageAreaElm = document.getElementById("messages");
    // messageAreaElm.replaceChildren();
    // for(message in messages) {

    // }
    
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
    if (messageText !== "") messageAreaElm.prepend(getMessageDiv(messageText, ownerUsername, ownerPfp, Date.now(), ""));
}

function initializePage () {
    sidebarProfileImageElm.src = ownerPfp;

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

initializePage();

