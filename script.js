import * as THREE from "three";

import * as dat from "https://cdn.skypack.dev/dat.gui@0.7.9";
import {OrbitControls} from "https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js";

/** GALAXY **/

/**
 * Base
 */

// Debug
/*const gui = new dat.GUI({
 width: 350
});
gui.close();*/

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Texture
const textureLoader= new THREE.TextureLoader();
const texture = textureLoader.load('/textures/particles-single.png');

// Galaxy
const parameters = {};
parameters.count = 365000;
parameters.size = 0.025;
parameters.radius = 9;
parameters.branches = 7;
parameters.spin = 1;
parameters.randomness = 2.5;
parameters.randomnessPower = 3; //try 0... cool af
parameters.innerColor = "#ff6030";
parameters.outerColor = "#070041";

let geometry = null;
let galaxyMaterial = null;
let points = null;

const generateGalaxy = () => {
	if (points !== null) {
		geometry.dispose();
		galaxyMaterial.dispose();
		scene.remove(points);
	}

	geometry = new THREE.BufferGeometry();

	const positions = new Float32Array(parameters.count * 3);
	const colors = new Float32Array(parameters.count * 3);

	const insideColor = new THREE.Color(parameters.innerColor);
	const outsideColor = new THREE.Color(parameters.outerColor);

	insideColor.lerp(outsideColor, 0.05);

	for (let i = 0; i < parameters.count; i++) {
		const i3 = i * 3;

		const radius = Math.random() * parameters.radius;
		const spinAngle = radius * parameters.spin;
		const branchAngle =
			((i % parameters.branches) / parameters.branches) * Math.PI * 2;

		const randomY =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness;
		const randomX =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness;
		const randomZ =
			Math.pow(Math.random(), parameters.randomnessPower) *
			(Math.random() < 0.5 ? 1 : -1) *
			parameters.randomness;

		positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
		positions[i3 + 1] = randomY / radius; //try changing operations signs for cooler effect
		positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

		//color
		const mixedColor = insideColor.clone();
		mixedColor.lerp(outsideColor, radius / parameters.radius);

		colors[i3] = mixedColor.r;
		colors[i3 + 1] = mixedColor.g;
		colors[i3 + 2] = mixedColor.b;
	}

	geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
	geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

	function createCircleTexture(color, size) {
		var matCanvas = document.createElement('canvas');
		matCanvas.width = matCanvas.height = size;
		var matContext = matCanvas.getContext('2d');
		// create texture object from canvas.
		var texture = new THREE.Texture(matCanvas);
		// Draw a circle
		var center = size / 2;
		matContext.beginPath();
		matContext.arc(center, center, size/2, 0, 2 * Math.PI, false);
		matContext.closePath();
		matContext.fillStyle = color;
		matContext.fill();
		// need to set needsUpdate
		texture.needsUpdate = true;
		// return a texture made from the canvas
		return texture;
	}

	// Materials
	galaxyMaterial = new THREE.PointsMaterial({
		size: parameters.size,
		sizeAttenuation: true,
		transparent: true,
		//map: texture,
		alphaMap: createCircleTexture('#ffffff', 24),
		depthWrite: false,
		blending: THREE.AdditiveBlending,
		vertexColors: true
	});

	// Points
	points = new THREE.Points(geometry, galaxyMaterial);
	scene.add(points);
};

generateGalaxy();

// console.log(sc)
/*gui
 .add(parameters, "count", 1000, 500000, 1000)
 .name("Galaxy Count")
 .onFinishChange(generateGalaxy);
gui
 .add(parameters, "size", 0.01, 0.1, 0.001)
 .name("Galaxy Size")
 .onFinishChange(generateGalaxy);
gui
 .add(parameters, "radius", 1, 20, 1)
 .name("Galaxy Radius")
 .onFinishChange(generateGalaxy);
gui
 .add(parameters, "branches", 3, 10, 1)
 .name("Galaxy Branches")
 .onFinishChange(generateGalaxy);
gui
 .add(parameters, "spin", -5, 5, 1)
 .name("Galaxy Spin")
 .onFinishChange(generateGalaxy);
gui
 .add(parameters, "randomness", 0, 10, 0.001)
 .name("Galaxy Randomness")
 .onFinishChange(generateGalaxy);
gui
 .add(parameters, "randomnessPower", 0, 10, 0.001)
 .name("Galaxy Randomness Power")
 .onFinishChange(generateGalaxy);
gui
 .addColor(parameters, "innerColor")
 .name("Galaxy Inside Color")
 .onFinishChange(generateGalaxy);
gui
 .addColor(parameters, "outerColor")
 .name("Galaxy Outside Color")
 .onFinishChange(generateGalaxy);*/

/**
 * Sizes
 */

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

/**
 * Camera
 */

// Base camera
const camera = new THREE.PerspectiveCamera(
	75,
	sizes.width / sizes.height,
	0.1,
	1000
);
camera.position.x = 0;
camera.position.y = 13;
camera.position.z = 5;
scene.add(camera);

/**
 * Renderer
 */

const renderer = new THREE.WebGLRenderer({
	canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
	// Update sizes
	sizes.width = window.innerWidth;
	sizes.height = window.innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Controls
var controls;
controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
// controls.autoRotate = true;

// Set the target for the controls
controls.target.set(0, 0, 0); // Target point of the camera

// Adjust the polar angle to tilt the camera downwards
// The default polar angle is Math.PI / 2 (90 degrees), you can decrease it to look downwards
controls.maxPolarAngle = 0; // Adjust this value to tilt the camera downwards
controls.minPolarAngle = Math.PI / 2.5; // You can set this to 0 to avoid the camera flipping over

/**
 * Animate
 */

const clock = new THREE.Clock();

const tick = () => {
	const elapsedTime = clock.getElapsedTime();

	// Update Points
	points.rotation.y = elapsedTime * 0.1;

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call tick again on the next frame
	window.requestAnimationFrame(tick);
};

tick();

/** PLANET **/

var
	width = window.innerWidth,
	height = window.innerHeight,
	material;
var colormap = new THREE.TextureLoader().load("https://raw.githubusercontent.com/pizza3/asset/master/color.png");
var color = new THREE.TextureLoader().load("https://raw.githubusercontent.com/pizza3/asset/master/noise2.jpg");
var noi = new THREE.TextureLoader().load("https://raw.githubusercontent.com/pizza3/asset/master/fluid.jpg");
var uniforms = {
	time: {
		type: "f",
		value: 10.0,
	},
	resolution: {
		value: new THREE.Vector2(width, height),
	},
	color: {type: "f", value: color},
	colormap: {type: "f", value: colormap},
	noiseTex: {type: "f", value: noi},
};

function init() {
	createScene();
	createLights();
	plane();
	animate();
}

function createScene() {
	renderer.antialias = true;
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(width, height);
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.interpolateneMapping = THREE.ACESFilmicToneMapping;
	//renderer.outputEncoding = THREE.sRGBEncoding;
	document.getElementById("world").appendChild(renderer.domElement);
}

function createLights() {
	const hemislight = new THREE.HemisphereLight();
	hemislight.intensity = 0.2;
	scene.add(hemislight);
	const pointlight = new THREE.PointLight();
	pointlight.distance = 1000;
	pointlight.intensity = 0.7;
	pointlight.position.set(30, 70, 20);
	scene.add(pointlight);
}

function plane() {
	new THREE.PlaneGeometry(0, 0, 32);
	var spheregeometry = new THREE.SphereGeometry(1, 32, 32);
	material = new THREE.ShaderMaterial({
		uniforms: uniforms,
		transparent: false,
		vertexShader: document.getElementById("vertexShader").textContent,
		fragmentShader: document.getElementById("fragmentShader").textContent,
	});
	var plane = new THREE.Mesh(spheregeometry, material);
	plane.rotation.z = Math.PI / 1.5;
	scene.add(plane);
}

function animate(delta) {
	requestAnimationFrame(animate);
	material.uniforms.time.value = delta * 0.6;
	renderer.render(scene, camera);
}

init();
