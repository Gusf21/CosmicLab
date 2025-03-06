document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("send-reset-email").addEventListener("click", (e) => {
        SendResetEmail(e);
    });

    document.getElementById("reset-password").addEventListener("click", (e) => {
        ResetPassword(e);
    });
});

window.RemoveInvalid = (element) => {
    element.classList.remove("invalid");
}

async function SendResetEmail(e) {
    const email = document.getElementById("email").value;

    e.preventDefault();
    const form = document.getElementById("send-email-form")
    const inputs = form.querySelectorAll("input");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const response = fetch(`https://localhost:7168/api/LoginDetails/GenerateResetCode?emailAddress="${email}"`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok()) {
        let text = (await response).text();
        alert(text);
    }
}

async function ResetPassword(e) {

    e.preventDefault();
    const form = document.getElementById("reset-form")
    const inputs = form.querySelectorAll("input");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const resetCode = document.getElementById("code").value;
    const password0 = document.getElementById("password").value;
    const password1 = document.getElementById("password-confirmation").value;

    if (password0 != password1) {
        alert("Passwords do not match");
        return;
    }

    let response = fetch("https://localhost:7168/api/LoginDetails/ResetPassword", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "ResetCode": resetCode,
            "NewPassword": password0,
        })
    });

    if (!(await response.ok)) {
        let text = await (await response).text();
        if (text == "Invalid Reset Code") {
            inputs[0].setCustomValidity("Invalid Reset Code");
            inputs[0].classList.add("invalid");
        }
        form.reportValidity();
    }
    else {
        alert("Password Reset Successfully");
    }
}