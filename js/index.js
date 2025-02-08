import { GetCookie } from "./cookies.js";

document.addEventListener("DOMContentLoaded", () => {
    SetUsername();
});

window.LoginButton = () => {
    if (GetCookie("session_id") == "") {
        window.location.href = "login.html";
    }
    else {
        window.location.href = "profile.html"
    }
}

async function SetUsername() {

    if (GetCookie("session_id") == "") {
        return;
    }

    const label = document.getElementById("username-box");

    let session_id = GetCookie("session_id");

    session_id = session_id.replace(/['"]+/g, '').toUpperCase();

    const response = await fetch(`https://localhost:7168/api/LoginDetails/GetUsername?session_id=${session_id}`)

    label.innerText = await response.text();
}


window.OptionClicked = (url) => {
    if (GetCookie("session_id") == "") {
        window.location.href = "login.html"
    }
    else {
        window.location.href = url;
    }
}