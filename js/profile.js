import { GetCookie } from "./cookies.js";

document.addEventListener("DOMContentLoaded", async () => {

    let sessionId = GetCookie("sessionId")
    sessionId = sessionId.replace(/['"]+/g, '').toUpperCase();
    const response = await fetch(`http://cosmiclabapi.co.uk:2030/api/LoginDetails/GetUsername?sessionId=${sessionId}`)

    document.getElementById("username-display").innerText = await response.text();
})

window.LogOut = async () => {

    await fetch(`http://cosmiclabapi.co.uk:2030/api/LoginDetails/LogOut?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {method: "POST"});
    document.cookie = "sessionId=";
    window.location.href = "index.html"
}