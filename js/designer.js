let state = 1;
let shadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";
let editing = false;
let adding = false;

let objects = [];
let orbits = [];

document.addEventListener("DOMContentLoaded", async () => {
    LoadData();
    Stars();
});

function DisplayAddUI() {
    Discard();
    editing = true;
    adding = true;
    if (state == 0) {
        const title = document.getElementById("name-display");
        const img = document.getElementById("img-display");
        const edit_button = document.getElementById("edit-button");

        img.style.display = "block";
        edit_button.style.visibility = "visible";

        title.innerText = "";
        title.dataset.id = Math.round(Math.random() * 10000);
        SetPlanet(img, title.dataset.id, "planet");

        const left_container = document.getElementById("left-data");
        const right_container = document.getElementById("right-data");
        const left_template = document.getElementById("left-data-template");

        while (left_container.firstChild) {
            left_container.removeChild(left_container.lastChild);
        }

        while (right_container.firstChild) {
            right_container.removeChild(right_container.lastChild);
        }

        const type = left_template.content.cloneNode(true);
        const type_labels = type.querySelectorAll("span");
        type_labels[0].innerText = "Type";
        type_labels[1].innerText = "Planet";
        type_labels[1].classList.add("text-data")
        type.querySelectorAll("div")[4].style.visibility = "hidden";
        left_container.appendChild(type);

        const mass = left_template.content.cloneNode(true);
        const mass_labels = mass.querySelectorAll("span");
        mass_labels[0].innerText = "Mass";
        mass_labels[1].classList.add("numerical-data")
        mass_labels[2].innerText = "EM";
        mass_labels[3].innerText = "1 EM is equal to the mass of Earth"
        left_container.appendChild(mass);

        const radius = left_template.content.cloneNode(true);
        const radius_labels = radius.querySelectorAll("span");
        radius_labels[0].innerText = "Radius";
        radius_labels[1].classList.add("numerical-data")
        radius_labels[2].innerText = "ER";
        radius_labels[3].innerText = "1 ER is equal to the radius of Earth"
        left_container.appendChild(radius);

        Edit();
    }
    else if (state == 1) {
        // Add New Orbit Here
    }
}

function SetPlanet(element, id, type) {

    let file;

    if (type == "planet") {
        let img = ChaoticFunction(parseInt(id), 18);
        file = `../images/planets/planet${img}.gif`;
    }
    else if (type == "star") {
        let img = ChaoticFunction(parseInt(id), 1);
        file = `../images/stars/star${img}.gif`;
    }
    else {
        return;
    }

    element.setAttribute("src", file);
}

function Discard() {

    if (editing) {

        const discard = document.getElementsByClassName("check-discard-container")[0];
        if (discard != undefined) {
            const button = document.createElement("button");
            button.classList.add("discard-button");
            button.classList.add("red");
            button.innerText = "Discard";
            button.setAttribute("onclick", "CheckDiscardIntent(this)");
            discard.replaceWith(button);
        }

        if (!adding) {

            const name_input = document.getElementById("title-input");
            const data = GetData(name_input.dataset.id);

            const img = document.getElementById("img-display");
            SetPlanet(img, data.objectId, data.type);

            const name = document.createElement("a");
            name.classList.add("name");
            name.id = "name-display";
            name.dataset.id = data.objectId;
            name.innerText = data.name;

            name_input.replaceWith(name);

            const container = document.getElementById("left-data");
            const displays = container.getElementsByClassName("data-input");

            for (let i = 0; i <= 1; i++) {
                let data_label = document.createElement("span");
                data_label.classList.add("numerical-data");
                data_label.classList.add("data-display");

                if (i == 0) {
                    data_label.innerText = data.mass;
                }
                else {
                    data_label.innerText = data.radius;
                }

                displays[0].replaceWith(data_label);
            }

            const type_container = container.getElementsByClassName("data-display-container")[0];
            const type_labels = type_container.querySelectorAll("span");

            type_container.classList.remove("activate-border");

            type_labels[0].classList.remove("type-selected");
            type_labels[0].classList.remove("not-selected");

            type_labels[1].remove();

            document.getElementById("edit-button").style.visibility = "visible";
        }
        else {
            const name_input = document.getElementById("title-input");
            const img = document.getElementById("img-display");
            const edit_button = document.getElementById("edit-button");

            const left_container = document.getElementById("left-data");

            while (left_container.firstChild) {
                left_container.removeChild(left_container.lastChild);
            }

            const name = document.createElement("a");
            name.classList.add("name");
            name.id = "name-display";
            name_input.replaceWith(name);

            img.style.display = "none";
            edit_button.style.visibility = "hidden";
            adding = false;
        }

        editing = false;
        document.getElementById("button-container").style.visibility = "hidden";
    }
}


async function Save() {

    const container = document.getElementById("left-data");
    const title_input = document.getElementById("title-input")
    const selected_type = document.getElementsByClassName("type-selected")[0];
    const displays = container.getElementsByClassName("data-input");

    const name = title_input.value;
    const mass = parseFloat(displays[0].value);
    const radius = parseFloat(displays[1].value);
    const type = selected_type.innerText.toLowerCase();

    let valid = true;

    if (name == "") {
        title_input.classList.add("invalid")
        valid = false;
    }
    else {
        title_input.classList.remove("invalid")
    }

    if (mass <= 0 || isNaN(mass)) {
        displays[0].classList.add("invalid")
        valid = false;
    }
    else {
        displays[0].classList.remove("invalid")
    }

    if (radius <= 0 || isNaN(radius)) {
        displays[1].classList.add("invalid")
        valid = false;
    }
    else {
        displays[1].classList.remove("invalid")
    }

    let updated_data;

    if (valid) {
        if (!adding) {
            const data = GetData(title_input.dataset.id);

            updated_data = data;
            updated_data.name = name;
            updated_data.type = type;
            updated_data.mass = mass;
            updated_data.radius = radius;

            await fetch(`https://localhost:7168/api/Data/EditObject?session_id=${GetCookie("session_id").replace(/['"]+/g, '').toUpperCase()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "objectId": updated_data.objectId,
                    "username": updated_data.username,
                    "orbitId": updated_data.orbitId,
                    "type": updated_data.type,
                    "name": updated_data.name,
                    "mass": updated_data.mass,
                    "radius": updated_data.radius
                })
            });
            Discard();
            LoadData();
        }
        else {

            await fetch(`https://localhost:7168/api/Data/CreateObject?session_id=${GetCookie("session_id").replace(/['"]+/g, '').toUpperCase()}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "name": name,
                    "type": type,
                    "mass": mass,
                    "radius": radius
                })
            });
            Discard();
            LoadData();
        }
    }
}


function SwitchType() {
    const inactive = document.getElementsByClassName("not-selected")[0];
    const activate = document.getElementsByClassName("type-selected")[0];

    inactive.classList.remove("not-selected");
    inactive.classList.add("type-selected");
    activate.classList.remove("type-selected");
    activate.classList.add("not-selected");

    inactive.onclick = null;
    activate.onclick = SwitchType;

    const units = document.getElementsByClassName("unit");
    const tooltips = document.getElementsByClassName("tooltip-text")
    const img = document.getElementById("img-display");
    const id = document.getElementById("title-input").dataset.id;

    if (inactive.innerText == "Planet") {
        units[1].innerText = "EM";
        tooltips[1].innerText = "1 EM is equal to the mass of Earth";
        units[2].innerText = "ER";
        tooltips[2].innerText = "1 ER is equal to the radius of Earth";

        SetPlanet(img, id, "planet");
    }
    else if (inactive.innerText == "Star") {
        units[1].innerText = "SM";
        tooltips[1].innerText = "1 SM is equal to the mass of The Sun";
        units[2].innerText = "SR";
        tooltips[2].innerText = "1 SR is equal to the radius of The Sun";

        SetPlanet(img, id, "star");
    }
}

function NoDiscardIntent(element) {
    const discard = element.parentElement.parentElement;
    const button = document.createElement("button");
    button.classList.add("discard-button");
    button.classList.add("red");
    button.innerText = "Discard";
    button.setAttribute("onclick", "CheckDiscardIntent(this)");
    discard.replaceWith(button);
}

function CheckDiscardIntent(element) {
    const container = document.createElement("div");
    const check_text = document.createElement("span");
    const button_container = document.createElement("div");
    const yes_button = document.createElement("button");
    const no_button = document.createElement("button");

    yes_button.classList.add("yes");
    no_button.classList.add("no");
    yes_button.setAttribute("onclick", "Discard()");
    no_button.setAttribute("onclick", "NoDiscardIntent(this)");

    container.classList.add("check-discard-container");

    container.appendChild(check_text);
    button_container.appendChild(yes_button);
    button_container.appendChild(no_button);
    container.appendChild(button_container);

    check_text.innerText = "Are you sure?";
    yes_button.innerText = "Yes";
    no_button.innerText = "No";

    element.replaceWith(container);
}

function Edit(element) {

    editing = true;

    const container = document.getElementById("left-data");

    const numerical_displays = container.getElementsByClassName("numerical-data");
    const title = document.getElementById("name-display");

    const title_input = document.createElement("input");
    title_input.classList.add("data-input-title");
    title_input.value = title.innerText;
    title_input.id = "title-input";
    title_input.dataset.id = title.dataset.id;
    title.replaceWith(title_input);

    const type = container.getElementsByClassName("text-data")[0];

    for (let i = 0; i <= numerical_displays.length; i++) {
        let input_box = document.createElement("input");
        input_box.classList.add("data-input");
        input_box.type = "number";
        input_box.min = "0";
        input_box.value = numerical_displays[1 - i].textContent;
        numerical_displays[1 - i].replaceWith(input_box);
    }

    type.parentElement.classList.add("activate-border")
    type.classList.add("type-selected");

    if (type.innerText == "Star") {
        const planet_label = document.createElement("span");
        planet_label.classList.add("data-display");
        planet_label.classList.add("not-selected");
        planet_label.onclick = SwitchType;
        planet_label.innerText = "Planet";
        type.insertAdjacentElement("afterend", planet_label);
    }
    else if (type.innerText == "Planet") {
        const planet_label = document.createElement("span");
        planet_label.classList.add("data-display");
        planet_label.classList.add("not-selected");
        planet_label.onclick = SwitchType;
        planet_label.innerText = "Star";
        type.insertAdjacentElement("afterend", planet_label);
    }

    document.getElementById("button-container").style.visibility = "visible";
    document.getElementById("edit-button").style.visibility = "hidden";
}

async function LoadData() {
    const response = await fetch(`https://localhost:7168/api/Data/GetUserCreations?session_id=${GetCookie("session_id").replace(/['"]+/g, '').toUpperCase()}`);

    const data = await response.json();

    objects = data.objects.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : 0));
    orbits = data.orbits;

    SelectObjects();
}

function SelectObjects() {
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

function SelectOrbits() {
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

function GetData(id) {
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

function TileClicked(element) {

    Discard();

    const data = GetData(element.dataset.id);

    const title = document.getElementById("name-display");
    const img = document.getElementById("img-display");
    const edit_button = document.getElementById("edit-button");

    // Hides save and cancel button from edit screen
    // Needed as user could select different object during editing
    document.getElementById("button-container").style.visibility = "hidden";

    img.style.display = "block";
    edit_button.style.visibility = "visible";

    title.innerText = data.name;
    title.dataset.id = element.dataset.id;
    state == 0 ? SetPlanet(img, element.dataset.id, data.type) : img.style.display = "none";

    const left_container = document.getElementById("left-data");
    const left_template = document.getElementById("left-data-template");

    const right_container = document.getElementById("right-data");

    while (left_container.firstChild) {
        left_container.removeChild(left_container.lastChild);
    }

    while (right_container.firstChild) {
        right_container.removeChild(right_container.lastChild);
    }

    if (state == 0) {

        const type = left_template.content.cloneNode(true);
        const type_labels = type.querySelectorAll("span");
        type_labels[0].innerText = "Type";
        type_labels[1].innerText = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
        type_labels[1].classList.add("text-data")
        type.querySelectorAll("div")[4].style.visibility = "hidden";
        left_container.appendChild(type);

        const mass = left_template.content.cloneNode(true);
        const mass_labels = mass.querySelectorAll("span");
        mass_labels[0].innerText = "Mass";
        mass_labels[1].innerText = data.mass;
        mass_labels[1].classList.add("numerical-data")
        if (data.type == "planet") {
            mass_labels[2].innerText = "EM";
            mass_labels[3].innerText = "1 EM is equal to the mass of Earth"
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
    else if (state == 1) {
        console.log(data);

        const displays = [];
        displays.push(["\nSemi-Major Axis", data.smAxis, "AU", "One AU is one astronomical unit, which is the distance from The Sun to the Earth, and is approximately 150,000,000 km"]);
        displays.push(["\nEccentricity", data.eccentricity, "", "Eccentricity is a 0 - 1 value that controls how close to a circle the ellipitical path is. Values closer to 0 are more circular"]);
        displays.push(["\nIncinlation", data.inclination, "Degree", "The inclination is how far above the horizontal plane the orbit is rotated"]);
        displays.push(["Longitude Of\nAscending Node", data.longOfAscNode, "Degree", ""]);
        displays.push(["Argument Of\nPeriapsis", data.argOfPeri, "Degree", ""]);

        for (let i = 0; i < (Math.ceil(displays.length / 2)); i++) {
            let element = left_template.content.cloneNode(true);
            let element_labels = element.querySelectorAll("span");
            element_labels[0].innerText = displays[i][0];
            element_labels[1].innerText = displays[i][1];
            element_labels[2].innerText = displays[i][2];
            element_labels[3].innerText = displays[i][3];
            left_container.appendChild(element);
        }

        for (let i = Math.ceil(displays.length / 2); i < displays.length; i++) {
            let element = left_template.content.cloneNode(true);
            let element_labels = element.querySelectorAll("span");
            element_labels[0].innerText = displays[i][0];
            element_labels[1].innerText = displays[i][1];
            element_labels[2].innerText = displays[i][2];
            element_labels[3].innerText = displays[i][3];
            right_container.appendChild(element);
        }

        document.getElementById("render-window").style.visibility = "visible";
    }

}

function ChaoticFunction(x, k, a = 7.5, b = 6, m = 600) {

    const result = Math.round((Math.pow(Math.sin(a * x + b), 2) * m) % k) + 1;
    return result;
}

function UpdateDisplay(element) {
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


    const container = document.getElementById("tile-container");
    const children = container.children;

    for (var i = 0; i < children.length; i++) {
        if (remove.includes(parseInt(children[i].dataset.id))) {
            children[i].style.display = "none";
        }
        else {
            children[i].style.display = "flex";
        }
    }
}

function Stars() {
    const container = document.getElementById("star-container");

    const star_num = 200 + Math.round((Math.random() * 200));

    for (let i = 0; i < star_num; i++) {
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