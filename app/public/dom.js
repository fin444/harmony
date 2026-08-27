import { setGroup, setChannel, getGroup, getChannel, resetOldestMessageIndex, session } from "./session.js";
import { sendHandlers } from "./socket.js";
import { pfpLink } from "./app.js";

export const element = {
    groupList : document.getElementById("group-list"),
    newGroupButton : document.getElementById("new-group"),
    userPfp : document.getElementById("profile-image"),
    signoutButton : document.getElementById("sign-out"),
    chatHeader : document.getElementById("chat-header"),
    chatHeaderTitle : document.getElementById("chat-header-text"),
    inviteUserButton : document.getElementById("invite-user"),
    chatInputContainer : document.getElementById("input"),
    chatFileAttachButton : document.getElementById("attach"),
    chatInputField : document.getElementById("type"),
    chatSendButton : document.getElementById("send"),
    chatMessagesContainer : document.getElementById("messages"),
};

export const populate = {
    groupList : function (groups) {
        hideChat();
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
            deleteButtonElm.addEventListener('click', () => {
                if(getGroup() === group.id) {
                    setGroup(-1);
                    setChannel(-1);
                    deselectAnyChannel();
                }
            });

            function select() {
                const groupButtons = document.querySelectorAll('.group-button');
                groupButtons.forEach(b => b.classList.remove('is-selected'));
                groupButtonElm.classList.toggle('is-selected');
                sendHandlers.getGroupInfo(group.id);
                setGroup(group.id);
            }

            function deselect() {
                groupButtonElm.classList.remove('is-selected');
                deselectAnyChannel();
                clear.channelList();
            }

            let alreadyCurrent = getGroup() === group.id;
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
        hideChat();
        clear.channelList();

        let channelList = document.createElement("div");
        channelList.className = "channel-list";

        let groupButtonContainerElm = document.querySelector(`[data-group-id="${groupId}"]`);
        
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
            deleteButtonElm.addEventListener('click', () => {
                if(getChannel() === channel.id) {
                    setChannel(-1);
                    deselectAnyChannel();
                }
            });

            function select() {
                const channelButtons = document.querySelectorAll('.channel-button');
                channelButtons.forEach(b => b.classList.remove('is-selected'));
                channelButtonElm.classList.toggle('is-selected');

                setChannel(channel.id);
                session.groupName = groupButtonContainerElm.querySelector(".group-button").textContent.substring(2);
                session.channelName = channel.name;

                clear.messages();
                element.chatInputContainer.classList.remove("hidden");
                sendHandlers.getMessages(channel.id, null);
                populate.chatHeaderText(session.groupName, session.channelName);

                showChat();
            }

            function deselect() {
                channelButtonElm.classList.remove('is-selected');
                hideChat();
            }

            let alreadyCurrent = getChannel() === channel.id;
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
            sendHandlers.createThing('channel', 'Untitled channel', groupId);
        });
        channelList.append(channelButtonElm);
        
        groupButtonContainerElm.after(channelList);
    },
    chatHeaderText: function (groupName, channelName) {
        element.chatHeaderTitle.textContent = `@ ${groupName} # ${channelName}`;
    }
};

export const clear = {
    messages : function () {
        resetOldestMessageIndex();
        element.chatMessagesContainer.replaceChildren();
    },
    channelList : function () {
        clear.messages();
        let existingChannelList = document.querySelector(".channel-list");
        if (existingChannelList) {
            existingChannelList.remove();
        }
    }
}

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
    messageDiv : function (id, body, username, userId, timestamp, index, file = null, replyMessageId = null) {
        let container = document.createElement("div");
        container.className = "chat-message-container";
        container.dataset.id = id;
        container.dataset.userId = userId;
        container.dataset.timestamp = timestamp;
        container.dataset.index = index;

        if (userId === session.userId) {
            container.addEventListener("contextmenu", (e) => {
                createPopup(getElement.yesOrNoForm("Delete message?"), () => {
                    console.log("Deleting message with id", id);
                    sendHandlers.deleteThing("message", id);
                });
                e.preventDefault();
            });
        }

        if (replyMessageId) {
            let replyMessage = findMessageElmById(replyMessageId).querySelector(".chat-message-div");

            let replyContainer = document.createElement("div");
            replyContainer.className = "chat-reply-container";

            let replyText = document.createElement("p");
            replyText.className = "chat-message-body";
            replyText.textContent = "Reply to: ";
            replyContainer.append(replyText);

            let otherUsername = document.createElement("p");
            otherUsername.className = "chat-message-username";
            otherUsername = replyMessage.querySelector(".chat-message-username");
            replyContainer.append(otherUsername);

            let otherBody = document.createElement("p");
            otherBody.className = "chat-message-body";
            otherBody = replyMessage.querySelector(".chat-message-body");
            replyContainer.append(otherBody);

            container.append(replyContainer);
        }

        let chatMessage = document.createElement("div");
        chatMessage.className = "chat-message-div";

        let pfpElm = document.createElement("img");
        pfpElm.className = "chat-message-profile-pic";
        pfpElm.src = pfpLink(userId);
        pfpElm.alt = userId;
        chatMessage.append(pfpElm);

        let usernameElm = document.createElement("p");
        usernameElm.className = "chat-message-username";
        usernameElm.textContent = username;
        chatMessage.append(usernameElm);

        let timestampElm = document.createElement("p");
        timestampElm.className = "chat-message-timestamp";
        let dateTime = new Date(timestamp);
        timestampElm.textContent = dateTime.toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit"
        });
        chatMessage.append(timestampElm);

        let bodyElm = document.createElement("p");
        bodyElm.className = "chat-message-body";
        bodyElm.textContent = body;
        chatMessage.append(bodyElm);

        container.append(chatMessage);

        if(file) {
            let fileElm = document.createElement("div");
            fileElm.className = "chat-file";
            container.append(fileElm);
            let fileName;
            fetch(`/file?token=${session.token}&id=${file}`).then(res => {
                if (!res.ok) {
                    throw(res.text());
                }
                fileName = res.headers.get("Content-Disposition");
                fileName = fileName.substring(18, fileName.length - 1);
                return res.blob();
            }).then(res => {
                    if (fileName.endsWith(".png")
                        || fileName.endsWith(".jpg")
                        || fileName.endsWith(".jpeg")
                        || fileName.endsWith(".gif")
                        || fileName.endsWith(".webp")
                        || fileName.endsWith(".heif")
                        || fileName.endsWith(".heic")) {
                        let image = document.createElement("img");
                        image.src = window.URL.createObjectURL(res);
                        image.className = "chat-image-embed";
                        fileElm.append(image);
                    } else {
                        let download = document.createElement("a");
                        let size;
                        if (res.size < 1024) {
                            size = `${res.size} B`
                        } else if (res.size < 1024*1024) {
                            size = `${(res.size / 1024).toFixed(2)} KB`
                        } else {
                            size = `${(res.size / (1024*1024)).toFixed(2)} MB`
                        }
                        download.textContent = `download ${fileName} (${size})`
                        download.className = "chat-file-download";
                        download.href = window.URL.createObjectURL(res);
                        download.download = fileName;
                        fileElm.append(download);
                    }
            }).catch(async err => {
                console.log("ERROR OCCURRED: ", await err);
                handler(null);
            });
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

function hideChatInput() {
    element.chatInputContainer.classList.add("hidden");
}

function hideChatHeader() {    
    element.chatHeader.classList.add("hidden");
}

function hideChatMessages() {    
    element.chatMessagesContainer.classList.add("hidden");
}

function showChatInput() {
    element.chatInputContainer.classList.remove("hidden");
}

function showChatHeader() {
    element.chatHeader.classList.remove("hidden");
}

function showChatMessages() {
    element.chatMessagesContainer.classList.remove("hidden");
}

function deselectAnyChannel() {
    setChannel(-1);
    hideChat();
}

function hideChat() {
    hideChatInput();
    hideChatMessages();
    hideChatHeader();
}

function showChat() {
    showChatInput();
    showChatMessages();
    showChatHeader();
}

export function appendMessage(elm) {
    element.chatMessagesContainer.append(elm);
}

export function prependMessage(elm) {
    element.chatMessagesContainer.prepend(elm);
}

export function deleteMessage(id) {
    findMessageElmById(id).remove();
}

export function findMessageElmById(id) {
    for (const elm of element.chatMessagesContainer.children) {
        if (elm.dataset.id === id.toString()) {
            return elm;
        }
    }
}

function cascadeDuplicateUsersInChat() {
    console.log("Cascading message styles.");
    let chatMessages = element.chatMessagesContainer.children;
    for(let i = 0; i < chatMessages.length; i++) {
        let messageHeader = chatMessages[i].querySelector(".chat-message-div");
        let profilePicture = messageHeader.querySelector(".chat-message-profile-pic");
        let username = messageHeader.querySelector(".chat-message-username");
        let timestamp = messageHeader.querySelector(".chat-message-timestamp");
        
        let nextMessage = chatMessages[i + 1];
        if(nextMessage && chatMessages[i].dataset.userId === nextMessage.dataset.userId) {
            profilePicture.classList.add("hidden");
            username.classList.add("hidden");
            timestamp.classList.add("chat-message-timestamp-cascaded");
        }
    }
}

function clearDuplicateMessages() {
    console.log("Deleting duplicate messages.");
    let chatMessages = element.chatMessagesContainer.children;
    for(let i = 0; i < chatMessages.length; i++) {
        let nextMessage = chatMessages[i + 1];
        if(nextMessage && chatMessages[i].dataset.id === nextMessage.dataset.id) {
            nextMessage.remove();
        }
    }
}

function sortMessages() {
    console.log("Sorting messages.");
    const nodes = [...element.chatMessagesContainer.children].sort((a, b) => {
    return String(b.dataset.timestamp).localeCompare(String(a.dataset.timestamp));
    });
    element.chatMessagesContainer.replaceChildren(...nodes);
}

export function fixMessages() {
    sortMessages();
    clearDuplicateMessages();
    cascadeDuplicateUsersInChat();
}



export function getChatInputFieldText() {
    let text = element.chatInputField.value;
    element.chatInputField.value = "";
    return text;
}

export function updateUserPfp(id) {
    for (let e of document.querySelectorAll(`img[alt="${id}"]`)) {
        e.src = pfpLink(id)
    }
}