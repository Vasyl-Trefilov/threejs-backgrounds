import * as THREE from "three";
import { clickFunction } from "threejs-animations";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);
const geometry1 = new THREE.SphereGeometry(5.01, 24, 12);
const wireframe1 = new THREE.WireframeGeometry(geometry1);
const line1 = new THREE.LineSegments(wireframe1);
line1.material.depthWrite = false;
line1.material.opacity = 0.5;
line1.material.transparent = true;
scene.add(line1);

const geometry2 = new THREE.SphereGeometry(5, 24, 12);
const material2 = new THREE.MeshPhysicalMaterial({ color: 0xffffff });
const shape = new THREE.Mesh(geometry2, material2);
scene.add(shape);
const hemiLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.2);
scene.add(hemiLight);

camera.position.z = 15;
function animate() {
  renderer.render(scene, camera);
  controls.update();
  line1.rotation.y += 0.002;
  shape.rotation.y += 0.002;
}
renderer.setAnimationLoop(animate);
