import { initializePage } from "./app.js";
import { session, userCache, addMessageToQueue, processMessageQueue, setGroupId, setChannelId } from "./session.js";
import { populateGroupList, populateChannelList } from "./dom.js";

const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port);

const receiveHandlers = {
    invalidToken:       function () {
        window.location.href = "/";
    },
    validToken:         function (userId) {
        console.log("Valid token message from server");
        session.curUserId = userId;
        initializePage();
    },
    groupList:          function (groups) {
        console.log("Group list message from server");
        populateGroupList(groups);
    },
    groupInfo:          function (groupId, channels) {
        console.log("Group info message from server. Server Group ID = ", groupId, " Session Group ID = ", session.groupId);
        if(session.groupId === groupId) {
            populateChannelList(channels, groupId);
        }
    },
    messages:           function (channelId, messages) {
        console.log("Messages message from server");
        console.log("Channel ID messages received in: ", channelId);
        let reversedMessages = messages.toReversed();
        if(session.channelId === channelId) {
            for (let message of reversedMessages) {
                addMessageToQueue(message);
            }
        }
    },
    typingIndicator:    function (channelId, usersTyping) {
        console.log("Typing indicator message from server");
        if(session.channelId === channelId) displayTypingIndicator(usersTyping);
    },
    userInfo:           function (id, name, pfpId) {
        console.log("User info message from server");
        userCache[id] = {id: id, name: name, pfpId: pfpId};
    }
};

export const sendHandlers = {
    token:          function (tok) {
        let data = {type: 'token', token: tok};
        socket.send(JSON.stringify(data));
    },
    getGroupInfo:   function (id) {
        let data = {type: 'getGroupInfo', id: id};
        socket.send(JSON.stringify(data));
        console.log("Current group set to ", session.curGroupId);
        console.log("Channel ID set", session.channelId);
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
    getUserInfo:    function (id) {
        let data = {type: 'getUserInfo', id: id};
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
    session.token = urlParams.get('token');
    sendHandlers.token(session.token);
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
            processMessageQueue();
            break;
        case "typingIndicator":
            receiveHandlers.typingIndicator(data.channelId, data.usersTyping);
            break;
        case "userInfo":
            receiveHandlers.userInfo(data.id, data.username, data.pfpId);
            processMessageQueue();
            break;
        default:
            break;
    }
    
});