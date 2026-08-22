import { setChannelId, setGroupId, resetOldestMessageIndex, session } from "./session.js";
import { sendHandlers } from "./socket.js";
import { pfpLink } from "./app.js";

export const element = {
    groupList : document.getElementById("group-list"),
    userPfp : document.getElementById("profile-image"),
    signoutButton : document.getElementById("sign-out"),

    groupHeaderTitle : document.getElementById("group-header-text"),
    messageInputDiv : document.getElementById("input"),
    messageAttachButton : document.getElementById("attach"),
    messageInputField : document.getElementById("type"),
    messageSendButton : document.getElementById("send"),

    messageArea : document.getElementById("messages"),
    newGroupButton : document.getElementById("new-group"),
};

export function createPopup(form, onSubmit) {
    function destroy(element) {
        element.remove();
    }

    let popup = document.createElement("dialog");
    popup.open = true;

    let obscure = document.createElement("div");
    obscure.className = "obscure";
    obscure.addEventListener("click", () => {
        destroy(popup);
        destroy(obscure);
    });

    form.method = "dialog";
    form.addEventListener("submit", () => {
        console.log("Form submitted.");
        onSubmit();
        destroy(popup);
        destroy(obscure);
    });
    form.addEventListener("reset", () => {
        console.log("Form cancelled.");
        destroy(popup);
        destroy(obscure);
    })
    popup.appendChild(form);
    
    document.body.appendChild(obscure);
    document.body.appendChild(popup);
}

function getYesOrNoForm (prompt) {
    let form = document.createElement("form");
    let promptElm = document.createElement("h2");
    promptElm.textContent = prompt;

    let yesButton = document.createElement("button");
    yesButton.type = "submit";
    yesButton.textContent = "Yes";

    let noButton = document.createElement("button");
    noButton.type = "reset";
    noButton.textContent = "No";

    form.appendChild(promptElm);
    form.appendChild(yesButton);
    form.appendChild(noButton);

    return form;
}

function getTextInputForm (placeholder) {
    let form = document.createElement("form");

    let textInput = document.createElement("input");
    textInput.type = "text";
    textInput.placeholder = (placeholder) ? (placeholder) : ("Enter text");

    let yesButton = document.createElement("button");
    yesButton.type = "submit";
    yesButton.textContent = "Done";
    form.addEventListener("submit", () => {
        form.dataset.string = textInput.value;
    });

    let noButton = document.createElement("button");
    noButton.type = "reset";
    noButton.textContent = "Cancel";

    form.appendChild(textInput);
    form.appendChild(yesButton);
    form.appendChild(noButton);

    return form;
}

function getDeleteButton(thing, thingType) {
    let deleteButtonElm = document.createElement("button");
    deleteButtonElm.title = "Delete " + thing.name;
    deleteButtonElm.textContent = "x";
    deleteButtonElm.type = 'button';
    deleteButtonElm.className = `mini-${thingType}-button`;

    deleteButtonElm.addEventListener('click', () => {
        console.log('Delete button clicked!');
        createPopup(getYesOrNoForm(`Delete ${thingType} ${thing.name}?`), () => {
            console.log(`Deleting ${thingType} ${thing.name} with ID: ${thing.id}`);
            sendHandlers.deleteThing(thingType, thing.id);
            noChannelSelected();
        });
    });
    return deleteButtonElm;
}

function getRenameButtonElm(thing, thingType) {

    let renameButtonElm = document.createElement("button");
    renameButtonElm.title = "Rename " + thing.name;
    renameButtonElm.textContent = "R";
    renameButtonElm.type = 'button';
    renameButtonElm.className = `mini-${thingType}-button`;

    renameButtonElm.addEventListener('click', () => {
        let form = getTextInputForm(`Rename ${thing.name}`);
        createPopup(form, () => {
            console.log(`Renaming ${thingType} ${thing.name} with ID: ${thing.id} to ${form.dataset.string}`);
            sendHandlers.renameThing(thingType, thing.id, form.dataset.string);
        });
        console.log('Rename button clicked!');
    });
    return renameButtonElm;
}

function noChannelSelected() {
    element.messageInputDiv.classList.add("hidden");
    clearMessages();
}

// Ugly ass function, honestly just collapse and don't be bothered reading
export function populateGroupList(groups) { 
    element.groupList.replaceChildren();   
    for(let group of groups) {
        let container = document.createElement("div");
        container.className = ("list-button-container");

        let groupButtonElm = document.createElement("button");
        groupButtonElm.textContent = "@ " + group.name;
        groupButtonElm.className = 'group-button';
        groupButtonElm.title = "Open " + group.name;
        container.dataset.groupId = group.id;
        groupButtonElm.type = 'button';

        let renameButtonElm = getRenameButtonElm(group, "group");
        let deleteButtonElm = getDeleteButton(group, "group");
        container.addEventListener('mouseenter', () => {
            container.appendChild(renameButtonElm);
            container.appendChild(deleteButtonElm);
        });
        container.addEventListener('mouseleave', () => {
            if (container.contains(deleteButtonElm)) {
                container.removeChild(deleteButtonElm);
            }
            if (container.contains(renameButtonElm)) {
                container.removeChild(renameButtonElm);
            }
        });

        function selected() {
            const groupButtons = document.querySelectorAll('.group-button');
            groupButtons.forEach(b => b.classList.remove('is-selected'));
            groupButtonElm.classList.toggle('is-selected');
            let groupId = parseInt(container.dataset.groupId);
            sendHandlers.getGroupInfo(groupId);
            setGroupId(groupId);
        }

        if(session.groupId === group.id) {
            selected();
        }
        groupButtonElm.addEventListener("click", selected());
        container.appendChild(groupButtonElm);
        element.groupList.append(container);
    }
}

export function appendMessage(elm) {
    element.messageArea.append(elm);
}

export function prependMessage(elm) {
    element.messageArea.prepend(elm);
}

export function sortMessages() {
    const nodes = [...element.messageArea.children].sort((a, b) => {
        return String(b.dataset.timestamp).localeCompare(String(a.dataset.timestamp));
    });
    console.log("Sorting messages.")
    element.messageArea.replaceChildren(...nodes);
}

export function populateChannelList(channels, groupId) {
    let channelList = document.createElement("div");
    channelList.className = "channel-list";

    let groupButton = document.querySelector(`[data-group-id="${groupId}"]`);
    
    let existingChannelList = document.querySelector(".channel-list");
    if (existingChannelList) {
        existingChannelList.remove();
    }
    
    for(let channel of channels) {

        let container = document.createElement("div");
        container.className = ("list-button-container");

        let channelButtonElm = document.createElement("button");
        channelButtonElm.textContent = '# '+ channel.name;
        channelButtonElm.className = 'channel-button';
        channelButtonElm.type = 'button';
        channelButtonElm.dataset.channelId = channel.id;
        channelButtonElm.dataset.name = channel.name;

        let renameButtonElm = getRenameButtonElm(channel, "channel");
        let deleteButtonElm = getDeleteButton(channel, "channel");

        container.addEventListener('mouseenter', () => {
            container.appendChild(renameButtonElm);
            container.appendChild(deleteButtonElm);
        });
        container.addEventListener('mouseleave', () => {
            if (container.contains(deleteButtonElm)) {
                container.removeChild(deleteButtonElm);
            }
            if (container.contains(renameButtonElm)) {
                container.removeChild(renameButtonElm);
            }
        });

        function selected() {
            const channelButtons = document.querySelectorAll('.channel-button');
            let channelId = parseInt(channelButtonElm.dataset.channelId);
            channelButtons.forEach(b => b.classList.remove('is-selected'));
            channelButtonElm.classList.toggle('is-selected');
            setChannelId(channelId);
            clearMessages();
            element.messageInputDiv.classList.remove("hidden");
            sendHandlers.getMessages(channelId, null);
        }

        if(session.groupId === groupId && session.channelId === channel.id) {
            selected();
        }
        channelButtonElm.addEventListener("click", selected());
        container.append(channelButtonElm);
        channelList.append(container);
    }

    let channelButtonElm = document.createElement("button");
    channelButtonElm.textContent = '+ New channel';
    channelButtonElm.className = 'channel-button';
    channelButtonElm.type = 'button';
    channelButtonElm.addEventListener("click", () => {
        const channelButtons = document.querySelectorAll('.channel-button');
            sendHandlers.createThing('channel', 'Untitled channel', groupId);
        });
        channelList.append(channelButtonElm);
    
    groupButton.after(channelList);
}

export function clearMessages() {
    resetOldestMessageIndex();
    element.messageArea.replaceChildren();
}

export function getMessageDiv(message, username, userId, timestamp, file, index) {
    let parentElm = document.createElement("div");
    parentElm.dataset.timestamp = timestamp;
    parentElm.dataset.index = index;

    let messageElm = document.createElement("div");
    messageElm.className = "chat-element-div";

    let timestampElm = document.createElement("p");
    timestampElm.className = "chat-timestamp";
    let dateTime = new Date(timestamp);
    timestampElm.textContent = dateTime.toLocaleTimeString();
    messageElm.append(timestampElm);

    let pfpElm = document.createElement("img");
    pfpElm.className = "chat-profile-pic";
    pfpElm.src = pfpLink(userId);
    pfpElm.alt = userId;
    messageElm.append(pfpElm);

    let usernameElm = document.createElement("p");
    usernameElm.className = "chat-username";
    usernameElm.textContent = username;
    messageElm.append(usernameElm);


    let bodyElm = document.createElement("p");
    bodyElm.className = "chat-message";
    bodyElm.textContent = message;
    messageElm.append(bodyElm);

    parentElm.append(messageElm);

    if(file) {
        let fileElm = document.createElement("div");
        fileElm.className = "chat-file";
        // File stuff here
        parentElm.append(fileElm);
    }

    return parentElm;
}

export function getMessageFieldText() {
    let text = element.messageInputField.value;
    element.messageInputField.value = "";
    return text;
}

export function updateUserPfp(id) {
    for (let e of document.querySelectorAll(`img[alt="${id}"]`)) {
        e.src = pfpLink(id)
    }
}

export function createFileForm() {
    let form = document.createElement("form");
    let input = document.createElement("input");
    input.type = "file";
    form.appendChild(input);
    let submit = document.createElement("input");
    submit.type = "submit";
    submit.value = "upload";
    form.appendChild(submit);
    return form;
}
