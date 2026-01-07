import * as THREE from "three";

let scene, camera, renderer;

export function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050008);

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(40, 40, 85);
  camera.lookAt(40, 40, 1);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const pointsCount = 500;
  const pointsG = new THREE.BufferGeometry();
  const pointsV = new Float32Array(pointsCount * 3);
  const initialPositions = new Float32Array(pointsCount * 3);

  for (let i = 0; i < pointsCount * 3; i += 3) {
    const x = Math.random() * 80;
    const y = Math.random() * 80;
    const z = Math.random() * 80;

    pointsV[i] = x;
    pointsV[i + 1] = y;
    pointsV[i + 2] = z;

    initialPositions[i] = x;
    initialPositions[i + 1] = y;
    initialPositions[i + 2] = z;
  }

  pointsG.setAttribute("position", new THREE.BufferAttribute(pointsV, 3));

  const material = new THREE.PointsMaterial({
    size: 0.1,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8,
  });

  const points = new THREE.Points(pointsG, material);
  scene.add(points);

  const maxConnections = pointsCount * 20;
  const lineGeometry = new THREE.BufferGeometry();
  const linePositions = new Float32Array(maxConnections * 6);
  const lineColors = new Float32Array(maxConnections * 6);

  lineGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(linePositions, 3)
  );
  lineGeometry.setAttribute(
    "color",
    new THREE.BufferAttribute(lineColors, 3)
  );

  const lineMaterial = new THREE.LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0.4,
  });

  const lineSegments = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(lineSegments);

  let time = 0;
  const speed = 0.05;
  const connectionDistSq = 256;

  function animate() {
    time += 0.005;

    const positions = pointsG.attributes.position.array;

    for (let i = 0; i < pointsCount * 3; i += 3) {
      positions[i] =
        initialPositions[i] + Math.sin(time + i * 0.01) * speed * 10;
      positions[i + 1] =
        initialPositions[i + 1] + Math.cos(time + i * 0.02) * speed * 5;
      positions[i + 2] =
        initialPositions[i + 2] + Math.sin(time * 0.5 + i * 0.03) * speed * 3;
    }

    pointsG.attributes.position.needsUpdate = true;

    let lineIdx = 0;
    let colorIdx = 0;

    for (let i = 0; i < pointsCount; i++) {
      const ix = positions[i * 3];
      const iy = positions[i * 3 + 1];
      const iz = positions[i * 3 + 2];

      for (let j = i + 1; j < pointsCount; j++) {
        const jx = positions[j * 3];
        const jy = positions[j * 3 + 1];
        const jz = positions[j * 3 + 2];

        const dx = ix - jx;
        const dy = iy - jy;
        const dz = iz - jz;
        const distSq = dx * dx + dy * dy + dz * dz;

        if (distSq < connectionDistSq) {
          linePositions[lineIdx++] = ix;
          linePositions[lineIdx++] = iy;
          linePositions[lineIdx++] = iz;
          linePositions[lineIdx++] = jx;
          linePositions[lineIdx++] = jy;
          linePositions[lineIdx++] = jz;

          const alpha = 1.0 - distSq / connectionDistSq;

          for (let k = 0; k < 6; k++) {
            lineColors[colorIdx++] = alpha;
          }
        }
      }
    }

    lineGeometry.setDrawRange(0, lineIdx / 3);
    lineGeometry.attributes.position.needsUpdate = true;
    lineGeometry.attributes.color.needsUpdate = true;

    renderer.render(scene, camera);
  }

  renderer.setAnimationLoop(animate);
  window.addEventListener("resize", onResize);
}

export function dispose() {
  renderer.setAnimationLoop(null);
  renderer.dispose();
  renderer.domElement.remove();
  window.removeEventListener("resize", onResize);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.onerror = function(message, source, lineno, colno, error) {
  alert(`Error: ${message} at ${lineno}:${colno}`);
};
