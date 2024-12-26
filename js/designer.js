let state = 1;
let shadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";

let items = [];

document.addEventListener("DOMContentLoaded", async () => {
    SelectObjects();
});

function set_random_planet(element) {

    let file = "../images/planets/planet" + Math.round((Math.random() * 19) + 1) + ".gif";

    element.setAttribute("src", file);
}

async function SelectObjects() {
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

    const data = await response.json();

    items = [];

    data.objects.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.nickname.charAt(0).toUpperCase() + element.nickname.substring(1);
        clone.querySelector("div").dataset.id = element.objectId;
        set_random_planet(clone.querySelector("img"));
        container.appendChild(clone);
        items.push(element);
    });

    state = 0;
}

async function SelectOrbits() {
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

    items = [];

    data.orbits.forEach(element => {

        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        clone.querySelector("div").dataset.id = element.orbitId;
        set_random_planet(clone.querySelector("img"));
        container.appendChild(clone);
        items.push(element);
    });

    state = 1;
}

async function TileClicked(element) {

    let id = element.dataset.id;

    let data;

    let index = 0;
    while (!data) {
        if (state == 0) {
            if (items[index].objectId == id) {
                data = items[index]
            }
        }
        else if (state == 1) {
            if (items[index].orbitId == id) {
                data = items[index];
            }
        }
        index++;
        if (index == items.length && !data) {
            return;
        }
    }

    console.log(data);
}

async function UpdateDisplay(element) {
    let filter = element.value;
    let remove = []
    items.forEach(element => {
        if (state == 0) {
            if (!element.nickname.toLowerCase().includes(filter.toLowerCase())) {
                remove.push(element.objectId);
            }
        }
        else {
            if (!element.name.toLowerCase().includes(filter.toLowerCase())) {
                remove.push(element.orbitId);
            }
        }
    });

    console.log(remove);

    const container = document.getElementById("tile-container");
    const children = container.children;

    for (var i = 0; i < children.length; i++) {
        if (remove.includes(parseInt(children[i].dataset.id))) {
            console.log(children[i].dataset.id);
            children[i].style.display = "none";
        }
        else {
            children[i].style.display = "flex";
        }
    }
}