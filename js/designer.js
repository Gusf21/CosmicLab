let state = 1;
let shadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";

let objects = [];
let orbits = [];

document.addEventListener("DOMContentLoaded", async () => {
    LoadData();
    Stars();
});

function DisplayAddUI() {
    if (state == 0) {



    }
    else if (state == 1) {
        // Add New Orbit Here
    }
}

function SetPlanet(element, id, type) {

    let file;

    if (type == "planet") {
        let img = ChaoticFunction(parseInt(id), k=18);
        file = `../images/planets/planet${img}.gif`;
    }
    else if (type == "star") {
        let img = ChaoticFunction(parseInt(id), k=1);
        file = `../images/stars/star${img}.gif`;
    }
    else {
        return;
    }

    element.setAttribute("src", file);
}

function Edit(element) {

    const container = document.getElementById("left-data");

    const displays = container.getElementsByClassName("numerical-data");

    for (let item of displays) {
        item.contentEditable = "true";
    }

    element.style.visibility = "hidden";
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

    const template = document.getElementById("tile-template");
    const container = document.getElementById("tile-container");

    let empty = false;
    while (!empty) {
        if (container.childElementCount == 1) {
            empty = true;
        }
        container.removeChild(container.lastChild);
    }

    objects.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        clone.querySelector("div").dataset.id = element.objectId;
        SetPlanet(clone.querySelector("img"), element.objectId, element.type);
        container.appendChild(clone);
    });

    state = 0;
}

async function SelectOrbits() {
    const object_button = document.getElementById("objects");
    const orbit_button = document.getElementById("orbits");

    object_button.style.boxShadow = "";
    orbit_button.style.boxShadow = shadow;

    const template = document.getElementById("tile-template");
    const container = document.getElementById("tile-container");

    let empty = false;
    while (!empty) {
        if (container.childElementCount == 1) {
            empty = true;
        }
        container.removeChild(container.lastChild);
    }

    orbits.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.querySelector("a").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        clone.querySelector("div").dataset.id = element.orbitId;
        SetPlanet(clone.querySelector("img"), element.orbitId, "orbit");
        container.appendChild(clone);
    });

    state = 1;
}

function GetData(element) {

    let id = element.dataset.id;
    
    let data;
    let index = 0;
    
    if (state == 0) {
        while (!data) {
            if (objects[index].objectId == id) {
                data = objects[index];
            }
            if (index == objects.length) {
                return;
            }
            index++;
        }
    }
    else {
        while (!data) {
            if (orbits[index].orbitId == id) {
                data = orbits[index];
            }
            if (index == orbits.length) {
                return;
            }
            index++;
        }
    }

    return data;
}

async function TileClicked(element) {

    const data = GetData(element);

    const title = document.getElementById("name-display");
    const img = document.getElementById("img-display");
    const edit_button = document.getElementById("edit-button");

    img.style.visibility = "visible";
    edit_button.style.visibility = "visible";

    title.innerText = data.name;
    SetPlanet(img, data.objectId, data.type);

    const left_container = document.getElementById("left-data");
    const left_template = document.getElementById("left-data-template");

    while (left_container.firstChild) {
        left_container.removeChild(left_container.lastChild);
    }

    const type = left_template.content.cloneNode(true);
    const type_labels = type.querySelectorAll("span");
    type_labels[0].innerText = "Type";
    type_labels[1].innerText = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
    type.querySelector("i").style.visibility = "hidden";
    left_container.appendChild(type);
    
    const mass = left_template.content.cloneNode(true);
    const mass_labels = mass.querySelectorAll("span");
    mass_labels[0].innerText = "Mass";
    mass_labels[1].innerText = data.mass;
    mass_labels[1].classList.add("numerical-data")
    if (data.type == "planet") {
        mass_labels[2].innerText = "EM";
        mass_labels[3] = "1 EM is equal to the mass of Earth"
    }
    else {
        mass_labels[2].innerText = "SM";
        mass_labels[3].innerText = "1 SM is equal to the mass of The Sun"
    }
    left_container.appendChild(mass);

    const radius = left_template.content.cloneNode(true);
    const radius_labels = radius.querySelectorAll("span");
    radius_labels[0].innerText = "Radius";
    radius_labels[1].innerText = data.radius;
    radius_labels[1].classList.add("numerical-data")
    if (data.type == "planet") {
        radius_labels[2].innerText = "ER";
        radius_labels[3].innerText = "1 ER is equal to the radius of Earth"
    }
    else {
        radius_labels[2].innerText = "SR";
        radius_labels[3].innerText = "1 SR is equal to the radius of The Sun"
    }
    left_container.appendChild(radius);

}

function ChaoticFunction(x, a = 7.5, b = 5, m = 600) {

    const result = Math.round((Math.pow(Math.sin(a * x + b), 2) * m) % k) + 1;
    return result;
}

async function UpdateDisplay(element) {
    let filter = element.value;
    let remove = []

    if (state == 0) {
        objects.forEach(element => {
            if (!element.name.toLowerCase().includes(filter.toLowerCase())) {
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

    for (let i = 0; i < 200; i++) {
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