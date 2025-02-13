import { GetCookie } from "./cookies.js";

document.addEventListener("DOMContentLoaded", () => {
    SetUsername();
});

window.LoginButton = () => {
    if (GetCookie("sessionId") == "") {
        window.location.href = "login.html";
    }
    else {
        window.location.href = "profile.html"
    }
}

async function SetUsername() {

    if (GetCookie("sessionId") == "") {
        return;
    }

    const label = document.getElementById("username-box");

    let sessionId = GetCookie("sessionId");

    sessionId = sessionId.replace(/['"]+/g, '').toUpperCase();

    const response = await fetch(`https://cosmiclabapi.co.uk:2030/api/LoginDetails/GetUsername?sessionId=${sessionId}`)

    label.innerText = await response.text();
}


window.OptionClicked = (url) => {
    if (GetCookie("sessionId") == "") {
        window.location.href = "login.html"
    }
    else {
        window.location.href = url;
    }
}