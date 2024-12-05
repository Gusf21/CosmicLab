document.addEventListener("DOMContentLoaded", () => {
    SetUsername();
});

function SetUsername() {
    const label = document.getElementById("username-box");
    label.innerText = localStorage.getItem("username");

    /*
    if (localStorage.getItem("username") == null) {
        window.location.href = "login.html";
    }
        */
}

function OptionClicked(object) {
    window.location.href = object.senderurl;
}