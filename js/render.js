import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { randFloat, randInt } from 'three/src/math/MathUtils.js';
//import { FetchFrames } from './render-setup';

const AU = 149597870700;
const distanceMultiplier = 20;

let perspectiveCamera, orbit, scene, renderer, stars, axes;

let items = {};
let cameraItem;
let frames = [];
let framenumber = 0;
let paused = true;

function Start() {
    Init();
}

function Init() {
    const aspect = window.innerWidth * 0.8 / window.innerHeight;

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
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    /*
    document.getElementById("add-object").addEventListener("click", (element) => {
        AddObject(element);
    });
    */

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
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);

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

function onWindowResize() {

    const aspect = window.innerWidth * 0.8 / window.innerHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth * 0.8, window.innerHeight);

}

function AddObject(x, y, z, radius, element_id, name) {

    //console.log(`${x}, ${y}, ${z}`);
    const types = ["Volcanic","Oceanic","Tropical","Gas Giant","Venusian","Ice","Swamp"];
    const type = types[Math.floor(Math.random() * types.length)];
    const num = randInt(1, 10);
    const SphereMesh = new THREE.SphereGeometry(0.2 * radius, 32, 32);

    let texture;
    if (name == null) {
        texture = new THREE.TextureLoader().load(`../images/Textures/${type}/${type}-EQUIRECTANGULAR-${num}-1024x512.png`);
    }
    else {
        console.log(name);
        texture = new THREE.TextureLoader().load(`../images/Textures/Default/${name}.png`);
    }

    const SphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const object = new THREE.Mesh(SphereMesh, SphereMaterial);
    object.position.set(x * distanceMultiplier, z * distanceMultiplier, y * distanceMultiplier);

    const entry = document.getElementById(element_id);
    entry.querySelector("i").addEventListener("click", () => {
        perspectiveCamera.position.set(object.position.x, object.position.y, object.position.z > 0 ? object.position.z + 10 : object.position.z - 10);
        orbit.target = object.position;
    });

    items[element_id] = object;
    if (cameraItem == null) {
        cameraItem = element_id;
    }
    scene.add(object);
}

function animate() {

    orbit.update();

    stars.material.uniforms.time.value = performance.now() * 0.002; // Update time uniform

    render();
}

function render() {

    renderer.render(scene, perspectiveCamera);

}

function BeginMovement() {
    setInterval(DisplayFrame, 1000 / 24)
}

function PassFrames(new_frames) {
    frames = frames.concat(new_frames);
}

window.ToggleSim = (element) => {
    paused = !paused;
    let icon = element.querySelector("i");
    if (paused) {
        icon.classList.remove("fa-pause");
        icon.classList.add("fa-play");
    }
    else {
        icon.classList.remove("fa-play");
        icon.classList.add("fa-pause");
    }
};

window.ToggleAxes = () => {
    axes.visible = !axes.visible;
};

function DisplayFrame() {
    if (!paused) {
        let framelist = frames[framenumber];
        for (let i = 0; i < framelist.length; i++) {
            items[framelist[i].objectId].position.set(framelist[i].xPos * distanceMultiplier / AU, framelist[i].zPos * distanceMultiplier / AU, framelist[i].yPos * distanceMultiplier / AU);
            /*
            if (framelist[i].objectId == camera_item) {
                perspectiveCamera.position.add(framelist[i].xPos * distance_multiplier / AU, framelist[i].zPos * distance_multiplier / AU, framelist[i].yPos * distance_multiplier / AU);
            }
                */
        }
        framenumber++;
    }
    if (framenumber + 1000 == frames.length) {
        FetchFrames();   
    }
}

async function FetchFrames() {
    let newFrames = await fetch(`http://cosmiclabapi.co.uk:2030/api/Data/GetFrames?sessionId=${GetCookie("sessionId").replace(/['"]+/g, '').toUpperCase()}&timescale=3600&num=2000`);
    PassFrames(JSON.parse(await newFrames.text()));
}

function GetCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

export { AddObject, scene, Start, PassFrames, BeginMovement, GetCookie }