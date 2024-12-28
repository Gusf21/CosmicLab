let state = 1;
let shadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";

let objects = [];
let orbits = [];

document.addEventListener("DOMContentLoaded", async () => {
    LoadData();
    Stars();
});

function SetPlanet(element, id) {

    let img = ChaoticFunction(parseInt(id));

    console.log(img);

    let file = `../images/planets/planet${img}.gif`;

    element.setAttribute("src", file);
}

async function LoadData() {
    const response = await fetch(`https://localhost:7168/api/Data/GetUserCreations?session_id=${GetCookie("session_id").replace(/['"]+/g, '').toUpperCase()}`);

    const data = await response.json();

    objects = data.objects;
    orbits = data.orbits;

    SelectObjects();
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

    objects.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.nickname.charAt(0).toUpperCase() + element.nickname.substring(1);
        clone.querySelector("div").dataset.id = element.objectId;
        SetPlanet(clone.querySelector("img"), element.objectId);
        container.appendChild(clone);
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

    orbits.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        clone.querySelector("div").dataset.id = element.orbitId;
        SetPlanet(clone.querySelector("img"), element.orbitId);
        container.appendChild(clone);
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

function ChaoticFunction(x, a = 7.5, b = 5, m = 600, k = 19) {

    const result = Math.round((Math.pow(Math.sin(a * x + b), 2) * m) % k) + 1;
    return result;
}

async function UpdateDisplay(element) {
    let filter = element.value;
    let remove = []

    if (state == 0) {
        objects.forEach(element => {
            if (!element.nickname.toLowerCase().includes(filter.toLowerCase())) {
                remove.push(element.objectId);
            }
        });
    }
    else {
        orbits.forEach(element => {
            if (!element.name.toLowerCase().includes(filter.toLowerCase())) {
                remove.push(element.orbitId);
            }
        });
    }

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

function Stars() {
    const container = document.getElementById("star-container");

    for (let i = 0; i < 100; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        
        // Random positions within the container
        const x = Math.random() * 100; // Percentage of width
        const y = Math.random() * 100; // Percentage of height
        
        // Set random position
        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        
        container.appendChild(star);
    }
}