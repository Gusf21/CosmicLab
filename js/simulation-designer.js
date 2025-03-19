import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GetCookie } from "../js/cookies";

let planets = []
let stars = []
let orbits = []

let currentId = 0;
let currentSystem = [];
let renderList = {};

window.addEventListener("DOMContentLoaded", () => {

    FetchData();

    let renderContainer = document.getElementById("render-container");
    InitRender(renderContainer);

    let tabs = document.getElementsByClassName("tab");
    for (let tab of tabs) {
        tab.addEventListener("click", () => {
            let tabs = document.getElementsByClassName("tab");
            for (let tab of tabs) {
                tab.classList.remove("active");
            }
            tab.classList.add("active");

            if (tab.innerText == "Planets") {
                DisplayObjects("planet");
            }
            else if (tab.innerText == "Stars") {
                DisplayObjects("star");
            }
            else if (tab.innerText == "Orbits") {
                DisplayOrbits();
            }

        });
    }

    /*
    // Temporary
    document.getElementById("dropable-point").addEventListener("dragenter", (event) => {
        document.getElementById("dropable-point").style.boxShadow = "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset";
    });

    document.getElementById("dropable-point").addEventListener("dragleave", (event) => {
        document.getElementById("dropable-point").style.boxShadow = "none";
    });
    */
});

window.UpdateDisplay = (element) => {
    let filter = element.value;

    let activeTab = document.getElementsByClassName("active")[0];
    let state = activeTab.innerText == "Planets" ? 0 : activeTab.innerText == "Stars" ? 1 : 2;

    let remove = []

    if (state == 0) {
        planets.forEach(element => {
            if (!element.name.toLowerCase().includes(filter.toLowerCase())) {
                remove.push(element.objectId);
            }
        });
    }
    else if (state == 1) {
        stars.forEach(element => {
            if (!element.name.toLowerCase().includes(filter.toLowerCase())) {
                remove.push(element.objectId);
            }
        });
    }
    else if (state == 2) {
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

async function FetchData() {
    const response = await fetch(`https://localhost:7168/api/Data/GetUserCreations?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}`);

    // fetch data and sort alphabetically
    const data = await response.json();
    let objects = data.Objects.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : 0));
    orbits = data.Orbits.sort((a, b) => (a.name.toLowerCase() < b.name.toLowerCase()) ? -1 : ((a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : 0));

    // seperate objects into planets and stars
    for (let object of objects) {
        if (object.type == "planet") {
            planets.push(object);
        }
        else if (object.type == "star") {
            stars.push(object);
        }
    }
}

function GetData(id, type) {
    let data;
    let index = 0;

    let search = type == "planets" ? planets : type == "stars" ? stars : orbits;

    id = parseInt(id);

    if (type != "orbit") {
        while (!data) {
            if (search[index].objectId == id) {
                data = search[index];
            }
            if (index == search.length) {
                return;
            }
            index++;
        }
    }
    else {
        while (!data) {
            if (search[index].orbitId == id) {
                data = search[index];
            }
            if (index == search.length) {
                return;
            }
            index++;
        }
    }


    return data;
}

// Display planets and stars when the tab is clicked
function DisplayObjects(type) {
    let container = document.getElementById("tile-container");
    let template = document.getElementById("object-template");

    ClearStore();

    let objects = type == "planet" ? planets : stars;

    objects.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.getElementById("name").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        clone.getElementById("mass").innerText = (element.mass).toPrecision(2) + (type == "planet" ? " EM" : " SM");
        clone.getElementById("radius").innerText = (element.radius).toPrecision(2) + (type == "planet" ? " ER" : " SR");
        clone.querySelector("div").dataset.id = element.objectId;
        clone.querySelector("div").addEventListener("dragstart", Disappear);
        clone.querySelector("div").addEventListener("dragend", Reappear);
        container.appendChild(clone);
    });
}

// Display orbits when the tab is clicked
function DisplayOrbits() {
    ClearStore();
    
    let container = document.getElementById("tile-container");
    let template = document.getElementById("orbit-template");
    
    orbits.forEach(element => {
        const clone = template.content.cloneNode(true);
        clone.getElementById("name").innerText = element.name.charAt(0).toUpperCase() + element.name.substring(1);
        clone.getElementById("eccentricity").innerText = element.eccentricity;
        clone.getElementById("sm-axis").innerText = element.smAxis;
        clone.querySelector("div").dataset.id = element.orbitId;
        clone.querySelector("div").addEventListener("dragstart", Disappear);
        clone.querySelector("div").addEventListener("dragend", Reappear);
        container.appendChild(clone);
    });
}

function ClearStore() {
    let container = document.getElementById("tile-container");
    
    while (container.childElementCount > 0) {
        container.removeChild(container.lastChild);
    }
}

window.AddHierachyItem = () => {
    
    const container = document.getElementById("hierachy-container");
    const header = document.getElementById("hierachy-header");
    let template = header.innerText == "Hierachy" ? document.getElementById("hierachy-object-template") : document.getElementById("hierachy-satellite-template");
    
    const clone = template.content.cloneNode(true);
    let dropables = clone.querySelectorAll(".dropable-point");
    let nameInput = clone.getElementById("name-input");
    nameInput.dataset.id = currentId;
    
    // Set up drag and drop
    for (let dropable of dropables) {
    
        dropable.addEventListener("dragenter", () => {
            dropable.classList.add("active");
        });
        
        dropable.addEventListener("dragleave", () => {
            dropable.classList.remove("active");
        });
        
        dropable.addEventListener("dragover", (event) => {
            event.preventDefault();
        });
        
        dropable.addEventListener("drop", (event) => {
            event.preventDefault();
            dropable.classList.remove("active");
            
            let currentType = document.getElementsByClassName("tab active")[0].innerText.toLowerCase();
            let root = document.getElementById("hierachy-header").innerText == "Hierachy";
            
            if (dropable.dataset.type == "objects" && currentType != "orbits") {
                
                let objectData = GetData(event.dataTransfer.getData("id"), currentType);
                
                let spans = dropable.querySelectorAll("span");
                spans[0].innerText = "";
                spans[1].innerText = objectData.name.charAt(0).toUpperCase() + objectData.name.substring(1);
                spans[2].innerText = (objectData.mass).toPrecision(2) + " EM";
                spans[3].innerText = (objectData.radius).toPrecision(2) + " ER";
                
                let id = nameInput.dataset.id;
                let data = currentSystem.find(element => element.id == id);
                data.type = currentType.substring(0, currentType.length - 1);
                
                if (root) {
                    nameInput.value = objectData.name.charAt(0).toUpperCase() + objectData.name.substring(1);
                    nameInput.classList.remove("empty");
                }
                
            }
            else if (dropable.dataset.type == "orbits" && currentType == "orbits") {
                
                let orbitData = GetData(event.dataTransfer.getData("id"), currentType);
                
                let spans = dropable.querySelectorAll("span");
                spans[0].innerText = "";
                spans[1].innerText = orbitData.name.charAt(0).toUpperCase() + orbitData.name.substring(1);
                spans[2].innerText = orbitData.eccentricity;
                spans[3].innerText = orbitData.smAxis;
                
                let id = nameInput.dataset.id;
                let data = currentSystem.find(element => element.id == id);
                data.type = "orbit";
            }
            
            
        });
    }
    

    // Set up telemetry input
    let telemetry = clone.getElementById("telemetry");
    let inputs = telemetry.querySelectorAll("input");
    
    inputs[0].addEventListener("input", () => {
        let id = inputs[0].parentElement.parentElement.parentElement.parentElement.querySelector(".name").dataset.id;
        console.log(id);
        let value = inputs[0].value;
        let data = currentSystem.find(element => element.id == id);
        
        data.telemetry.position.x = value;
    });
    
    inputs[1].addEventListener("input", () => {
        let id = inputs[1].parentElement.parentElement.parentElement.parentElement.querySelector(".name").dataset.id;
        let value = inputs[1].value;
        let data = currentSystem.find(element => element.id == id);
        
        data.telemetry.position.y = value;
    });
    
    inputs[2].addEventListener("input", () => {
        let id = inputs[2].parentElement.parentElement.parentElement.parentElement.querySelector(".name").dataset.id;
        let value = inputs[2].value;
        let data = currentSystem.find(element => element.id == id);
        
        data.telemetry.position.z = value;
    });
    
    inputs[3].addEventListener("input", () => {
        let id = inputs[3].parentElement.parentElement.parentElement.parentElement.querySelector(".name").dataset.id;
        let value = inputs[3].value;
        let data = currentSystem.find(element => element.id == id);
        
        data.telemetry.velocity.x = value;
    });
    
    inputs[4].addEventListener("input", () => {
        let id = inputs[4].parentElement.parentElement.parentElement.parentElement.querySelector(".name").dataset.id;
        let value = inputs[4].value;
        let data = currentSystem.find(element => element.id == id);
        
        data.telemetry.velocity.y = value;
    });
    
    inputs[5].addEventListener("input", () => {
        let id = inputs[5].parentElement.parentElement.parentElement.parentElement.querySelector(".name").dataset.id;
        let value = inputs[5].value;
        let data = currentSystem.find(element => element.id == id);
        
        data.telemetry.velocity.z = value;
    });
    
    
    currentSystem.push({
        id: currentId,
        name: nameInput.value,
        type: "planet",
        mass: 1,
        radius: 1,
        telemetry: {
            position: {
                x: 0,
                y: 0,
                z: 0
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            }
        },
        satellites: [],
    });
    
    currentId++;
    
    container.appendChild(clone);
}

window.DeleteHierachyItem = (element) => {
    let id = element.parentElement.parentElement.querySelector(".name").dataset.id;
    currentSystem = currentSystem.filter(item => item.id != id);
    element.parentElement.parentElement.style.display = "none";
}

window.AddSatellites = (element) => {
    const empty = element.parentElement.parentElement.querySelector(".name").classList.contains("empty");
    if (empty) {
        alert("Please enter a name");
    }
    else {
        const hierachyContainer = document.getElementById("hierachy-container");
        const header = document.getElementById("hierachy-header");
        const storage = document.getElementById("storage");

        let newDiv = document.createElement("div");
        newDiv.id = "root-storage";
        
        for (let child of hierachyContainer.children) {
            newDiv.appendChild(child);
        }

        storage.appendChild(newDiv);

        let button = document.getElementById("dynamic-button");
        button.addEventListener("click", ReturnToRoot);
        button.querySelector("span").innerText = "Go Back";

        let satelliteStorage;

        for (let child of storage.children) {
            if (child.id == element.parentElement.parentElement.querySelector(".name").value + "-storage") {
                satelliteStorage = child;
            }
        }

        for (let child of satelliteStorage.children) {
            hierachyContainer.appendChild(child);
        }
        
        header.innerText += " - " + element.parentElement.parentElement.querySelector(".name").value + " Satellites";
    }
}

window.ReturnToRoot = () => {
    const hierachyContainer = document.getElementById("hierachy-container");
    const storage = document.getElementById("storage");
    const header = document.getElementById("hierachy-header");
    const rootStorage = document.getElementById("root-storage");

    let name = header.innerText.split(" - ")[1].substring(0, header.innerText.split(" - ")[1].length - 11); 
    let newDiv = document.createElement("div");
    newDiv.id = name + "-storage";

    for (let child of hierachyContainer.children) {
        newDiv.appendChild(child);
    }

    storage.appendChild(newDiv);

    for (let child of rootStorage.children) {
        hierachyContainer.appendChild(child);
    }

    rootStorage.remove();

    header.innerText = "Hierachy";
}

// Checks if name input is empty
window.CheckContent = (element) => {
    let input = element.value;
    if (input.length > 0) {
        element.classList.remove("empty");
        
        let id = element.parentElement.parentElement.querySelector(".name").dataset.id;
        let data = currentSystem.find(element => element.id == id);
        data.name = input;
        console.log(data);
    }
    else {
        element.classList.add("empty");
    }
}

function Disappear(e) {
    e.dataTransfer.setData("id", this.dataset.id);
    this.style.opacity = 0.5;
}

function Reappear() {
    this.style.opacity = 1;
}

// Render Stuff
let perspectiveCamera, orbit, scene, renderer, starsRender, axes;


function InitRender(element) {
    const aspect = ((window.innerWidth * 0.98) * 0.49) / ((window.innerHeight * 0.94) / 2);

    perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 5000);
    perspectiveCamera.position.z = 50;

    // world

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // renderer
    AddStars();
    //AddObject();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(((window.innerWidth * 0.98) * 0.49), (window.innerHeight * 0.94) / 2);
    renderer.setAnimationLoop(animate);
    renderer.domElement.style.borderRadius = "1rem 0 0 0";
    element.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    createControls(perspectiveCamera);
}

function AddStars() {

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 10000; // Number of stars
    const positions = new Float32Array(starCount * 3); // x, y, z for each star
    const sizes = new Float32Array(starCount); // Individual sizes for twinkling effect

    const minDistance = 3000;
    const maxDistance = 4000;

    for (let i = 0; i < starCount; i++) {
        let r, theta, phi;

        // Distribute stars in a spherical shell
        r = Math.cbrt(Math.random() * (maxDistance ** 3 - minDistance ** 3) + minDistance ** 3);
        theta = Math.random() * Math.PI * 2;
        phi = Math.acos(2 * Math.random() - 1);

        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        sizes[i] = 1.5 + Math.random(); // Randomize initial star sizes
    }

    // Assign positions and sizes as buffer attributes
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starsGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1)); // Custom size attribute

    // Create a shader material for per-star size control
    const starsMaterial = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0.0 }
        },
        vertexShader: `
        attribute float size;
        uniform float time;
        varying float vOpacity;
        
        void main() {
            vOpacity = 0.6 + 0.4 * sin(time + size * 10.0);
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_PointSize = size * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
        fragmentShader: `
        varying float vOpacity;
        void main() {
            gl_FragColor = vec4(1.0, 1.0, 1.0, vOpacity);
        }
    `,
        transparent: true
    });

    // Create the starfield and add to the scene
    starsRender = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsRender);

    axes = new THREE.AxesHelper(1000);
    scene.add(axes);
}

function createControls(camera) {

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target = new THREE.Vector3(0, 0, 0);
    //orbit.minPolarAngle = Math.PI / 8;
    //orbit.maxPolarAngle = Math.PI - Math.PI / 8;
    orbit.minDistance = 0.01;
    orbit.maxDistance = 2000;
    orbit.zoomSpeed = 2;
    orbit.rotateSpeed = 0.3;
    orbit.enablePan = false;

}

function AddObject(data) {
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
    const sphere = new THREE.Mesh(geometry, material);

    renderList[data.id] = sphere;

    scene.add(sphere);
}

function onWindowResize() {

    const aspect = ((window.innerWidth * 0.98) * 0.49) / ((window.innerHeight * 0.94) / 2);

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(((window.innerWidth * 0.98) * 0.49), (window.innerHeight * 0.94) / 2);

}

function animate() {

    starsRender.material.uniforms.time.value = performance.now() * 0.002; // Update time uniform

    render();
}

function render() {

    renderer.render(scene, perspectiveCamera);

}