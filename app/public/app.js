const tempImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";
const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port)
const handlers = {
    invalidToken: function () {

    },
    groupList: function () {

    },
    groupInfo: function () {

    },
    messages: function () {

    },
    typingIndicator: function () {

    },
    userInfo: function () {

    }

};


const messageArea = document.getElementById("messages");
const messageInputField = document.getElementById("type");
const messageSendButton = document.getElementById("send");

socket.addEventListener("message", (event) => {
	console.log("message from server:", event.data)
    switch (event.data.type) {

    }
});



function createMessageDiv(message, username, pfpHref, timestamp, file) {
    let parentElm = document.createElement("div");
    parentElm.className = "chat-element-div";

    let timestampField = document.createElement("p");
    timestampField.className = "chat-timestamp";
    timestampField.textContent = timestamp;

    let messageField = document.createElement("p");
    messageField.className = "chat-message";
    messageField.textContent = message;

    let usernameField = document.createElement("p");
    usernameField.className = "chat-username";
    usernameField.textContent = username;

    let profilePic = document.createElement("img");
    profilePic.className = "chat-profile-pic";
    profilePic.src = pfpHref;

    parentElm.append(timestampField);
    parentElm.append(profilePic);
    parentElm.append(usernameField);
    parentElm.append(messageField);

    return parentElm;
}


let profileImageElm = document.getElementById("profile-image");
profileImageElm.src = tempImg;

messageSendButton.addEventListener("click", sendMessage);
messageInputField.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});

function sendMessage() {
    let messageText = messageInputField.value;
    messageInputField.value = "";
    // TEMPORARY FUNCTIONALITY TEST - THIS WILL BE CHANGED!!
    if (messageText !== "") messageArea.prepend(createMessageDiv(messageText, "james", tempImg, Date.now(), ""));
}


messageArea.prepend(createMessageDiv("hi", "james", tempImg, "4 Aug 2026 13:59:59", ""));
messageArea.prepend(createMessageDiv("hi 2", "james 2", tempImg, "4 Aug 2026 14:00:02", ""));