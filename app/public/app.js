const tempImg = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaa8Hmv8r-hqG31BpFaSI-AlPdkFTnIeLHNbKgJVTYCRsm3zMR28O8nMT&s=10";


const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port)

socket.addEventListener("message", (event) => {
	console.log("message from server:", event.data)
    switch (event.data.type) {

    }
})



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

console.log(window.location.href);


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

let messageArea = document.getElementById("messages");

messageArea.prepend(createMessageDiv("hi", "james", tempImg, "4 Aug 2026 13:59:59", ""));
messageArea.prepend(createMessageDiv("hi 2", "james 2", tempImg, "4 Aug 2026 14:00:02", ""));