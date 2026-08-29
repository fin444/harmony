import { sendHandlers } from "./socket.js";
import { session, userCache, inChannel, uploadFile, getChannel, getGroup, setChannel, setGroup } from "./session.js";
import { element, getChatInputFieldText, createPopup, getElement, hideContextMenus, clear } from "./dom.js";

function createGroup(name) {
    console.log("Create group function called with name: ", name);
    sendHandlers.createThing("group", name);
}

function signout() {
    // TODO: clear token from cookie
    window.location.href = "/";

}

function loadSomeOlderMessages() {
    if (session.oldestMessageIndex <= 1) return;
    console.log("Scrolled to top! Loading more messages!");
    sendHandlers.getMessages(getChannel(), session.oldestMessageIndex - 1);
}

export function sendMessage() {
    if (!inChannel()) {
        console.log("Cannot send message. Not currently in a channel.");
        return;
    }

    let messageText = getChatInputFieldText(true);
    if(messageText === "" && session.messageFileId === null) {
        console.log("Cannot send message. Nothing in text field and no file attached.");
        return;
    }

    console.log("Sending message in channel ", getChannel(), ": ", messageText);
    sendHandlers.sendMessage(getChannel(), messageText, session.messageFileId, session.messageReplyId);
    session.messageReplyId = null;
    clear.replyContainer();

}

export function pfpLink(userId) {
    if (userId in userCache) {
        return `/file?token=${session.token}&id=${userCache[userId].pfpId}`;
    } else {
        return "";
    }
}

export function initializePage () {
    console.log("Initializing page");
    element.userPfp.alt = session.userId;
    element.userPfp.src = pfpLink(session.userId);
    element.chatMessagesContainer.addEventListener("scroll", () => {
        let container = element.chatMessagesContainer;
        const maxScrollUp = container.scrollHeight - container.clientHeight;
        if (Math.abs(container.scrollTop) >= maxScrollUp - 1) {
            loadSomeOlderMessages();
        }
        
    });
    element.chatInputContainer.classList.add("hidden");
    element.newGroupButton.addEventListener("click", () => createGroup("Untitled group"));
    element.chatFileAttachButton.addEventListener("click", () => {
        let form = getElement.fileForm();
        createPopup(form, () => {
            uploadFile(form.querySelector("input[type=file]").files[0], (id) => {
                session.messageFileId = id;
            });
        });
    });
    element.chatSendButton.addEventListener("click", () => sendMessage());
    element.signoutButton.addEventListener("click", () => {signout()});
    element.chatInputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
    element.chatInputField.addEventListener("input", (event) => {
        if (getChatInputFieldText(false).length === 0) {
            if (session.announcedTypingStatus) {
                sendHandlers.typingStatus(getChannel(), false);
                session.announcedTypingStatus = false;
            }
        } else {
            if (!session.announcedTypingStatus) {
                sendHandlers.typingStatus(getChannel(), true);
                session.announcedTypingStatus = true;
            }
        }
    });
    element.userPfp.addEventListener("click", () => {
        let form = getElement.fileForm();
        createPopup(form, () => {
            uploadFile(form.querySelector("input[type=file]").files[0], (id) => {
                sendHandlers.setPfp(id);
            });
        });
    });
    element.inviteUserButton.addEventListener("click", () => {
        let form = getElement.textInputForm();
        createPopup(form, () => {
            let username = form.dataset.string;
            sendHandlers.inviteUser(getGroup(), username);
        });
    });
    document.addEventListener('click', function (event) {
        const contextMenus = document.getElementsByClassName('context-menu');
        for (let menu of contextMenus) {
            if (!menu.contains(event.target)) {
                hideContextMenus();
            }
        }
    });
    console.log("Current user id: ", session.userId);
}
