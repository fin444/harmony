// const socket = new WebSocket("ws://" + window.location.hostname + ":" + window.location.port)

// socket.addEventListener("message", (event) => {
//     console.log("message from server:", event.data)
// })

let usernameField = document.getElementById("username");
let passwordField = document.getElementById("password");

let submitButton = document.getElementById("submit");
submitButton.addEventListener("click", onSubmitButtonPress);

let stateText = document.getElementById("state");



function onSubmitButtonPress() {
    stateText.style.color = "black";
    stateText.textContent = "";
    if(usernameField.value.length === 0) {
        stateText.style.color = "red";
        stateText.textContent += "Please enter a username\n";
        return;
    }
    if(passwordField.value.length === 0) {
        stateText.style.color = "red";
        stateText.textContent += "Please enter a password\n";
        return;
    }
    stateText.textContent = "Loading...";
    let data = JSON.stringify({"type":"login", "username":usernameField.value, "password":passwordField.value});



    // socket.send(data);
}

