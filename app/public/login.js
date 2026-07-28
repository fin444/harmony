let usernameField = document.getElementById("username");
let passwordField = document.getElementById("password");

let submitButton = document.getElementById("submit");
submitButton.addEventListener("click", onSubmitButtonPress);

let stateText = document.getElementById("state");

function loginFetch(username, password){
    fetch(`/login?username=${username}&password=${password}`, {
        method: 'GET', 
        headers: {
        },
    }).then(response => {
        console.log("RESPONSE HEADER: ", response);
        return response.text();
    }).then(body => {
        appFetch(body);
    }).catch(error => {
        console.log("ERROR OCCURRED: ", error);
    });
}

function appFetch(token) {
    fetch(`/app?token=${token}`, {
        method: 'GET', 
        headers: {
        },
    }).then(response => {
        console.log("RESPONSE HEADER: ", response);
        return response.text();
    }).then(body => {
        document.open();
        document.write(body);
        document.close();
    }).catch(error => {
        console.log("ERROR OCCURRED: ", error);
    });
}


function onSubmitButtonPress(event) {
    event.preventDefault();
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
    loginFetch(usernameField.value, passwordField.value);
}

