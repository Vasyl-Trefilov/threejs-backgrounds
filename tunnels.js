import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  2.5
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

const hemiLight = new THREE.HemisphereLight(0xff0000, 0x0000ff, 0.2);
scene.add(hemiLight);

camera.position.y = 15;
camera.position.x = -0.2;

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
});
const cube = new THREE.Mesh(geometry, material);
// scene.add(cube);
const size = 10;
const divisions = 10;
const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

console.log(camera.position);

const particlesDots = new THREE.BufferGeometry();
const segments = 50;
const rings = 200;
const themes = {
  emerald: {
    shape: "lines",
    background: 0x061a12,
    fog: { color: 0x061a12, near: 5, far: 20 },
    color: (t, phi) => [0.2 + 0.3 * Math.sin(t), 0.8, 0.4],
    radius: (phi) => 0.5 + 0.15 * Math.sin(6 * phi),
  },

  fire: {
    shape: "dots",
    background: 0x1a0602,
    fog: { color: 0x1a0602, near: 4, far: 18 },
    color: (t, phi) => [1.0, 0.4 + 0.4 * Math.sin(t * 4), 0.1],
    radius: (phi) => 0.5 + 0.25 * Math.abs(Math.sin(phi)),
  },

  cosmic: {
    shape: "lines",
    background: 0x050014,
    fog: { color: 0x050014, near: 6, far: 25 },
    color: (t, phi) => [
      0.5 + 0.5 * Math.sin(t + phi),
      0.3,
      0.8 + 0.2 * Math.cos(t * 2),
    ],
    radius: (t, phi) => 0.5 + 0.1 * Math.sin(3 * phi + t * 2),
  },
  ribbed: {
    shape: "dots",
    background: 0x050014,
    fog: { color: 0x050014, near: 6, far: 25 },
    color: (t) => [t / (Math.PI * 2), 1.0, 0.5],
    radius: (phi) => 0.5 + 0.2 * Math.sin(12 * phi),
  },
  breathing: {
    shape: "lines",
    background: 0x050014,
    fog: { color: 0x050014, near: 6, far: 25 },
    color: (t, phi) => [0.5 + 0.5 * Math.cos(phi), 0.3, 0.7],
    radius: (phi, t) => 0.5 + 0.15 * Math.sin(6 * phi + t * 3),
  },
  crystalline: {
    shape: "dots",
    background: 0x050014,
    fog: { color: 0x050014, near: 6, far: 25 },
    color: (t) => [0.2, 0.5 + 0.5 * Math.sin(t * 8), 0.8],
    radius: (phi) => 0.4 + 0.3 * Math.sign(Math.sin(5 * phi)),
  },
  spiral: {
    shape: "lines",
    background: 0x050014,
    fog: { color: 0x050014, near: 6, far: 25 },
    color: (t) => [t / (Math.PI * 2), 0.5, 1.0],
    radius: (phi, t) => 0.5 + 0.15 * Math.sin(phi + t * 4),
  },
};
let dotsCount = 0;
let linesCount = 0;

for (const key in themes) {
  const theme = themes[key];
  if (theme.shape === "dots") dotsCount++;
  if (theme.shape === "lines") linesCount++;
}

console.log(Object.keys(themes).length);
const themeNames = Object.keys(themes);
const themeCount = themeNames.length;
const themesPerRing = rings / themeCount;

const bgColor = new THREE.Color();
const fogColor = new THREE.Color();

scene.background = bgColor;
scene.fog = new THREE.Fog(fogColor, 5, 20);
function smoothstep(x) {
  return x * x * (3 - 2 * x);
}
function updateBackground(t) {
  const total = themeNames.length;
  const scaled = t * total;

  const i0 = Math.floor(scaled) % total;
  const i1 = (i0 + 1) % total;

  const localT = smoothstep(scaled % 1);

  const themeA = themes[themeNames[i0]];
  const themeB = themes[themeNames[i1]];

  // background gradient (lerp between numbers)
  const colorA = new THREE.Color(themeA.background);
  const colorB = new THREE.Color(themeB.background);
  bgColor.lerpColors(colorA, colorB, localT);

  // fog color
  const fogA = new THREE.Color(themeA.fog.color);
  const fogB = new THREE.Color(themeB.fog.color);
  fogColor.lerpColors(fogA, fogB, localT);

  scene.fog.near = themeA.fog.near * (1 - localT) + themeB.fog.near * localT;
  scene.fog.far = themeA.fog.far * (1 - localT) + themeB.fog.far * localT;
}
const dotsPositions = new Float32Array(segments * rings * 3);
const dotsColors = new Float32Array(segments * rings * 3);

let dotIndex = 0;

const lineThemeGeometries = {};

for (const key of themeNames) {
  if (themes[key].shape === "lines") {
    lineThemeGeometries[key] = {
      positions: [],
      colors: [],
    };
    const geo = new THREE.BufferGeometry();
    const mat = new THREE.LineBasicMaterial({ vertexColors: true });
    const line = new THREE.Line(geo, mat);
    scene.add(line);
    lineThemeGeometries[key].geo = geo;
  }
}

for (let j = 0; j < rings; j++) {
  const themeIndex = Math.floor(j / themesPerRing);
  const themeName = themeNames[themeIndex];
  const theme = themes[themeName];

  const t = (j / rings) * Math.PI * 2;
  const yChange = Math.cos(t);
  const tNext = ((j + 1) / rings) * Math.PI * 2;

  const r2 = 3 + 0.5 * Math.sin(3 * t) + 0.5 * Math.cos(5 * t);
  const cx = r2 * Math.sin(t);
  const cy = 0;
  const cz = r2 * Math.cos(t);

  const r2n = 3 + 0.5 * Math.sin(3 * tNext) + 0.5 * Math.cos(5 * tNext);
  const nx = r2n * Math.sin(tNext);
  const ny = 0;
  const nz = r2n * Math.cos(tNext);

  let tx = nx - cx;
  let ty = ny - cy;
  let tz = nz - cz;
  const tl = Math.sqrt(tx * tx + ty * ty + tz * tz);
  tx /= tl;
  ty /= tl;
  tz /= tl;

  const upx = 0,
    upy = 1,
    upz = 0;
  let bx = ty * upz - tz * upy;
  let by = tz * upx - tx * upz;
  let bz = tx * upy - ty * upx;
  const bl = Math.sqrt(bx * bx + by * by + bz * bz);
  bx /= bl;
  by /= bl;
  bz /= bl;

  let nx2 = by * tz - bz * ty;
  let ny2 = bz * tx - bx * tz;
  let nz2 = bx * ty - by * tx;

  for (let i = 0; i < segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    const r = theme.radius(phi, t);
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);

    const x = cx + r * (cosP * nx2 + sinP * bx);
    const y = cy + r * (cosP * ny2 + sinP * by);
    const z = cz + r * (cosP * nz2 + sinP * bz);

    const [cr, cg, cb] = theme.color(t, phi);

    if (theme.shape === "dots") {
      dotsPositions[dotIndex] = x;
      dotsPositions[dotIndex + 1] = y + yChange;
      dotsPositions[dotIndex + 2] = z;
      dotsColors[dotIndex] = cr;
      dotsColors[dotIndex + 1] = cg;
      dotsColors[dotIndex + 2] = cb;
      dotIndex += 3;
    } else if (theme.shape === "lines") {
      const lineObj = lineThemeGeometries[themeName];
      lineObj.positions.push(x, y + yChange, z);
      lineObj.colors.push(cr, cg, cb);
    }
  }
}

for (const key in lineThemeGeometries) {
  const obj = lineThemeGeometries[key];
  obj.geo.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(obj.positions, 3)
  );
  obj.geo.setAttribute(
    "color",
    new THREE.Float32BufferAttribute(obj.colors, 3)
  );
}
particlesDots.setAttribute(
  "position",
  new THREE.BufferAttribute(dotsPositions, 3)
);
particlesDots.setAttribute("color", new THREE.BufferAttribute(dotsColors, 3));
const particleMaterial = new THREE.PointsMaterial({
  size: 0.05,
  vertexColors: true,
  transparent: true,
  opacity: 0.8,
});
const particleSystem = new THREE.Points(particlesDots, particleMaterial);
scene.add(particleSystem);
const skyGeo = new THREE.SphereGeometry(60, 32, 32);
const skyMat = new THREE.MeshBasicMaterial({
  color: 0xffffff,
  side: THREE.BackSide,
});
const sky = new THREE.Mesh(skyGeo, skyMat);
scene.add(sky);

// let cameraAnim = [0, 0, 0];
let cameraAnimVar = 0;
const lookAhead = 0.1;

function animate() {
  const progress = cameraAnimVar / (Math.PI * 2);
  updateBackground(progress);
  const t = cameraAnimVar;
  const yChange = Math.cos(t);
  const r = 3 + 0.5 * Math.sin(3 * t) + 0.5 * Math.cos(5 * t);

  const x = r * Math.sin(t);
  const z = r * Math.cos(t);

  camera.position.set(x, 0 + yChange, z);
  cube.position.set(x, 0 + yChange, z);

  const t2 = t + lookAhead;

  const r2 = 3 + 0.5 * Math.sin(3 * t2) + 0.5 * Math.cos(5 * t2);

  const x2 = r2 * Math.sin(t2);
  const y2 = Math.cos(t2);
  const z2 = r2 * Math.cos(t2);

  camera.lookAt(x2, y2, z2);

  renderer.render(scene, camera);

  cameraAnimVar += 0.001;
  sky.material.color.copy(bgColor);
  sky.rotation.y += 0.0001;
}

//r(θ) = 3 + 1.5 * sin(3*θ) + 0.5 * cos(5*θ)
//(r(θ) * cos(θ), r(θ) * sin(θ))

renderer.setAnimationLoop(animate);
