import * as THREE from 'three';

import { GUI } from 'three/addons/libs/lil-gui.module.min.js';

import { TrackballControls } from 'three/addons/controls/TrackballControls.js';
import { randFloat } from 'three/src/math/MathUtils.js';

let perspectiveCamera, orthographicCamera, controls, scene, renderer;

const params = {
    orthographicCamera: false
};

const frustumSize = 400;
const size = 80;

let items = [];

init();

function init() {

    const aspect = window.innerWidth / window.innerHeight;

    perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 1, 2000);
    perspectiveCamera.position.z = 500;

    //orthographicCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 1000);
    //orthographicCamera.position.z = 500;

    // world

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);
    // renderer
    addPlanets();

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth * 0.75 , window.innerHeight * 0.75);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    createControls(perspectiveCamera);
}

function addPlanets() {

    

    const SphereMesh = new THREE.SphereGeometry(10, 10, 10);
    const SphereMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
    const center_object = new THREE.Mesh(SphereMesh, SphereMaterial);
    scene.add(center_object);
    items.push(center_object);
}

function createControls(camera) {

    controls = new TrackballControls(camera, renderer.domElement);

    controls.rotateSpeed = 1.0;
    controls.zoomSpeed = 1.2;
    controls.panSpeed = 0.8;

    controls.keys = ['KeyA', 'KeyS', 'KeyD'];

}

function onWindowResize() {

    const aspect = window.innerWidth / window.innerHeight;

    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();

    //orthographicCamera.left = - frustumSize * aspect / 2;
    //orthographicCamera.right = frustumSize * aspect / 2;
    //orthographicCamera.top = frustumSize / 2;
    //orthographicCamera.bottom = - frustumSize / 2;
    //orthographicCamera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth * 0.75 , window.innerHeight * 0.75);

    controls.handleResize();

}

function animate() {

    controls.update();

    render();
}

function render() {

    renderer.render(scene, perspectiveCamera);

}