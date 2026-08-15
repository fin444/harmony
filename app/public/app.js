import { sendHandlers } from "./socket.js";
import { session, inChannel } from "./session.js";
import { element, getMessageFieldText, setPfp } from "./dom.js";
import { messageQueue } from "./session.js";


export const ownerPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
let ownerUsername = "test_user";
let otherPfp = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";

// Functions



function getFormattedDate(date) {
    return date.toLocaleTimeString('en-US', {
        hour12: true,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}


function createGroup(name) {
    console.log("Create group function called with name: ", name);
    sendHandlers.createThing("group", name);
}


function signout() {
    window.location.href = "/";
    // Clear token

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
    sendHandlers.sendMessage(session.channelId, messageText, null);
}



export function initializePage () {
    console.log("Initializing page");
    setPfp(ownerPfp);
    element.newGroupButton.addEventListener("click", () => createGroup("test"));
    element.messageSendButton.addEventListener("click", () => sendMessage());
    element.signoutButton.addEventListener("click", () => {signout()});
    element.messageInputField.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            sendMessage();
        }
    });
    console.log("rent user id: ", session.UserId);
}
