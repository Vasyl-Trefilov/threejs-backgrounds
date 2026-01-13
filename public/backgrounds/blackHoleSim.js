import * as THREE from "three";

let scene, camera, renderer;

import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050008);

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  camera.position.z = 200;
  camera.position.y = 200;
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  //   const size = 100;
  //   const divisions = 10;
  //   const gridHelper = new THREE.GridHelper(size, divisions);
  //   scene.add(gridHelper);
  const hemiLight = new THREE.HemisphereLight(0xff99ff, 0x000011, 2);
  scene.add(hemiLight);

  const planeGeometry = new THREE.PlaneGeometry(300, 300, 100, 100);
  const planeMaterial = new THREE.MeshBasicMaterial({
    color: 0x00aa00,
    wireframe: true,
  });
  const plane = new THREE.Mesh(planeGeometry, planeMaterial);

  scene.add(plane);

  plane.rotateX(Math.PI / 2);

  const G = 6.674e-11;
  const C = 299792458;
  const SOLAR_MASS = 1.989e30;

  const SCALE = 10000;

  function getSchwarzschildRadius(massKg) {
    return (2 * G * massKg) / Math.pow(C, 2);
  }

  const bhParams = {
    mass: SOLAR_MASS * 20,
    position: new THREE.Vector3(0, 0, 0),
  };

  const rsMeters = getSchwarzschildRadius(bhParams.mass);
  const rsScene = rsMeters / SCALE;

  const blackHoleGeo = new THREE.SphereGeometry(rsScene, 32, 32);
  const blackHoleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
  const blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
  blackHole.position.copy(bhParams.position);
  scene.add(blackHole);

  const pos = planeGeometry.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    let x = pos.getX(i);
    let y = pos.getY(i);

    const dx = x - bhParams.position.x;
    const dy = y - bhParams.position.z;
    const r = Math.sqrt(dx * dx + dy * dy);

    let z = 0;
    if (r > rsScene) {
      z = -Math.sqrt(rsScene * (r - rsScene)) * 3;
    } else {
      z = -0.01;
    }

    pos.setZ(i, z);
  }
  pos.needsUpdate = true;
  plane.position.y = -100;

  function createLightRay(startPos, direction, rs) {
    const points = [];
    let currentPos = startPos.clone();
  
    let velocity = direction.clone().normalize().multiplyScalar(1.5); 
    
    const maxSteps = 400;
    
    for (let i = 0; i < maxSteps; i++) {
      points.push(currentPos.clone());

      const dist = currentPos.distanceTo(bhParams.position);

      if (dist < rs) break;
      const gravityDir = new THREE.Vector3().subVectors(bhParams.position, currentPos).normalize();
      
      const bendingForce = (3 * rs) / (dist * dist); 
      velocity.add(gravityDir.multiplyScalar(bendingForce));
      velocity.normalize().multiplyScalar(1.5);

      currentPos.add(velocity);
      if (currentPos.length() > 200) break;
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0xffffff, 
        transparent: true, 
        opacity: 0.6 
    });
    return new THREE.Line(geometry, material);
  }

  const raysGroup = new THREE.Group();
  
 
  for (let i = -40; i <= 40; i += 4) {
    const startX = -140;
    const startY = 0;   
    const startZ = i;  
    
    const startPos = new THREE.Vector3(startX, startY, startZ);
    const direction = new THREE.Vector3(1, 0, 0); 
    
    const ray = createLightRay(startPos, direction, rsScene);
    raysGroup.add(ray);
  }

  scene.add(raysGroup);

  raysGroup.position.y = 0;

  const starGeometry = new THREE.BufferGeometry();
  const starCount = 6000;
  const starPositions = new Float32Array(starCount * 3);

  for (let i = 0; i < starCount; i++) {
    const r = 200 + Math.random() * 1000;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    starPositions[i * 3] = x;
    starPositions[i * 3 + 1] = y;
    starPositions[i * 3 + 2] = z;
  }

  starGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(starPositions, 3)
  );

  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1, // make them bigger so you see them
    sizeAttenuation: true,
    depthWrite: false, // prevent z-buffer hiding them
    blending: THREE.AdditiveBlending, // stars glow
    // map: new THREE.TextureLoader().load("/textures/star.png"),
    transparent: true,
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);
  function animate() {
    stars.rotation.y += 0.0004;
    controls.update();
    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
  window.addEventListener("resize", onResize);
}

export function dispose() {
  if (!renderer) return;
  renderer.setAnimationLoop(null);
  renderer.dispose();
  renderer.domElement?.remove();
  window.removeEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.onerror = function (message, source, lineno, colno, error) {
  alert(`Error: ${message} at ${lineno}:${colno}`);
};
