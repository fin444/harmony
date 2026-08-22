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

export const populate = {
    groupList : function (groups) {
        clearMessageView();
        element.groupList.replaceChildren();   
        for(let group of groups) {
            let container = document.createElement("div");
            container.className = ("list-button-container");
            container.dataset.groupId = group.id;

            let groupButtonElm = document.createElement("button");
            groupButtonElm.textContent = "@ " + group.name;
            groupButtonElm.className = 'group-button';
            groupButtonElm.title = "Open " + group.name;
            groupButtonElm.type = 'button';

            let renameButtonElm = getElement.renameButton(group, "group");
            let deleteButtonElm = getElement.deleteButton(group, "group");

            function select() {
                const groupButtons = document.querySelectorAll('.group-button');
                groupButtons.forEach(b => b.classList.remove('is-selected'));
                groupButtonElm.classList.toggle('is-selected');
                sendHandlers.getGroupInfo(group.id);
                setGroupId(group.id);
            }

            function deselect() {
                groupButtonElm.classList.remove('is-selected');
                noChannelSelected();
                clearChannelList();
            }

            let alreadyCurrent = session.groupId === group.id;
            if(alreadyCurrent) select();
            groupButtonElm.addEventListener("click", () => {
                if(groupButtonElm.classList.contains('is-selected')) {
                    deselect();
                    return;
                }
                select();
            });
            container.appendChild(groupButtonElm);
            container.appendChild(renameButtonElm);
            container.appendChild(deleteButtonElm);
            element.groupList.appendChild(container);
        }
    },
    channelList : function (channels, groupId) {
        clearMessageView();
        let channelList = document.createElement("div");
        channelList.className = "channel-list";

        let groupButtonContainerElm = document.querySelector(`[data-group-id="${groupId}"]`);
        
        clearChannelList();
        
        for(let channel of channels) {
            let container = document.createElement("div");
            container.className = ("list-button-container");

            let channelButtonElm = document.createElement("button");
            channelButtonElm.textContent = '# '+ channel.name;
            channelButtonElm.className = 'channel-button';
            channelButtonElm.type = 'button';
            container.dataset.channelId = channel.id;
            container.dataset.name = channel.name;

            let renameButtonElm = getElement.renameButton(channel, "channel");
            let deleteButtonElm = getElement.deleteButton(channel, "channel");

            function select() {
                const channelButtons = document.querySelectorAll('.channel-button');
                channelButtons.forEach(b => b.classList.remove('is-selected'));
                channelButtonElm.classList.toggle('is-selected');
                setChannelId(channel.id);
                clearMessages();
                element.messageInputDiv.classList.remove("hidden");
                sendHandlers.getMessages(channel.id, null);
            }

            function deselect() {
                channelButtonElm.classList.remove('is-selected');
                noChannelSelected();
            }

            let alreadyCurrent = session.groupId === groupId && session.channelId === channel.id;
            if(alreadyCurrent) select();
            channelButtonElm.addEventListener("click", () => {
                if(channelButtonElm.classList.contains('is-selected')) {
                    deselect();
                    return;
                }
                select();
            });
            container.append(channelButtonElm);
            container.appendChild(renameButtonElm);
            container.appendChild(deleteButtonElm);
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
        
        groupButtonContainerElm.after(channelList);
    }
};

export const getElement = {
    fileForm: function () {
        let form = document.createElement("form");

        let input = document.createElement("input");
        input.type = "file";
        form.appendChild(input);

        let submit = document.createElement("input");
        submit.type = "submit";
        submit.value = "upload";

        form.appendChild(submit);
        return form;
    },
    yesOrNoForm: function (prompt) {
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
    },
    textInputForm: function (placeholder) {
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
    },
    deleteButton: function (thing, thingType) {
        let deleteButtonElm = document.createElement("button");
        deleteButtonElm.title = "Delete " + thing.name;
        deleteButtonElm.textContent = "x";
        deleteButtonElm.type = 'button';
        deleteButtonElm.className = `mini-${thingType}-button`;

        deleteButtonElm.addEventListener('click', () => {
            let form = getElement.yesOrNoForm(`Delete ${thingType} ${thing.name}?`);
            console.log('Delete button clicked!');
            createPopup(form, () => {
                console.log(`Deleting ${thingType} ${thing.name} with ID: ${thing.id}`);
                sendHandlers.deleteThing(thingType, thing.id);
            });
        });
        return deleteButtonElm;
    },
    renameButton: function (thing, thingType) {
        let renameButtonElm = document.createElement("button");
        renameButtonElm.title = "Rename " + thing.name;
        renameButtonElm.textContent = "R";
        renameButtonElm.type = 'button';
        renameButtonElm.className = `mini-${thingType}-button`;

        renameButtonElm.addEventListener('click', () => {
            let form = getElement.textInputForm(`Rename ${thing.name}`);
                createPopup(form, () => {
                console.log(`Renaming ${thingType} ${thing.name} with ID: ${thing.id} to ${form.dataset.string}`);
                sendHandlers.renameThing(thingType, thing.id, form.dataset.string);
            });
            console.log('Rename button clicked!');
        });
        return renameButtonElm;
    },
    messageDiv : function (message, username, userId, timestamp, file, index) {
        let container = document.createElement("div");
        container.dataset.timestamp = timestamp;
        container.dataset.index = index;

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

        container.append(messageElm);

        if(file) {
            let fileElm = document.createElement("div");
            fileElm.className = "chat-file";
            // File stuff here
            container.append(fileElm);
        }

        return container;
    }
}

export function createPopup (form, onSubmit) {
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

function clearMessageView() {
    element.messageInputDiv.classList.add("hidden");
    clearMessages();
}

function clearChannelList() {
    let existingChannelList = document.querySelector(".channel-list");
    if (existingChannelList) {
        existingChannelList.remove();
    }
}

function noChannelSelected() {
    setChannelId(-1);
    setGroupId(-1);
    clearMessageView();
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

export function clearMessages() {
    resetOldestMessageIndex();
    element.messageArea.replaceChildren();
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