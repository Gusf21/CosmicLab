// Starts at 1 so that inital function can be called on load
let state = 1;

// Waits until content is loaded, then simulates selecting the login option
document.addEventListener("DOMContentLoaded", () => {
    LoginClicked();
    document.getElementById("submit-button").addEventListener("click", e => {
        SubmitData(e);
    });
});

function sanitizeInput(input) {
    // Allow only alphanumeric characters, underscores, and dashes
    return input.replace(/[^\w\-]/g, '');
}

function SubmitData(e) {
    e.preventDefault();
    const form = document.getElementById("form")
    const inputs = form.querySelectorAll("input");

    if (!form.checkValidity()) {
        form.reportValidity();
        return
    }

    let username = inputs[0].value;
    let password = inputs[1].value;

    console.log(inputs);
}

function RegisterClicked() {
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
        document.getElementById("login-form").style.display = "none";
        document.getElementById("register-form").style.display = "block";
    }
}

function LoginClicked() {
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
        document.getElementById("register-form").style.display = "none";
        document.getElementById("login-form").style.display = "block";
    }
}

// Helper function to reduce repeated lines 
function FetchChildren() {
    const container = document.getElementById("toggle-container");
    const labels = container.querySelectorAll("*");
    return labels;
}