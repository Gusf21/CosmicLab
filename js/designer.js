import { GetCookie } from "./cookies.js";

// Glob imports for all images in the planets and stars folders
const planets = import.meta.glob('../images/planets/*.gif', { eager: true});
const stars = import.meta.glob('../images/stars/*.gif', { eager: true});

// Paths for all images in the planets and stars folders
const planetPaths = [];
const starPaths = [];

// Adds all paths to the respective arrays
for (const path in planets) {
    planetPaths.push(path);
}

for (const path in stars) {
    starPaths.push(path);
}

let state = 1;
let shadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";
let adding = false;

let objects = [];
let orbits = [];

// Loads all data and adds stars to viewing/edit/add window
document.addEventListener("DOMContentLoaded", async () => {
    LoadData("objects");
    Stars();
});

// Displays window to add a new object
window.DisplayAddUI = () => {

    Clear();

    adding = true;

    const title = document.getElementById("name-display");
    title.innerText = "";
    title.dataset.id = Math.round(Math.random() * 10000);

    const leftContainer = document.getElementById("left-data");
    const rightContainer = document.getElementById("right-data");
    const template = document.getElementById("data-template");

    while (leftContainer.firstChild) {
        leftContainer.removeChild(leftContainer.lastChild);
    }

    while (rightContainer.firstChild) {
        rightContainer.removeChild(rightContainer.lastChild);
    }

    if (state == 0) {
        const img = document.getElementById("img-display");

        img.style.display = "block";
        SetPlanet(img, title.dataset.id, "planet");

        const type = template.content.cloneNode(true);
        const typeLabels = type.querySelectorAll("span");
        typeLabels[0].innerText = "Type";
        typeLabels[1].innerText = "Planet";
        typeLabels[1].classList.add("text-data")
        type.querySelectorAll("div")[4].style.visibility = "hidden";
        leftContainer.appendChild(type);

        const mass = template.content.cloneNode(true);
        const massLabels = mass.querySelectorAll("span");
        massLabels[0].innerText = "Mass";
        massLabels[1].classList.add("numerical-data")
        massLabels[1].id = "mass";
        massLabels[2].innerText = "EM";
        massLabels[3].innerText = "1 EM is equal to the mass of Earth"
        leftContainer.appendChild(mass);

        const radius = template.content.cloneNode(true);
        const radiusLabels = radius.querySelectorAll("span");
        radiusLabels[0].innerText = "Radius";
        radiusLabels[1].classList.add("numerical-data")
        radiusLabels[1].id = "radius";
        radiusLabels[2].innerText = "ER";
        radiusLabels[3].innerText = "1 ER is equal to the radius of Earth"
        leftContainer.appendChild(radius);

    }
    else if (state == 1) {
        document.getElementById("img-display").style.display = "none";
        document.getElementById("render-window").style.visibility = "visible";
        DisplayOrbitParameters();
    }

    Edit();
}

// Sets the object display gif based on whether the object is a star or planet. Gif is chosen based on objectID
function SetPlanet(element, id, type) {

    let file;

    if (type == "planet") {
        let index = ChaoticFunction(parseInt(id), 17);
        file = planets[planetPaths[index]]();
    }
    else if (type == "star") {
        let img = ChaoticFunction(parseInt(id), 1);
        file = stars[starPaths[img]]();
    }
    else {
        return;
    }

    element.setAttribute("src", file);
}

// When editing or adding, cancels the edit/add and either returns to the viewing window if editing, or removes the viewing window if adding
window.Cancel = () => {

    ResetIntentButtons();

    if (!adding) {

        const titleInput = document.getElementById("title-input");
        const data = GetData(titleInput.dataset.id);

        if (state == 0) {
            const img = document.getElementById("img-display");
            SetPlanet(img, data.objectId, data.type);
        }

        const name = document.createElement("a");
        name.classList.add("name");
        name.id = "name-display";
        name.dataset.id = state == 0 ? data.objectId : data.orbitId;
        name.innerText = data.name;
        titleInput.replaceWith(name);

        const leftContainer = document.getElementById("left-data");
        const rightContainer = document.getElementById("right-data");
        const leftDisplays = leftContainer.getElementsByClassName("data-input");
        const rightDisplays = rightContainer.getElementsByClassName("data-input");

        if (state == 0) {
            for (let i = 0; i <= 1; i++) {
                let dataLabel = document.createElement("span");
                dataLabel.classList.add("numerical-data");
                dataLabel.classList.add("data-display");

                if (i == 0) {
                    dataLabel.innerText = data.mass;
                    dataLabel.id = "mass";
                }
                else {
                    dataLabel.innerText = data.radius;
                    dataLabel.id = "radius";
                }
                leftDisplays[0].replaceWith(dataLabel);
            }

            const typeContainer = document.getElementsByClassName("data-display-container")[0];
            const typeLabels = typeContainer.querySelectorAll("span");

            typeContainer.classList.remove("activate-border");
            typeLabels[0].classList.remove("type-selected");
            typeLabels[0].classList.remove("not-selected");

            typeLabels[1].remove();
        }
        else if (state == 1) {

            for (let i = 0; i <= 2; i++) {
                let dataLabel = document.createElement("span");
                dataLabel.classList.add("numerical-data");
                dataLabel.classList.add("data-display");

                switch (i) {
                    case 0:
                        dataLabel.innerText = data.smAxis;
                        dataLabel.id = "semi-major-axis";
                        break
                    case 1:
                        dataLabel.innerText = data.eccentricity;
                        dataLabel.id = "eccentricity";
                        break
                    case 2:
                        dataLabel.innerText = data.inclination;
                        dataLabel.id = "inclination";
                }
                leftDisplays[0].replaceWith(dataLabel);
            }

            for (let i = 0; i <= 1; i++) {
                let dataLabel = document.createElement("span");
                dataLabel.classList.add("numerical-data");
                dataLabel.classList.add("data-display");

                switch (i) {
                    case 0:
                        dataLabel.innerText = data.longOfAscNode;
                        dataLabel.id = "long-of-asc-node";
                        break
                    case 1:
                        dataLabel.innerText = data.argOfPeri;
                        dataLabel.id = "arg-of-peri";
                }
                rightDisplays[0].replaceWith(dataLabel);
            }

            // Setup eccentricity and inclination to affect render window
            const eccentricityTrigger = document.getElementById("eccentricity-trigger");
            eccentricityTrigger.dataset.val = data.eccentricity;
            eccentricityTrigger.click();

            const inclinationTrigger = document.getElementById("inclination-trigger");
            inclinationTrigger.dataset.val = data.inclination;
            inclinationTrigger.click();
        }

        document.getElementById("edit-button").style.visibility = "visible";
        document.getElementById("button-container").style.visibility = "hidden";
    }
    else {
        Clear();
    }
}

// If adding, saves the new object to the user's profile. If editing, saves the changes.
window.Save = async () => {

    const leftContainer = document.getElementById("left-data");
    const rightContainer = document.getElementById("right-data");

    const titleInput = document.getElementById("title-input")

    let type;
    if (state == 0) {
        const selectedType = document.getElementsByClassName("type-selected")[0];
        type = selectedType.innerText.toLowerCase();
    }

    const leftDisplays = leftContainer.getElementsByClassName("data-input");
    const rightDisplays = rightContainer.getElementsByClassName("data-input");

    const name = titleInput.value;

    let valid = true;

    if (titleInput.classList.contains("invalid")) {
        valid = false;
    }

    for (let element of leftDisplays) {
        if (element.classList.contains("invalid")) {
            valid = false;
        }
    }

    for (let element of rightDisplays) {
        if (element.classList.contains("invalid")) {
            valid = false;
        }
    }

    let updatedData;

    if (valid) {
        if (state == 0) {

            if (!adding) {
                const data = GetData(titleInput.dataset.id);

                updatedData = data;
                updatedData.name = name;
                updatedData.type = type;
                updatedData.mass = leftDisplays[0].value;
                updatedData.radius = leftDisplays[1].value;

                await fetch(`https://cosmiclabapi.co.uk/api/Data/EditObject?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "ObjectId": updatedData.objectId,
                        "Username": updatedData.username,
                        "OrbitId": updatedData.orbitId,
                        "Type": updatedData.type,
                        "Name": updatedData.name,
                        "Mass": updatedData.mass,
                        "Radius": updatedData.radius
                    })
                });
            }
            else {

                await fetch(`https://cosmiclabapi.co.uk/api/Data/CreateObject?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "Id": 0,
                        "Name": name,
                        "Type": type,
                        "Mass": leftDisplays[0].value,
                        "Radius": leftDisplays[1].value
                    })
                });
            }
            Clear();
            LoadData("objects");
        }
        else if (state == 1) {
            if (!adding) {
                const data = GetData(titleInput.dataset.id);

                updatedData = data;
                updatedData.name = name;
                updatedData.smAxis = leftDisplays[0].value;
                updatedData.eccentricity = leftDisplays[1].value;
                updatedData.inclination = leftDisplays[2].value;
                updatedData.longOfAscNode = rightDisplays[0].value;
                updatedData.argOfPeri = rightDisplays[1].value;

                await fetch(`https://cosmiclabapi.co.uk/api/Data/EditOrbit?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "OrbitId": updatedData.orbitId,
                        "Username": updatedData.username,
                        "Name": updatedData.name,
                        "SMAxis": updatedData.smAxis,
                        "Eccentricity": updatedData.eccentricity,
                        "Inclination": updatedData.inclination,
                        "LongOfAscNode": updatedData.longOfAscNode,
                        "ArgOfPeri": updatedData.argOfPeri
                    })
                });
            }
            else {

                await fetch(`https://cosmiclabapi.co.uk/api/Data/CreateOrbit?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        "Name": name,
                        "SMAxis": leftDisplays[0].value,
                        "Eccentricity": leftDisplays[1].value,
                        "Inclination": leftDisplays[2].value,
                        "LongOfAscNode": rightDisplays[0].value,
                        "ArgOfPeri": rightDisplays[1].value
                    })
                });
            }
            Clear();
            LoadData("orbits");
        }
    }
}

// When editing or adding, switches object being edited/added from planet to star or vice versa
window.SwitchType = () => {
    const inactive = document.getElementsByClassName("not-selected")[0];
    const active = document.getElementsByClassName("type-selected")[0];

    inactive.classList.remove("not-selected");
    inactive.classList.add("type-selected");
    active.classList.remove("type-selected");
    active.classList.add("not-selected");

    inactive.onclick = null;
    active.onclick = SwitchType;

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

// Called if user selects no when asked if they meant to press a button, returns button to previous state
window.NoButtonIntent = (element) => {
    const cancel = element.parentElement.parentElement;
    const button = document.createElement("button");
    button.classList = element.dataset.classes;
    button.innerText = element.dataset.text;
    button.dataset.function = element.dataset.function;
    button.setAttribute("onclick", "CheckButtonIntent(this)");
    cancel.replaceWith(button);
}

// Changes button clicked into a check to ensure user meant to press the button
window.CheckButtonIntent = (element) => {
    const container = document.createElement("div");
    const checkText = document.createElement("span");
    const buttonContainer = document.createElement("div");
    const yesButton = document.createElement("button");
    const noButton = document.createElement("button");

    yesButton.classList.add("yes");
    noButton.classList.add("no");
    yesButton.setAttribute("onclick", element.dataset.function);

    noButton.setAttribute("onclick", "NoButtonIntent(this)");
    noButton.dataset.text = element.innerText;
    noButton.dataset.classes = element.classList;
    noButton.dataset.function = element.dataset.function;

    container.classList.add("check-intent-container");

    container.appendChild(checkText);
    buttonContainer.appendChild(yesButton);
    buttonContainer.appendChild(noButton);
    container.appendChild(buttonContainer);

    checkText.innerText = "Are you sure?";
    yesButton.innerText = "Yes";
    noButton.innerText = "No";

    element.replaceWith(container);
}

// Changes viewing window into edit window to allow user to change properties, or delete the object
window.Edit = (element) => {

    const leftData = document.getElementById("left-data");
    const rightData = document.getElementById("right-data");

    const numericalDisplays = document.getElementsByClassName("numerical-data");
    const title = document.getElementById("name-display");

    // Setting up title
    const titleInput = document.createElement("input");
    titleInput.classList.add("data-input-title");
    if (adding) titleInput.classList.add("invalid");
    titleInput.value = title.innerText;
    titleInput.id = "title-input";
    titleInput.dataset.id = title.dataset.id;
    title.replaceWith(titleInput);

    titleInput.addEventListener("input", (event) => {
        const value = event.target.value;

        if (value != "") {
            event.target.classList.remove("invalid");
        }
        else {
            event.target.classList.add("invalid");
        }
    });

    // Setting up type selection for objects
    if (state == 0) {
        const type = leftData.getElementsByClassName("text-data")[0];
        type.parentElement.classList.add("activate-border")
        type.classList.add("type-selected");

        if (type.innerText == "Star") {
            const planetLabel = document.createElement("span");
            planetLabel.classList.add("data-display");
            planetLabel.classList.add("not-selected");
            planetLabel.onclick = SwitchType;
            planetLabel.innerText = "Planet";
            type.insertAdjacentElement("afterend", planetLabel);
        }
        else if (type.innerText == "Planet") {
            const planetLabel = document.createElement("span");
            planetLabel.classList.add("data-display");
            planetLabel.classList.add("not-selected");
            planetLabel.onclick = SwitchType;
            planetLabel.innerText = "Star";
            type.insertAdjacentElement("afterend", planetLabel);
        }

    }

    const repeats = numericalDisplays.length;

    // Adding input boes
    for (let i = 0; i < repeats; i++) {
        let inputBox = document.createElement("input");
        inputBox.classList.add("data-input");
        if (adding) inputBox.classList.add("invalid");
        inputBox.type = "number";
        inputBox.min = "0";
        inputBox.value = numericalDisplays[0].textContent;
        inputBox.id = numericalDisplays[0].id;
        numericalDisplays[0].replaceWith(inputBox);
    }

    // Adding events to input boxed to display validity
    if (state == 0) {

        document.getElementById("mass").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value > 0 && value != "") {
                event.target.classList.remove("invalid");
            }
            else {
                event.target.classList.add("invalid");
            }
        });

        document.getElementById("radius").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value >= 0 && value != "") {
                event.target.classList.remove("invalid");
            }
            else {
                event.target.classList.add("invalid");
            }
        });
    }
    else if (state == 1) {

        document.getElementById("semi-major-axis").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value >= 0 && value != "") {
                event.target.classList.remove("invalid");
            }
            else {
                event.target.classList.add("invalid");
            }
        });

        document.getElementById("eccentricity").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value >= 0 && value < 1 && value != "") {
                event.target.classList.remove("invalid");
                const trigger = document.getElementById("eccentricity-trigger");
                trigger.dataset.val = value;
                trigger.click();
            }
            else {
                event.target.classList.add("invalid");
            }
        });

        document.getElementById("inclination").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value >= 0 && value <= 90 && value != "") {
                event.target.classList.remove("invalid");
                const trigger = document.getElementById("inclination-trigger");
                trigger.dataset.val = value;
                trigger.click();
            }
            else {
                event.target.classList.add("invalid");
            }
        });

        document.getElementById("long-of-asc-node").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value != "") {
                event.target.classList.remove("invalid");
            }
            else {
                event.target.classList.add("invalid");
            }
        });

        document.getElementById("arg-of-peri").addEventListener("input", (event) => {
            const value = event.target.value;

            if (value != "") {
                event.target.classList.remove("invalid");
            }
            else {
                event.target.classList.add("invalid");
            }
        });

    }

    document.getElementById("button-container").style.visibility = "visible";
    document.getElementById("edit-button").style.visibility = "hidden";
}

// Deletes Object or Orbit from the users profile and reloads the data
window.Delete = async (element) => {
    const id = document.getElementById("title-input").dataset.id;

    if (state == 0) {
        const response = await fetch(`https://cosmiclabapi.co.uk/api/Data/DeleteObject?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}&objectId=${id}`, {
            method: "POST"
        });
        Clear();
        LoadData("objects");
    }
    else {
        const response = await fetch(`https://cosmiclabapi.co.uk/api/Data/DeleteOrbit?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}&orbitId=${id}`, {
            method: "POST"
        });
        Clear();
        LoadData("orbits");
    }
}

// Fetches data for Objects and Orbits from the backend
async function LoadData(type) {
    const response = await fetch(`https://cosmiclabapi.co.uk/api/Data/GetUserCreations?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`);

    const data = await response.json();

    objects = data.Objects.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : 0));
    orbits = data.Orbits;

    if (type == "objects") {
        SelectObjects();
    }
    else if (type == "orbits") {
        SelectOrbits();
    }
}

// Loads Objects (Planets and Stars) into the tile window
window.SelectObjects = () => {
    const objectButton = document.getElementById("objects");
    const orbitButton = document.getElementById("orbits");

    objectButton.style.boxShadow = shadow;
    orbitButton.style.boxShadow = "";

    const template = document.getElementById("tile-template");
    const container = document.getElementById("tile-container");

    let empty = false;
    while (!empty) {
        if (container.childElementCount == 1) {
            empty = true;
        }
        else {
            container.removeChild(container.lastChild);
        }
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

// Loads Orbits into the tile window
window.SelectOrbits = () => {
    const objectButton = document.getElementById("objects");
    const orbitButton = document.getElementById("orbits");

    objectButton.style.boxShadow = "";
    orbitButton.style.boxShadow = shadow;

    const template = document.getElementById("tile-template");
    const container = document.getElementById("tile-container");

    let empty = false;
    while (!empty) {
        if (container.childElementCount == 1) {
            empty = true;
        }
        else {
            container.removeChild(container.lastChild);
        }
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

// Fetches the data for the object or orbit (depending on state defined as a constant) with the corresponding ID
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

// Clears the editing/adding window completely
function Clear() {
    adding = false;

    ResetIntentButtons();

    const leftContainer = document.getElementById("left-data");
    const rightContainer = document.getElementById("right-data");

    while (leftContainer.firstChild) {
        leftContainer.removeChild(leftContainer.lastChild);
    }

    while (rightContainer.firstChild) {
        rightContainer.removeChild(rightContainer.lastChild);
    }

    try {
        const nameInput = document.getElementById("title-input");

        const name = document.createElement("a");
        name.classList.add("name");
        name.id = "name-display";
        nameInput.replaceWith(name);
    }
    catch { }

    document.getElementById("img-display").style.display = "none";
    document.getElementById("edit-button").style.visibility = "hidden";
    document.getElementById("render-window").style.visibility = "hidden";
    document.getElementById("button-container").style.visibility = "hidden";

}

// Resets all buttons with intent chcker to normal state
function ResetIntentButtons() {
    const intentContainers = document.getElementsByClassName("check-intent-container");

    if (intentContainers.length != 0) {

        for (let i = 0; i <= intentContainers.length; i++) {
            const no_button = intentContainers[0].getElementsByClassName("no")[0];
    
            const button = document.createElement("button");
            button.innerText = no_button.dataset.text;
            button.dataset.function = no_button.dataset.function;
            button.classList = no_button.dataset.classes;
            button.setAttribute("onclick", "CheckButtonIntent(this)");
            intentContainers[0].replaceWith(button);
        }
    }
}

// Load the data corresonding to the tile clicked into the viewing window
window.TileClicked = (element) => {

    // Used so that an incorrect id is not used to fetch data
    Clear();

    const data = GetData(element.dataset.id);

    const title = document.getElementById("name-display");
    const img = document.getElementById("img-display");
    const editButton = document.getElementById("edit-button");

    // Hides save and cancel button from edit screen
    // Needed as user could select different object during editing
    document.getElementById("button-container").style.visibility = "hidden";
    document.getElementById("render-window").style.visibility = "hidden";

    img.style.display = "block";
    editButton.style.visibility = "visible";

    title.innerText = data.name;
    title.dataset.id = element.dataset.id;
    state == 0 ? SetPlanet(img, element.dataset.id, data.type) : img.style.display = "none";

    const leftContainer = document.getElementById("left-data");
    const rightContainer = document.getElementById("right-data");
    const template = document.getElementById("data-template");

    document.getElementById("render-window").style.visibility = "hidden";

    while (leftContainer.firstChild) {
        leftContainer.removeChild(leftContainer.lastChild);
    }

    while (rightContainer.firstChild) {
        rightContainer.removeChild(rightContainer.lastChild);
    }

    if (state == 0) {

        const type = template.content.cloneNode(true);
        const typeLabels = type.querySelectorAll("span");
        typeLabels[0].innerText = "Type";
        typeLabels[1].innerText = data.type.charAt(0).toUpperCase() + data.type.slice(1).toLowerCase();
        typeLabels[1].classList.add("text-data")
        type.querySelectorAll("div")[4].style.visibility = "hidden";
        leftContainer.appendChild(type);

        const mass = template.content.cloneNode(true);
        const massLabels = mass.querySelectorAll("span");
        massLabels[0].innerText = "Mass";
        massLabels[1].innerText = data.mass;
        massLabels[1].id = "mass";
        massLabels[1].classList.add("numerical-data")
        if (data.type == "planet") {
            massLabels[2].innerText = "EM";
            massLabels[3].innerText = "1 EM is equal to the mass of Earth"
        }
        else {
            massLabels[2].innerText = "SM";
            massLabels[3].innerText = "1 SM is equal to the mass of The Sun"
        }
        leftContainer.appendChild(mass);

        const radius = template.content.cloneNode(true);
        const radiusLabels = radius.querySelectorAll("span");
        radiusLabels[0].innerText = "Radius";
        radiusLabels[1].innerText = data.radius;
        radiusLabels[1].id = "radius";
        radiusLabels[1].classList.add("numerical-data")
        if (data.type == "planet") {
            radiusLabels[2].innerText = "ER";
            radiusLabels[3].innerText = "1 ER is equal to the radius of Earth"
        }
        else {
            radiusLabels[2].innerText = "SR";
            radiusLabels[3].innerText = "1 SR is equal to the radius of The Sun"
        }
        leftContainer.appendChild(radius);
    }
    else if (state == 1) {

        DisplayOrbitParameters(data);

        document.getElementById("render-window").style.visibility = "visible";

        // Triggers event listener to make render update live
        const eccentricityTrigger = document.getElementById("eccentricity-trigger");
        eccentricityTrigger.dataset.val = document.getElementById("eccentricity").innerText;

        const inclinationTrigger = document.getElementById("inclination-trigger");
        inclinationTrigger.dataset.val = document.getElementById("inclination").innerText;

        eccentricityTrigger.click();
        inclinationTrigger.click();
    }
}

// Used for displaying when editing and not editing
function DisplayOrbitParameters(data) {

    const leftContainer = document.getElementById("left-data");
    const rightContainer = document.getElementById("right-data");
    const template = document.getElementById("data-template");

    const displays = [];
    displays.push(["\nSemi-Major Axis", !adding ? data.smAxis : "", "AU", "One AU is one astronomical unit, which is the distance from The Sun to the Earth, and is approximately 150,000,000 km"]);
    displays.push(["\nEccentricity", !adding ? data.eccentricity : "", "", "Eccentricity is a 0 - 1 value that controls how close to a circle the ellipitical path is. Values closer to 0 are more circular"]);
    displays.push(["\nIncinlation", !adding ? data.inclination : "", "Degree", "The inclination is how far above the horizontal plane the orbit is rotated"]);
    displays.push(["Longitude Of\nAscending Node", !adding ? data.longOfAscNode : "", "Degree", "The longitude of the ascending node is how far around the y-axis the whole orbit is rotated"]);
    displays.push(["Argument Of\nPeriapsis", !adding ? data.argOfPeri : "", "Degree", "The arguement of periapsis is the angle around the orbit that the furthest point from the center object is located"]);

    for (let i = 0; i < (Math.ceil(displays.length / 2)); i++) {
        let element = template.content.cloneNode(true);
        let elementLabels = element.querySelectorAll("span");
        elementLabels[0].innerText = displays[i][0];

        elementLabels[1].innerText = displays[i][1];
        elementLabels[1].classList.add("numerical-data");

        elementLabels[2].innerText = displays[i][2];
        elementLabels[3].innerText = displays[i][3];

        switch (i) {
            case 0:
                elementLabels[1].id = "semi-major-axis";
                break
            case 1:
                elementLabels[1].id = "eccentricity";
                break
            case 2:
                elementLabels[1].id = "inclination";
        }

        leftContainer.appendChild(element);
    }

    for (let i = Math.ceil(displays.length / 2); i < displays.length; i++) {
        let element = template.content.cloneNode(true);
        let elementLabels = element.querySelectorAll("span");
        elementLabels[0].innerText = displays[i][0];

        elementLabels[1].innerText = displays[i][1];
        elementLabels[1].classList.add("numerical-data");

        elementLabels[2].innerText = displays[i][2];
        elementLabels[3].innerText = displays[i][3];
        rightContainer.appendChild(element);

        switch (i) {
            case Math.ceil(displays.length / 2):
                elementLabels[1].id = "long-of-asc-node";
                break
            case Math.ceil(displays.length / 2) + 1:
                elementLabels[1].id = "arg-of-peri";
        }
    }
}

// Used to assign an icon to planets and stars based on their unchanging ID
function ChaoticFunction(x, k, a = 7.5, b = 6, m = 600) {

    const result = Math.round((Math.pow(Math.sin(a * x + b), 2) * m) % k);
    return result;
}

// Filters tile window into only tiles with substrings of the string in the search bar
window.UpdateDisplay = (element) => {
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

// Places stars in the viewing/add/edit window
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