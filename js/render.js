import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { randFloat } from 'three/src/math/MathUtils.js';

let perspectiveCamera, orbit, scene, renderer;

let items = [];

init();

function init() {

    const aspect = window.innerWidth * 0.8 / window.innerHeight;

    perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 5000);
    perspectiveCamera.position.z = 500;

    // world

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    // renderer
    AddItems();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth * 0.8, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    createControls(perspectiveCamera);
}

function AddItems() {

    const starsGeometry = new THREE.BufferGeometry();
    const starCount = 5000; // Number of stars
    const positions = new Float32Array(starCount * 3); // x, y, z for each star


    const minDistance = 1000; // Inner radius
    const maxDistance = 1500; // Outer radius

    for (let i = 0; i < starCount; i++) {
        let r, theta, phi;

        // Generate a uniform distribution in a spherical shell
        r = Math.cbrt(Math.random() * (maxDistance ** 3 - minDistance ** 3) + minDistance ** 3);
        theta = Math.random() * Math.PI * 2; // Full rotation around Y-axis
        phi = Math.acos(2 * Math.random() - 1); // Proper latitudinal distribution

        // Convert spherical coordinates to Cartesian
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }

    starsGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    // Create a basic material for the stars
    const starsMaterial = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 1.5, // Adjust size for visibility
        sizeAttenuation: true,
        transparent: true,
        opacity: 0.8
    });

    // Create the starfield and add to scene
    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);


    const SphereMesh = new THREE.SphereGeometry(10, 10, 10);
    const SphereMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const center_object = new THREE.Mesh(SphereMesh, SphereMaterial);
    scene.add(center_object);
    items.push(center_object);
}

function createControls(camera) {

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target = new THREE.Vector3(0, 0, 0);
    //orbit.minPolarAngle = Math.PI / 8;
    //orbit.maxPolarAngle = Math.PI - Math.PI / 8;
    orbit.minDistance = 100;
    orbit.maxDistance = 1000;
    orbit.zoomSpeed = 0.3;
    orbit.rotateSpeed = 0.3;
    orbit.enablePan = false;

}

function onWindowResize() {

    const aspect = window.innerWidth * 0.8 / window.innerHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth * 0.8, window.innerHeight);

}


function animate() {

    orbit.update();

    render();
}

function render() {

    renderer.render(scene, perspectiveCamera);

}