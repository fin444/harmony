import { setChannelId, setGroupId } from "./session.js";
import { sendHandlers } from "./socket.js";

export const element = {
    groupList : document.getElementById("group-list"),
    userPfp : document.getElementById("profile-image"),

    groupHeaderTitle : document.getElementById("group-header-text"),
    messageInputField : document.getElementById("type"),
    messageSendButton : document.getElementById("send"),

    messageArea : document.getElementById("messages"),
    newGroupButton : document.getElementById("new-group"),
};

export function populateGroupList(groups) { 
    element.groupList.replaceChildren();   
    for(let group of groups) {
        let groupButtonElm = document.createElement("button");

        groupButtonElm.textContent = "ID: " + group.id + " " + group.name;
        groupButtonElm.className = 'group-button';
        groupButtonElm.dataset.groupId = group.id;
        groupButtonElm.type = 'button';

        groupButtonElm.addEventListener("click", () => {
            const groupButtons = document.querySelectorAll('.group-button');
            groupButtons.forEach(b => b.classList.remove('is-selected'));
            groupButtonElm.classList.toggle('is-selected');
            setGroupId(groupButtonElm.dataset.groupId);
            sendHandlers.getGroupInfo(groupButtonElm.dataset.groupId);
        });
        element.groupList.append(groupButtonElm);
    }
}

export function prependMessage(elm) {
    element.messageArea.prepend(elm);
}

export function populateChannelList(channels, groupId) {
    let channelList = document.createElement("form");
    channelList.style = "channel-list";

    // Find the group button with matching id
    const groupButton = document.querySelector(`[data-group-id="${groupId}"]`);
    
    // Clear any existing channel list from this group button
    const existingChannelList = groupButton.querySelector("form");
    if (existingChannelList) {
        existingChannelList.remove();
    }
    
    for(let channel of channels) {
        let channelButtonElm = document.createElement("button");
        channelButtonElm.textContent = channel.name;
        channelButtonElm.className = 'group-button';
        channelButtonElm.dataset.channelId = channel.id;
        channelButtonElm.addEventListener("click", () => {
            const channelButtons = document.querySelectorAll('.group-button');
            channelButtons.forEach(b => b.classList.remove('is-selected'));
            channelButtonElm.classList.toggle('is-selected');
            setChannelId(channel.id);
            clearMessages();
            sendHandlers.getMessages(channel.id, 30);
        });
        channelList.append(channelButtonElm);
    }
    
    // Append the channel list to the group button
    groupButton.append(channelList);
}

export function clearMessages() {
    messageAreaElm.replaceChildren();
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

export function getMessageFieldText() {
    let text = element.messageInputField.value;
    element.messageInputField.value = "";
    return text;
}

export function setPfp(src) {
    element.userPfp.src = src;
}