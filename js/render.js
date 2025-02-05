import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { randFloat, randInt } from 'three/src/math/MathUtils.js';

let perspectiveCamera, orbit, scene, renderer, stars;

let items = [];

function Start() {
    init();
}

function init() {
    console.log("Init");
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
    const starCount = 5000; // Number of stars
    const positions = new Float32Array(starCount * 3); // x, y, z for each star
    const sizes = new Float32Array(starCount); // Individual sizes for twinkling effect

    const minDistance = 1000;
    const maxDistance = 2000;

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

    let axis = new THREE.AxesHelper(1000);
    scene.add(axis);
}

function createControls(camera) {

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target = new THREE.Vector3(0, 0, 0);
    //orbit.minPolarAngle = Math.PI / 8;
    //orbit.maxPolarAngle = Math.PI - Math.PI / 8;
    orbit.minDistance = 0.01;
    orbit.maxDistance = 500;
    orbit.zoomSpeed = 1;
    orbit.rotateSpeed = 0.3;
    orbit.enablePan = false;

}

function onWindowResize() {

    const aspect = window.innerWidth * 0.8 / window.innerHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth * 0.8, window.innerHeight);

}

function AddObject(x, y, z, element_id) {

    //console.log(`${x}, ${y}, ${z}`);

    const SphereMesh = new THREE.SphereGeometry(0.1, 10, 10);
    const SphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const object = new THREE.Mesh(SphereMesh, SphereMaterial);
    object.position.set(x * 10, z * 10, y * 10);

    const entry = document.getElementById(element_id);
    entry.querySelector("i").addEventListener("click", () => {
        perspectiveCamera.position.set(object.position.x, object.position.y, object.position.z > 0 ? object.position.z + 10 : object.position.z - 10);
        orbit.target = object.position;
    });

    items.push(object);
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

export { AddObject, scene, Start }