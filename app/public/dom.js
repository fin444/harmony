import { setGroup, setChannel, getGroup, getChannel, resetOldestMessageIndex, session, userCache } from "./session.js";
import { sendHandlers } from "./socket.js";
import { pfpLink } from "./app.js";

export const element = {
    groupList : document.getElementById("group-list"),
    newGroupButton : document.getElementById("new-group"),
    userPfp : document.getElementById("profile-image"),
    signoutButton : document.getElementById("sign-out"),
    chatHeader : document.getElementById("chat-header"),
    chatFooter : document.getElementById("chat-footer"),
    chatHeaderTitle : document.getElementById("chat-header-text"),
    inviteUserButton : document.getElementById("invite-user"),
    chatInputContainer : document.getElementById("input"),
    chatFileAttachButton : document.getElementById("attach"),
    chatInputField : document.getElementById("type"),
    chatSendButton : document.getElementById("send"),
    chatMessagesContainer : document.getElementById("messages"),
    typingIndicator : document.getElementById("typing-indicator"),
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
            container.dataset.channelId = channel.id;
            container.dataset.name = channel.name;

            let channelButtonElm = document.createElement("button");
            channelButtonElm.textContent = '# '+ channel.name;
            channelButtonElm.className = 'channel-button';
            channelButtonElm.type = 'button';

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

        let newChannelButtonElm = document.createElement("button");
        newChannelButtonElm.textContent = '+ New channel';
        newChannelButtonElm.className = 'channel-button';
        newChannelButtonElm.type = 'button';
        newChannelButtonElm.addEventListener("click", () => {
            sendHandlers.createThing('channel', 'Untitled channel', groupId);
        });
        channelList.append(newChannelButtonElm);
        
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
        element.typingIndicator.classList.add("hidden");
    },
    channelList : function () {
        clear.messages();
        let existingChannelList = document.querySelector(".channel-list");
        if (existingChannelList) {
            existingChannelList.remove();
        }
    },
    replyContainer : function () {
        element.chatFooter.querySelector(".chat-reply-container").remove();
    }
}

export const getElement = {
    contextMenu: function (buttons) {
        let contextMenu = document.createElement("div");
        contextMenu.className = "context-menu";
        contextMenu.classList.add("hidden");
        for(let button of buttons) {
            contextMenu.append(button);
        }
        return contextMenu;
    },
    messageDeleteButton: function (id) {
        let button = document.createElement("button");
        button.textContent = "Delete";
        button.addEventListener("click", () => {
            hideContextMenus();
            console.log("Deleting message with id", id);
            sendHandlers.deleteThing("message", id);
        });
        return button;
    },
    messageReplyButton: function (id) {
        let button = document.createElement("button");
        button.textContent = "Reply";
        button.addEventListener("click", () => {
            hideContextMenus();
            let replyContainer = getElement.replyContainer(id);
            let clearButton = document.createElement("button");
            clearButton.textContent = "x";
            clearButton.className = "mini-x-button";
            clearButton.addEventListener("click", () => {replyContainer.remove(); session.messageReplyId = null;});
            replyContainer.prepend(clearButton);
            let replyText = replyContainer.querySelector(".reply-text");
            replyText.textContent = "↪ Replying to:";
            replyContainer.classList.add("chat-footer-reply-container");
            element.chatFooter.insertBefore(replyContainer, element.chatFooter.children[1]);
            session.messageReplyId = id;
        });
        return button;
    },
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
        form.className = "popup-form";
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
        form.className = "popup-form";

        let textInput = document.createElement("input");
        textInput.type = "text";
        textInput.placeholder = (placeholder) ? (placeholder) : ("Enter text");

        let yesButton = document.createElement("button");
        yesButton.type = "submit";
        yesButton.textContent = "Confirm";
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
    replyContainer: function (replyMessageId) {
        let replyContainer = document.createElement("div");
        replyContainer.className = "chat-reply-container";

        let replyText = document.createElement("p");
        replyText.className = "chat-message-body reply-text";
        replyText.style = "font-size: 10px;";
        replyText.textContent = "↪ Reply to:";
        replyContainer.append(replyText);

        let referencedUsername = document.createElement("p");
        referencedUsername.className = "chat-message-username";
        referencedUsername.style = "margin-right: 10px; font-size: 10px;";
        replyContainer.append(referencedUsername);

        let referencedBody = document.createElement("p");
        referencedBody.className = "chat-message-body";
        referencedBody.style = "font-size: 10px;";
        replyContainer.append(referencedBody);

        let referencedMessage = findMessageElmById(replyMessageId)?.querySelector(".chat-message-div");

        if (referencedMessage) {
            referencedUsername.textContent = referencedMessage.querySelector(".chat-message-username")?.textContent || "Unknown User";
            referencedBody.textContent = referencedMessage.querySelector(".chat-message-body")?.textContent || "";
        } else {
            referencedUsername.textContent = "";
            referencedBody.textContent = "Message not found";
        }
        return replyContainer;
    },
    messageDiv: function (id, body, username, userId, timestamp, index, file = null, replyMessageId = null) {
        let container = document.createElement("div");
        container.className = "chat-message-container";
        container.dataset.id = id;
        container.dataset.userId = userId;
        container.dataset.timestamp = timestamp;
        container.dataset.index = index;

        // Context & right click menu stuff
        let buttons = [getElement.messageReplyButton(id)];
        if (userId === session.userId) buttons.push(getElement.messageDeleteButton(id));
        let contextMenu = getElement.contextMenu(buttons);
        
        container.addEventListener("contextmenu", (e) => {
            document.querySelectorAll(".context-menu").forEach(el => el.remove());
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.classList.remove("hidden");
            document.body.append(contextMenu);
            e.preventDefault();
        });

        if (replyMessageId) {
            container.dataset.reply = replyMessageId;
            container.append(getElement.replyContainer(replyMessageId));
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

    popup.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            form.requestSubmit();
        } else if (event.key === "Escape") {
            event.preventDefault();
            destroy(popup);
            destroy(obscure);
        }
    });

    let obscure = document.createElement("div");
    obscure.className = "obscure";
    obscure.addEventListener("click", () => {
        destroy(popup);
        destroy(obscure);
    });

    form.method = "dialog";
    form.addEventListener("submit", (e) => {
        e.preventDefault();
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
    element.typingIndicator.classList.add("hidden");
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
        let isReply = chatMessages[i].dataset.reply;
        
        let nextMessage = chatMessages[i + 1];
        if(nextMessage && chatMessages[i].dataset.userId === nextMessage.dataset.userId && !(isReply)) {
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

export function getChatInputFieldText(clear) {
    let text = element.chatInputField.value;
    if (clear) {
        element.chatInputField.value = "";
        if (session.announcedTypingStatus) {
            sendHandlers.typingStatus(getChannel(), false);
            session.announcedTypingStatus = false;
        }
    }
    return text;
}

export function displayTypingIndicator(usersTyping) {
    const activeTypers = usersTyping.filter(id => id !== session.userId);
    if (activeTypers.length === 0) {
        element.typingIndicator.classList.add("hidden");
        return;
    }
    element.typingIndicator.classList.remove("hidden");
    const cachedNames = [];
    let uncachedCount = 0;
    for (const u of activeTypers) {
        if (u in userCache) {
            if (cachedNames.length < 3) {
                cachedNames.push(userCache[u].name);
            }
        } else {
            uncachedCount++;
            sendHandlers.getUserInfo(u);
        }
    }

    let str = "";
    if (cachedNames.length > 0) {
        str = cachedNames.join(", ");
        const remaining = activeTypers.length - cachedNames.length;
        if (remaining > 0) {
            str += ` and ${remaining} other${remaining > 1 ? "s" : ""}`;
        }
    } else {
        str = `${activeTypers.length} user${activeTypers.length > 1 ? "s" : ""}`;
    }

    str += ` ${activeTypers.length === 1 ? "is" : "are"} typing...`;
    element.typingIndicator.textContent = str;
}

export function updateUserPfp(id) {
    for (let e of document.querySelectorAll(`img[alt="${id}"]`)) {
        e.src = pfpLink(id)
    }
}

export function hideContextMenus() {
    const contextMenus = document.getElementsByClassName('context-menu');
    for (let menu of contextMenus) {
        menu.classList.add("hidden");
    }
}