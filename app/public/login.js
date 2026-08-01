let usernameField = document.getElementById("username");
let passwordField = document.getElementById("password");

let loginButton = document.getElementById("login");
loginButton.addEventListener("click", onLogin);

let signupButton = document.getElementById("signup");
signupButton.addEventListener("click", onSignup);

let stateText = document.getElementById("state");

function errorStateText(text) {
    stateText.style.color = "red";
    stateText.textContent = text;
}

function setStateText(text) {
    stateText.style.color = "black";
    stateText.textContent = text;
}

setStateText("");

function loginFetch(username, password){
    fetch(`/login?username=${username}&password=${password}`, {
        method: 'GET', 
        headers: {
        },
    }).then(response => {
        console.log("RESPONSE HEADER: ", response);
        if(!response.ok) {
            throw(response);
        }
        return response.text();
    }).then(body => {
        appFetch(body);
    }).catch(error => {
        console.log("ERROR OCCURRED: ", error);
        errorStateText(error.statusText);
    });
}



function signupFetch(username, password){
    fetch(`/signup?username=${username}&password=${password}`, {
        method: 'GET', 
        headers: {
        },
    }).then(response => {
        console.log("RESPONSE HEADER: ", response);
        if(!response.ok) {
            throw(response);
        }
        return response.text();
    }).then(body => {
        appFetch(body);
    }).catch(error => {
        console.log("ERROR OCCURRED: ", error);
        errorStateText(error.statusText);
    });
}

function appFetch(token) {

    window.location.href = `/app?token=${token}`;
}


function onLogin(event) {
    event.preventDefault();
    setStateText("");
    if(usernameField.value.length === 0) {
        errorStateText("Please enter a username");
        return;
    }
    if(passwordField.value.length === 0) {
        errorStateText("Please enter a password");
        return;
    }
    setStateText("Loading...");
    loginFetch(usernameField.value, passwordField.value);
}

function onSignup(event) {
    event.preventDefault();
    setStateText("");
    if(usernameField.value.length === 0) {
        errorStateText("Please enter a username");
        return;
    }
    if(passwordField.value.length === 0) {
        errorStateText("Please enter a password");
        return;
    }
    setStateText("Loading...");
    signupFetch(usernameField.value, passwordField.value);
}

