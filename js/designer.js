let state = 1;
let shadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";

document.addEventListener("DOMContentLoaded", async () => {
    SelectObjects();
});

function set_random_planet(element) {

    let file = "../images/planets/planet" + Math.round((Math.random() * 19) + 1) + ".gif";

    element.setAttribute("src", file);
}

async function SelectObjects() {

    if (state == 0) {
        return;
    }

    const object_button = document.getElementById("objects");
    const orbit_button = document.getElementById("orbits");

    object_button.style.boxShadow = shadow;
    orbit_button.style.boxShadow = "";

    const template = document.getElementById("template");
    const container = document.getElementById("tile-container");

    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
    
    const response = await fetch(`https://localhost:7168/api/Data/GetUserCreations?session_id=${GetCookie("session_id").replace(/['"]+/g, '').toUpperCase()}`);

    console.log(data);

    data.objects.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.nickname.charAt(0).toUpperCase() + element.nickname.substring(1);
        set_random_planet(clone.querySelector("img"));
        container.appendChild(clone);
    });

    state = 0;
}

async function SelectOrbits() {
    
    if (state == 1) {
        return;
    }

    const object_button = document.getElementById("objects");
    const orbit_button = document.getElementById("orbits");

    object_button.style.boxShadow = "";
    orbit_button.style.boxShadow = shadow;

    const template = document.getElementById("template");
    const container = document.getElementById("tile-container");

    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }

    const response = await fetch(`https://localhost:7168/api/Data/GetUserCreations?session_id=${GetCookie("session_id").replace(/['"]+/g, '').toUpperCase()}`);

    const data = await response.json();

    data.orbits.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        set_random_planet(clone.querySelector("img"));
        container.appendChild(clone);
    });

    state = 1;
}