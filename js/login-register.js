// Starts at 1 so that inital function can be called on load
let state = 1;

// Waits until content is loaded, then simulates selecting the login option
document.addEventListener("DOMContentLoaded", () => {
    LoginClicked();
    document.getElementById("login-submit-button").addEventListener("click", e => {
        CheckLogin(e);
    });

    document.getElementById("register-submit-button").addEventListener("click", e => {
        Register(e);
    });
});

async function Register(e) {
    e.preventDefault();
    const form = document.getElementById("register-form")
    const inputs = form.querySelectorAll("input");

    inputs[0].setCustomValidity("");

    if (!form.checkValidity()) {
        form.reportValidity();
        return
    }

    let email = inputs[0].value;
    let username = inputs[1].value;
    let password0 = inputs[2].value;
    let password1 = inputs[3].value;

    if (password0 != password1) {
        inputs[2].setCustomValidity("Please ensure both passwords are the same")
        form.reportValidity();
    }
    else {
        inputs[2].setCustomValidity("");
    }

    const response = await fetch("https://localhost:7168/api/LoginDetails/AddUser", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "Email": email,
            "Username": username,
            "Password": password0,
        })
    });

    if (response.ok) {
        document.cookie = `sessionId=${(await response.text())}`;
        window.location.href = "index.html";
    }
    else {
        let validity = await response.text();
        console.log(validity);
        if (validity[0] == "1") {
            inputs[0].setCustomValidity("Email Already In Use");
        }
        
        if (validity[1] == "1") {
            inputs[1].setCustomValidity("Username Already In Use");
        }
        
        form.reportValidity();
    }
}

async function CheckLogin(e) {
    e.preventDefault();
    const form = document.getElementById("login-form")
    const inputs = form.querySelectorAll("input");

    inputs[0].setCustomValidity("");

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    let email = inputs[0].value;
    let password = inputs[1].value;

    const response = await fetch("https://localhost:7168/api/LoginDetails/Login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
           "Email": email,
           "Username": "",
           "Password": password
        })
    });

    if (response.ok) {
        document.cookie = `sessionId=${(await response.text())}; max-age=${24 * 60 * 60}`;
        window.location.href = "index.html";
    }
    else {
        inputs[0].setCustomValidity("Password or username is incorrect");
        inputs[0].classList.add("invalid");
        inputs[1].classList.add("invalid");
    }
}

window.RegisterClicked = () => {
    // Checks that Register is not already selected (avoid unnecessary processing)
    if (state == 1) {
        return
    }
    else {
        // Sets state to indicate registers is selected
        state = 1;
        // Fetches div and then extracts h1 tags
        const labels = FetchChildren();
        //Sets buttons to correct opacity
        labels[0].style.opacity = 0.2;
        labels[1].style.opacity = 1;
        document.getElementById("login-window").style.display = "none";
        document.getElementById("register-window").style.display = "block";
        document.getElementById("window-container").style.height = "46rem"
    }
}

window.LoginClicked = () => {
    // Checks that Login is not already selected (avoid unnecessary processing)
    if (state == 0) {
        return
    }
    else {
        // Sets state to indicate login is selected
        state = 0;
        // Fetches div and then extracts h1 tags
        const labels = FetchChildren();
        //Sets buttons to correct opacity
        labels[0].style.opacity = 1;
        labels[1].style.opacity = 0.2;
        document.getElementById("register-window").style.display = "none";
        document.getElementById("login-window").style.display = "block";
        document.getElementById("window-container").style.height = "37rem"
    }
}

window.ResetPassword = async () => {
    const email = document.getElementById("email").value;

    console.log(email);

    const response = fetch(`https://localhost:7168/api/LoginDetails/ResetPassword?emailAddress="${email}"`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        let text = (await response).text();
        alert(text);
    }
}

// Helper function to reduce repeated lines 
function FetchChildren() {
    const container = document.getElementById("toggle-container");
    const labels = container.querySelectorAll("*");
    return labels;
}

window.RemoveInvalid = (element) => {
    element.classList.remove("invalid");
}