import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { randFloat } from 'three/src/math/MathUtils.js';

let perspectiveCamera, orthographicCamera, orbit, scene, renderer, ellipse;

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

    const eccentricity = 0.5;
    const semi_major_axis = 100;
    const semi_minor_axis = Math.sqrt((semi_major_axis * semi_major_axis) * (1 - (eccentricity * eccentricity)));

    const curve = new THREE.EllipseCurve(0, 0, semi_major_axis, semi_minor_axis, 0, 2 * Math.PI, false, Math.PI)
    const points = curve.getPoints(50);
    const geometry = new THREE.BufferGeometry().setFromPoints(points); 
    const material = new THREE.LineBasicMaterial({color: 0xFFFFFF});
    ellipse = new THREE.Line(geometry, material);

    ellipse.rotation.x = Math.PI * 0.5;
    ellipse.rotation.y = Math.PI * 0.05;
    //ellipse.rotation.z = Math.PI;

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
    renderer.domElement.style.top = "75%";
    renderer.domElement.style.left = "50%";
    renderer.domElement.style.transform = "translate(-50%, -50%)";
    //renderer.domElement.style.zIndex = 5;


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

    orbit._rotateStart
}

function animate() {

    orbit.update();

    render();
}

function render() {

    renderer.render(scene, perspectiveCamera);

}