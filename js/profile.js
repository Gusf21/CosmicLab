document.addEventListener("DOMContentLoaded", async () => {

    let session_id = GetCookie("session_id")
    session_id = session_id.replace(/['"]+/g, '').toUpperCase();
    const response = await fetch(`https://localhost:7168/api/LoginDetails/GetUsername?session_id=${session_id}`)

    document.getElementById("username-display").innerText = await response.text();
})

function LogOut() {
    document.cookie = "session_id=";
    window.location.href = "index.html"
}