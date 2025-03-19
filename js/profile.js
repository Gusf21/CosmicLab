import { GetCookie } from "./cookies.js";

document.addEventListener("DOMContentLoaded", async () => {

    let sessionId = GetCookie("sessionId")
    sessionId = sessionId.replace(/['"]+/g, '').toUpperCase();
    const response = await fetch(`https://localhost:7168/api/LoginDetails/GetUsername?sessionId=${sessionId}`)

    document.getElementById("username-display").innerText = await response.text();
})

window.LogOut = async () => {

    try {
        await fetch(`https://localhost:7168/api/LoginDetails/LogOut?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {method: "POST"});
    }
    catch (error) {
        console.error(error);
    }
    document.cookie = "sessionId=";
    window.location.href = "index.html"
}