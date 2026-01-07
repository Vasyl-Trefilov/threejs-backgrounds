import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050008);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.y = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// const size = 10;
// const divisions = 10;
// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);
const hemiLight = new THREE.HemisphereLight(0xff99ff, 0x000011, 2);
scene.add(hemiLight);

const coreGeo = new THREE.SphereGeometry(0.6, 32, 32);
const coreMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
});
const core = new THREE.Mesh(coreGeo, coreMat);
scene.add(core);

const CENTER = new THREE.Vector3(0, 0, 0);

const RAY_COUNT = 150;
const STEPS = 200;
const STEP_SIZE = 0.08;

let BASE_G = 0.08;
const FALLOFF = 0.6;
const SWIRL = 0.15;

const LENS_STRENGTH = 0.02;
const SOFTENING = 0.5;

function createRay() {
  const positions = [];
  let minDist = Infinity;
  const velocity = new THREE.Vector3(0, 0, -1);

  let p = new THREE.Vector3(
    (Math.random() - 0.5) * (STEPS * STEP_SIZE),
    (Math.random() - 0.5) * (STEPS * STEP_SIZE),
    // 0,
    (STEPS * STEP_SIZE) / 2
  );

  for (let i = 0; i < STEPS; i++) {
    const toCenter = CENTER.clone().sub(p);
    const dist = toCenter.length() + 0.0001;
    minDist = Math.min(minDist, dist);
    const projection = velocity.clone().multiplyScalar(toCenter.dot(velocity));

    const side = toCenter.sub(projection);

    const lensForce = LENS_STRENGTH / (dist * dist + SOFTENING);

    velocity.add(side.normalize().multiplyScalar(lensForce));
    velocity.normalize();

    p.add(velocity.clone().multiplyScalar(STEP_SIZE));

    positions.push(p.x, p.y, p.z);

    if (dist < 0.6) break;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  const t = THREE.MathUtils.clamp((minDist - 0.6) / 4.0, 0, 1);

  const color = new THREE.Color().setHSL(
    THREE.MathUtils.lerp(0.08, 0.0, 1 - t),
    1.0,
    0.5
  );

  const mat = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.8,
  });

  const line = new THREE.Line(geo, mat);
  scene.add(line);
}

for (let i = 0; i < RAY_COUNT; i++) {
  createRay();
}

let time = 0;

function animate() {
  time += 0.01;

  BASE_G = 0.07 + 0.03 * Math.sin(time * 2);

  core.scale.setScalar(1 + 0.08 * Math.sin(time * 3));

  scene.rotation.y += 0.0008;

  controls.update();
  renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
