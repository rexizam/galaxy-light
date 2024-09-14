import * as THREE from "three";
import { OrbitControls } from "https://unpkg.com/three@0.149.0/examples/jsm/controls/OrbitControls.js";

/* INIT */

/** Canvas **/
const canvas = document.querySelector("canvas.galaxy");

/** Scene **/
const scene = new THREE.Scene();

/** Clock **/
const clock = new THREE.Clock();

/** Sizes **/
const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

/** Base camera **/
const camera = new THREE.PerspectiveCamera(
	50,
	sizes.width / sizes.height,
	1,
	10000
);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 2000;
scene.add(camera);

/** Renderer **/
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

/** Controls **/
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

addEventListener('DOMContentLoaded', start);

function start() {
	generateGalaxy();
	createParticles();
	createPoints();
	createSphere();
	animate();
}

/**----------------------------------------------------- GALAXY -----------------------------------------------------**/

// Texture
const textureLoader= new THREE.TextureLoader();
const texture = textureLoader.load('https://catlikecoding.com/unity/tutorials/custom-srp/particles/unlit-particles/particles-single.png');

// Galaxy parameters
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
let galaxyPoints = null;

const generateGalaxy = () => {
	if (galaxyPoints !== null) {
		geometry.dispose();
		galaxyMaterial.dispose();
		scene.remove(galaxyPoints);
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
	galaxyPoints = new THREE.Points(geometry, galaxyMaterial);
	scene.add(galaxyPoints);

	// Modify the scale to fit the planet
	galaxyPoints.scale.set(125, 125, 125);
};

/**----------------------------------------------------- PLANET -----------------------------------------------------**/

const particleCount = 60000;
const radius = 220;
const positionProps = ['x', 'y', 'z'];
const colorProps = ['r', 'g', 'b'];
const ageProps = ['age', 'life'];

let sphereGeom;
let sphereMat;
let sphere;
let pointsGeom;
let pointsMat;
let planetPoints;
let positions;
let colors;
let ages;

function createParticles() {
	positions = new PropsArray(particleCount, positionProps);
	colors = new PropsArray(particleCount, colorProps);
	ages = new PropsArray(particleCount, ageProps);

	for (let i = 0; i < particleCount; i++) {
		resetParticle(i);
	}
}

function resetParticle(i) {
	positions.set(setPosition(), i * positions.spread);
	colors.set(setColor(), i * colors.spread);
	ages.set(setAge(), i * ages.spread);
}

function setPosition() {
	let r, p, t, x, y, z;

	r = radius + rand(10);

	t = rand(TAU);
	z = randRange(1);
	p = sqrt(1 - z * z);
	x = r * p * cos(t);
	y = r * p * sin(t);

	z *= r;

	return [x, y, z];
}

function setAge() {
	let age, life;

	age = 0;
	life = 50 + rand(100);

	return [age, life];
}

function setColor() {
	let r, g, b;

	r = fadeIn(60 + rand(100), 360);
	g = fadeIn(80 + rand(60), 360);
	b = fadeIn(180 + rand(60), 360);

	return [r, g, b];
}

function createPoints() {
	const uniforms = {
		u_time: {
			type: 'f',
			value: 0.
		},
		u_texture: {
			type: 'sampler2D',
			value: new THREE.TextureLoader().load('https://s3-us-west-2.amazonaws.com/s.cdpn.io/544318/particle-texture-2.png')
		}
	};

	pointsMat = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('cnoise').textContent +
			document.getElementById('noise-util').textContent +
			document.getElementById('points-vert').textContent,
		fragmentShader: document.getElementById('points-frag').textContent,
		blending: THREE.AdditiveBlending,
		depthTest: true,
		depthWrite: false,
		transparent: true,
		uniforms });

	pointsGeom = new THREE.BufferGeometry();

	pointsGeom.setAttribute(
		'position',
		new THREE.BufferAttribute(positions.values, positions.spread));

	pointsGeom.setAttribute(
		'color',
		new THREE.BufferAttribute(colors.values, colors.spread));

	pointsGeom.setAttribute(
		'age',
		new THREE.BufferAttribute(ages.values, ages.spread));

	planetPoints = new THREE.Points(pointsGeom, pointsMat);

	scene.add(planetPoints);
}

function createSphere() {
	const uniforms = {
		u_time: {
			type: 'f',
			value: 0.
		}
	};

	sphereMat = new THREE.ShaderMaterial({
		vertexShader: document.getElementById('cnoise').textContent +
			document.getElementById('noise-util').textContent +
			document.getElementById('sphere-vert').textContent,
		fragmentShader: document.getElementById('sphere-frag').textContent,
		uniforms
	});

	sphereGeom = new THREE.IcosahedronGeometry(radius, 6);

	sphere = new THREE.Mesh(sphereGeom, sphereMat);

	scene.add(sphere);
}

function updateParticles() {
	let i, age, life;

	for (i = 0; i < particleCount; i++) {
		[age, life] = ages.get(i * ages.spread);

		if (age > life) {
			resetParticle(i);
		} else {
			ages.set([++age], i * ages.spread);
		}
	}

	pointsGeom.attributes.position.needsUpdate = true;
	pointsGeom.attributes.color.needsUpdate = true;
	pointsGeom.attributes.age.needsUpdate = true;
}

/**--------------------------------------------------- ANIMATION ---------------------------------------------------**/

function animate() {
	const elapsedTime = clock.getElapsedTime();

	/** GALAXY **/

	// Update Points
	galaxyPoints.rotation.y = elapsedTime * 0.1;

	/** PLANET **/

	updateParticles();

	pointsMat.uniforms.u_time.value = elapsedTime;
	sphereMat.uniforms.u_time.value = elapsedTime;
	planetPoints.rotation.y += .0025;
	sphere.rotation.y += .0025;

	/** COMMON **/

	// Update controls
	controls.update();

	// Render
	renderer.render(scene, camera);

	// Call animate again on the next frame
	requestAnimationFrame(animate);
}
