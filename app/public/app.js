import { sendHandlers } from "./socket.js";
import { session, userCache, inChannel, uploadFile } from "./session.js";
import { element, getMessageFieldText, createPopup, getElement } from "./dom.js";

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
    sendHandlers.getMessages(session.channelId, session.oldestMessageIndex - 1);
}

export function sendMessage() {
    if (!inChannel()) {
        console.log("Cannot send message. Not currently in a channel.");
        return;
    }

    let messageText = getMessageFieldText();
    if(messageText === "") {
        console.log("Cannot send message. Nothing in message text field.");
        return;
    }

    console.log("Sending message in channel ", session.channelId, ": ", messageText);
    sendHandlers.sendMessage(session.channelId, messageText, session.messageFileId);
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
    element.messageArea.addEventListener("scroll", () => {
        let container = element.messageArea;
        const maxScrollUp = container.scrollHeight - container.clientHeight;
        if (Math.abs(container.scrollTop) >= maxScrollUp - 1) {
            console.log("Scrolled to top! Loading more messages!");
            loadSomeOlderMessages();
        }
        
    });
    element.messageInputDiv.classList.add("hidden");
    element.newGroupButton.addEventListener("click", () => createGroup("Untitled group"));
    element.messageAttachButton.addEventListener("click", () => {
        let form = createFileForm();
        createPopup(form, () => {
            uploadFile(form.querySelector("input[type=file]").files[0], (id) => {
                session.messageFileId = id;
            });
        });
    });
    element.messageSendButton.addEventListener("click", () => sendMessage());
    element.signoutButton.addEventListener("click", () => {signout()});
    element.messageInputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
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
            sendHandlers.inviteUser(session.groupId, username);
        });
    });
    console.log("Current user id: ", session.userId);
}
