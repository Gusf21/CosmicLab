import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { randFloat } from 'three/src/math/MathUtils.js';

let perspectiveCamera, orthographicCamera, orbit, scene, renderer, ellipse, curve;
let semi_major_axis, eccentricity, inclination;

const params = {
    orthographicCamera: false
};

const frustumSize = 400;
const size = 80;

init();

function init() {

    const container = document.getElementById("star-container")
    const aspect = 16 / 9;

    perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 2000);
    perspectiveCamera.position.z = 200;
    perspectiveCamera.position.y = 200;

    // world
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x071013);

    eccentricity = 0.5;
    inclination = 0;
    semi_major_axis = 100;
    const semi_minor_axis = Math.sqrt((semi_major_axis * semi_major_axis) * (1 - (eccentricity * eccentricity)));

    curve = new THREE.EllipseCurve(semi_major_axis * eccentricity, 0, semi_major_axis, semi_minor_axis, 0, 2 * Math.PI, false, Math.PI)
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
    ellipse = new THREE.Line(geometry, material);

    //ellipse.rotation.z = Math.PI * 0.5;
    ellipse.rotation.x = Math.PI * 0.5;
    ellipse.rotation.y = inclination;

    scene.add(ellipse);

    const axes = new THREE.AxesHelper(10000);
    scene.add(axes);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(16 * 20, 9 * 20);
    renderer.setAnimationLoop(animate);
    container.appendChild(renderer.domElement);
    renderer.domElement.id = "render-window";
    renderer.domElement.style.visibility = "hidden";
    renderer.domElement.style.position = "absolute";
    renderer.domElement.style.top = "60%";
    renderer.domElement.style.left = "50%";
    renderer.domElement.style.transform = "translate(-50%, -50%)";
    //renderer.domElement.style.zIndex = 5;

    const eccentricity_trigger = document.getElementById("eccentricity-trigger");
    const inclination_trigger = document.getElementById("inclination-trigger");

    eccentricity_trigger.addEventListener("click", (element) => {
        eccentricity = parseFloat(element.target.dataset.val);
        const semi_minor_axis = Math.sqrt((semi_major_axis * semi_major_axis) * (1 - (eccentricity * eccentricity)));
        curve.yRadius = semi_minor_axis;
        curve.aX = semi_major_axis * eccentricity;
        ellipse.geometry.setFromPoints(curve.getPoints(50));
    })

    inclination_trigger.addEventListener("click", (element) => {
        inclination = (parseFloat(element.target.dataset.val) * Math.PI) / 180;
        ellipse.rotation.y = inclination;
    })

    createControls(perspectiveCamera);
}

function createControls(camera) {

    orbit = new OrbitControls(camera, renderer.domElement);
    orbit.target = new THREE.Vector3(0, 0, 0);
    orbit.minPolarAngle = Math.PI / 8;
    orbit.maxPolarAngle = Math.PI - Math.PI / 8;
    orbit.minDistance = 140;
    orbit.maxDistance = 250;
    orbit.zoomSpeed = 0.3;
    orbit.rotateSpeed = 0.3;
    orbit.enablePan = false;
}

function animate() {

    orbit.update();

    /*
    if (renderer.domElement.style.visibility == "visible") {
        let element = document.getElementById("eccentricity");
        eccentricity = parseFloat(element.innerText);
        const semi_minor_axis = Math.sqrt((semi_major_axis * semi_major_axis) * (1 - (eccentricity * eccentricity)));
        curve.yRadius = semi_minor_axis;
        ellipse.geometry.setFromPoints(curve.getPoints(50));
    }
        */

    render();
}

function render() {

    renderer.render(scene, perspectiveCamera);

}