import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { clone as cloneSkeleton } from "three/addons/utils/SkeletonUtils.js";
import "./style.css";

const app = document.querySelector("#app");

app.innerHTML = `
  <main class="story-root" aria-label="Lakshmanan Palani Three.js portfolio story">
    <canvas class="scene-canvas" aria-hidden="true"></canvas>
    <div class="atmosphere"></div>
    <div class="progress-track" aria-hidden="true">
      <span class="progress-fill"></span>
    </div>

    <div class="scroll-hint">
      <span class="scroll-hint-label">Scroll to walk the garden path</span>
      <span class="scroll-hint-line" aria-hidden="true"></span>
    </div>

    <button class="sound-toggle" type="button" aria-pressed="true">Sound on</button>

    <div class="intro-overlay">
      <div class="intro-panel">
        <p class="intro-eyebrow">Garden House Portfolio</p>
        <h1 class="intro-title">Enter Lakshmanan Palani&apos;s house</h1>
        <p class="intro-copy">
          A slower home tour through the garden, entrance, staircase, dancing room, and terrace.
        </p>
        <p class="intro-status">Loading scene assets...</p>
        <button class="enter-button" type="button" disabled>Loading 0%</button>
      </div>
    </div>
  </main>
  <div class="scroll-space" aria-hidden="true"></div>
`;

const canvas = document.querySelector(".scene-canvas");
const progressFill = document.querySelector(".progress-fill");
const scrollHint = document.querySelector(".scroll-hint");
const soundToggle = document.querySelector(".sound-toggle");
const introOverlay = document.querySelector(".intro-overlay");
const introStatus = document.querySelector(".intro-status");
const enterButton = document.querySelector(".enter-button");

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xb8d2ee);
scene.fog = new THREE.Fog(0xcfe1f3, 52, 168);

const camera = new THREE.PerspectiveCamera(44, window.innerWidth / window.innerHeight, 0.05, 260);
camera.position.set(0, 7, 58);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  powerPreference: "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
const bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.38, 0.82, 0.84);
bloomPass.threshold = 0.79;
bloomPass.strength = 0.42;
bloomPass.radius = 0.6;
composer.addPass(renderPass);
composer.addPass(bloomPass);

const mediaQuery = window.matchMedia("(max-width: 900px)");
const densityMultiplier = mediaQuery.matches ? 0.62 : 1;

const materials = createMaterials();
const animatedWorld = {
  grass: [],
  flowers: [],
  trees: [],
  clouds: [],
  birds: [],
  mixers: [],
  people: [],
  tvScreens: [],
  dancingCharacter: null,
  dancingSpotlight: null,
  windmillRotor: null,
  windmillCap: null,
  leftDoorPivot: null,
  rightDoorPivot: null,
  upperLeftDoorPivot: null,
  upperRightDoorPivot: null,
  lanterns: [],
  curtainPanels: []
};

const loadingManager = new THREE.LoadingManager();
const gltfLoader = new GLTFLoader(loadingManager);

createLights(scene);
createSkyDome(scene);
createGarden(scene, materials, animatedWorld, densityMultiplier);
createHouse(scene, renderer, materials, animatedWorld);
createWindmill(scene, materials, animatedWorld);
createClouds(scene, materials, animatedWorld, densityMultiplier);
loadBirdAssets(scene, animatedWorld, gltfLoader);

const cameraTrack = [
  { at: 0.0, position: new THREE.Vector3(0, 7.2, 64), look: new THREE.Vector3(0, 4.1, 7) },
  { at: 0.08, position: new THREE.Vector3(1.1, 6.7, 51), look: new THREE.Vector3(0, 4.0, 6.3) },
  { at: 0.18, position: new THREE.Vector3(0.5, 5.8, 34), look: new THREE.Vector3(0, 3.6, 6.4) },
  { at: 0.3, position: new THREE.Vector3(0, 4.1, 17), look: new THREE.Vector3(0, 3.1, 6.8) },
  { at: 0.4, position: new THREE.Vector3(0, 2.9, 8.9), look: new THREE.Vector3(0, 2.5, 6.1) },
  { at: 0.5, position: new THREE.Vector3(-5.85, 2.72, 2.3), look: new THREE.Vector3(-8.55, 3.0, 0.6) },
  { at: 0.58, position: new THREE.Vector3(4.98, 2.64, -0.48), look: new THREE.Vector3(8.28, 2.68, -2.62) },
  { at: 0.65, position: new THREE.Vector3(5.82, 2.56, 1.44), look: new THREE.Vector3(5.46, 2.42, -0.76) },
  { at: 0.72, position: new THREE.Vector3(5.6, 3.54, -0.22), look: new THREE.Vector3(5.34, 3.78, -2.02) },
  { at: 0.79, position: new THREE.Vector3(5.3, 4.82, -2.18), look: new THREE.Vector3(5.06, 5.02, -4.6) },
  { at: 0.84, position: new THREE.Vector3(0.16, 6.02, 0.28), look: new THREE.Vector3(2.9, 5.96, 2.15) },
  { at: 0.9, position: new THREE.Vector3(0.18, 6.03, 0.82), look: new THREE.Vector3(4.0, 5.94, 2.42) },
  { at: 0.95, position: new THREE.Vector3(0.22, 6.04, 1.34), look: new THREE.Vector3(4.78, 5.92, 2.58) },
  { at: 0.98, position: new THREE.Vector3(0.56, 6.34, 6.9), look: new THREE.Vector3(0.22, 6.12, 10.8) },
  { at: 1.0, position: new THREE.Vector3(0, 7.22, 11.7), look: new THREE.Vector3(0, 4.6, 33.5) }
];

const state = {
  scrollTarget: 0,
  scrollCurrent: 0,
  pointerTarget: new THREE.Vector2(),
  pointerCurrent: new THREE.Vector2(),
  entered: false,
  assetsReady: false
};

const sampledCameraPosition = new THREE.Vector3();
const sampledLookTarget = new THREE.Vector3();
const cameraOffset = new THREE.Vector3();
const baseLookDirection = new THREE.Vector3();
const rotatedLookDirection = new THREE.Vector3();
const composedLookTarget = new THREE.Vector3();
const lookSpherical = new THREE.Spherical();

const ambientSound = createAmbientSoundController(soundToggle);

document.body.style.overflowY = "hidden";

loadingManager.onProgress = (_url, loaded, total) => {
  const percent = total === 0 ? 100 : Math.round((loaded / total) * 100);
  introStatus.textContent = "Loading people, birds, and scene polish...";
  enterButton.textContent = `Loading ${percent}%`;
};

loadingManager.onLoad = () => {
  state.assetsReady = true;
  introStatus.textContent = "Everything is ready. Click to enter and start the house tour.";
  enterButton.disabled = false;
  enterButton.textContent = "Enter experience";
};

loadingManager.onError = () => {
  introStatus.textContent = "Some imported assets failed to load, but the tour is still ready.";
  state.assetsReady = true;
  enterButton.disabled = false;
  enterButton.textContent = "Enter experience";
};

function updateScrollTarget() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  state.scrollTarget = maxScroll <= 0 ? 0 : clamp01(window.scrollY / maxScroll);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  composer.setSize(window.innerWidth, window.innerHeight);
  composer.setPixelRatio(Math.min(window.devicePixelRatio, 1.8));
  bloomPass.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("scroll", updateScrollTarget, { passive: true });
window.addEventListener("resize", onResize);
window.addEventListener("pointermove", (event) => {
  state.pointerTarget.x = (event.clientX / window.innerWidth) * 2 - 1;
  state.pointerTarget.y = (event.clientY / window.innerHeight) * 2 - 1;
});
window.addEventListener("pointerleave", () => {
  state.pointerTarget.set(0, 0);
});
window.addEventListener(
  "touchmove",
  (event) => {
    const touch = event.touches[0];
    if (!touch) {
      return;
    }
    state.pointerTarget.x = (touch.clientX / window.innerWidth) * 2 - 1;
    state.pointerTarget.y = (touch.clientY / window.innerHeight) * 2 - 1;
  },
  { passive: true }
);
window.addEventListener("touchend", () => {
  state.pointerTarget.set(0, 0);
});

enterButton.addEventListener("click", async () => {
  if (!state.assetsReady) {
    return;
  }

  state.entered = true;
  introOverlay.classList.add("is-hidden");
  document.body.style.overflowY = "";
  await ambientSound.enable();
  soundToggle.classList.add("is-visible");
});

soundToggle.addEventListener("click", async () => {
  if (!state.entered) {
    return;
  }

  await ambientSound.toggle();
});

updateScrollTarget();
onResize();
updateHud(0);

const clock = new THREE.Clock();

renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  const elapsed = clock.elapsedTime;
  state.scrollCurrent = THREE.MathUtils.damp(state.scrollCurrent, state.scrollTarget, 2.05, delta);

  updateHud(state.scrollCurrent);
  sampleCameraTrack(cameraTrack, state.scrollCurrent, sampledCameraPosition, sampledLookTarget);
  updateWorldAnimations(animatedWorld, elapsed, delta, state.scrollCurrent);
  ambientSound.update(state.scrollCurrent);

  state.pointerCurrent.lerp(state.pointerTarget, 1 - Math.exp(-delta * 4.4));

  const stairPresence = smoothPulse(state.scrollCurrent, 0.65, 0.81, 0.04);
  const corridorPresence = smoothPulse(state.scrollCurrent, 0.82, 0.96, 0.04);
  const terraceClimbPresence = smoothPulse(state.scrollCurrent, 0.97, 0.995, 0.02);
  const outdoorPresence = Math.max(1 - smoothRange(state.scrollCurrent, 0.34, 0.46), smoothRange(state.scrollCurrent, 0.95, 1.0));
  const yawRange = THREE.MathUtils.lerp(0.5, 0.68, outdoorPresence) + corridorPresence * 0.16;
  const pitchRange = THREE.MathUtils.lerp(0.24, 0.32, outdoorPresence) + corridorPresence * 0.08;

  cameraOffset.set(
    state.pointerCurrent.x * THREE.MathUtils.lerp(0.08, 0.02, corridorPresence),
    -state.pointerCurrent.y * THREE.MathUtils.lerp(0.06, 0.018, corridorPresence),
    0
  );

  if (stairPresence > 0) {
    const stairT = clamp01((state.scrollCurrent - 0.65) / 0.16);
    const strideWave = Math.sin(stairT * Math.PI * 12.5);
    const lift = Math.max(0, strideWave) * 0.18;
    cameraOffset.y += lift * stairPresence + stairT * 0.08;
    cameraOffset.x += Math.sin(stairT * Math.PI * 2.8) * 0.06 * stairPresence;
    cameraOffset.z += (1 - Math.cos(stairT * Math.PI * 12.5)) * 0.018 * stairPresence;
  }

  if (terraceClimbPresence > 0) {
    const climbT = clamp01((state.scrollCurrent - 0.93) / 0.06);
    const climbWave = Math.sin(climbT * Math.PI * 4.8);
    cameraOffset.y += Math.max(0, climbWave) * 0.11 * terraceClimbPresence + climbT * 0.04;
    cameraOffset.x += Math.sin(climbT * Math.PI * 1.8) * 0.03 * terraceClimbPresence;
  }

  camera.position.copy(sampledCameraPosition).add(cameraOffset);
  baseLookDirection.copy(sampledLookTarget).sub(sampledCameraPosition);
  const lookDistance = baseLookDirection.length();
  lookSpherical.setFromVector3(baseLookDirection);
  lookSpherical.theta -= state.pointerCurrent.x * yawRange;
  lookSpherical.phi = THREE.MathUtils.clamp(lookSpherical.phi + state.pointerCurrent.y * pitchRange, 0.18, Math.PI - 0.18);
  rotatedLookDirection.setFromSpherical(lookSpherical);
  composedLookTarget.copy(camera.position).add(rotatedLookDirection.multiplyScalar(lookDistance));
  camera.lookAt(composedLookTarget);

  composer.render();
});

function updateHud(progress) {
  progressFill.style.transform = `scaleX(${progress.toFixed(4)})`;
  scrollHint.style.opacity = String(1 - smoothRange(progress, 0.05, 0.22));
  scrollHint.style.transform = `translate(-50%, ${smoothRange(progress, 0, 0.18) * 12}px)`;
}

function createMaterials() {
  return {
    ground: new THREE.MeshStandardMaterial({ color: 0x8fbc78, roughness: 0.98 }),
    soil: new THREE.MeshStandardMaterial({ color: 0x785f42, roughness: 1 }),
    path: new THREE.MeshStandardMaterial({ color: 0xc2a178, roughness: 0.92 }),
    stone: new THREE.MeshStandardMaterial({ color: 0xe7dccb, roughness: 0.84 }),
    wall: new THREE.MeshStandardMaterial({ color: 0xf3eadc, roughness: 0.84 }),
    trim: new THREE.MeshStandardMaterial({ color: 0xe0ceb1, roughness: 0.78 }),
    wood: new THREE.MeshStandardMaterial({ color: 0x91613d, roughness: 0.72 }),
    darkWood: new THREE.MeshStandardMaterial({ color: 0x5a3728, roughness: 0.76 }),
    deck: new THREE.MeshStandardMaterial({ color: 0xb47f57, roughness: 0.74 }),
    interiorFloor: new THREE.MeshStandardMaterial({ color: 0xd8c5a7, roughness: 0.84 }),
    rug: new THREE.MeshStandardMaterial({ color: 0x708f82, roughness: 0.94 }),
    fabric: new THREE.MeshStandardMaterial({ color: 0x8ca8b8, roughness: 0.95 }),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0xc7dde7,
      roughness: 0.06,
      transmission: 0.68,
      thickness: 0.14,
      transparent: true,
      opacity: 0.55
    }),
    metal: new THREE.MeshStandardMaterial({ color: 0x4e5e67, roughness: 0.4, metalness: 0.58 }),
    leaf: new THREE.MeshStandardMaterial({ color: 0x5f9554, roughness: 0.9 }),
    pot: new THREE.MeshStandardMaterial({ color: 0xbf7d54, roughness: 0.88 }),
    glow: new THREE.MeshStandardMaterial({
      color: 0xffddb4,
      emissive: 0xffae68,
      emissiveIntensity: 0.72,
      roughness: 0.3
    }),
    windowGlow: new THREE.MeshStandardMaterial({
      color: 0xffe4be,
      emissive: 0xf5ad6c,
      emissiveIntensity: 0.28,
      roughness: 0.18
    })
  };
}

function createLights(targetScene) {
  const hemi = new THREE.HemisphereLight(0xdcecff, 0x5f6d57, 0.88);
  targetScene.add(hemi);

  const sun = new THREE.DirectionalLight(0xfff2dc, 1.42);
  sun.position.set(34, 46, 18);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.near = 1;
  sun.shadow.camera.far = 180;
  sun.shadow.camera.left = -54;
  sun.shadow.camera.right = 54;
  sun.shadow.camera.top = 54;
  sun.shadow.camera.bottom = -54;
  targetScene.add(sun);

  const fill = new THREE.DirectionalLight(0xaed0ff, 0.42);
  fill.position.set(-22, 18, -26);
  targetScene.add(fill);

  const entryLight = new THREE.PointLight(0xffc792, 8, 24, 1.8);
  entryLight.position.set(0, 4.2, 2.4);
  targetScene.add(entryLight);

  const studioLight = new THREE.PointLight(0xffdcb0, 8, 26, 1.8);
  studioLight.position.set(0, 7.6, 1.6);
  targetScene.add(studioLight);

  const terraceLight = new THREE.PointLight(0xffd6a6, 4.5, 18, 2);
  terraceLight.position.set(0, 6.6, 9.8);
  targetScene.add(terraceLight);
}

function createSkyDome(targetScene) {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      topColor: { value: new THREE.Color(0x6ea8ec) },
      horizonColor: { value: new THREE.Color(0xd4ecff) },
      bottomColor: { value: new THREE.Color(0xf6f0d9) },
      sunColor: { value: new THREE.Color(0xfff1c0) },
      sunDirection: { value: new THREE.Vector3(0.35, 0.75, 0.12).normalize() }
    },
    vertexShader: `
      varying vec3 vWorldPosition;
      void main() {
        vec4 worldPosition = modelMatrix * vec4(position, 1.0);
        vWorldPosition = worldPosition.xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec3 topColor;
      uniform vec3 horizonColor;
      uniform vec3 bottomColor;
      uniform vec3 sunColor;
      uniform vec3 sunDirection;
      varying vec3 vWorldPosition;

      void main() {
        vec3 direction = normalize(vWorldPosition);
        float skyMix = smoothstep(-0.2, 0.72, direction.y);
        float horizonMix = smoothstep(-0.18, 0.18, direction.y);
        vec3 sky = mix(bottomColor, horizonColor, horizonMix);
        sky = mix(sky, topColor, skyMix);

        float sunGlow = max(dot(direction, normalize(sunDirection)), 0.0);
        sunGlow = pow(sunGlow, 40.0) * 0.82 + pow(sunGlow, 7.0) * 0.14;

        gl_FragColor = vec4(sky + sunColor * sunGlow, 1.0);
      }
    `
  });

  const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 48, 24), material);
  targetScene.add(sky);

  const sunHalo = new THREE.Mesh(
    new THREE.SphereGeometry(5.8, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xffefb4 })
  );
  sunHalo.position.set(46, 62, -42);
  targetScene.add(sunHalo);
}

function createGarden(targetScene, palette, animated, density) {
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), palette.ground);
  ground.rotation.x = -Math.PI * 0.5;
  ground.receiveShadow = true;
  targetScene.add(ground);

  const hill = new THREE.Mesh(new THREE.SphereGeometry(24, 18, 12), palette.ground.clone());
  hill.material.color.set(0x7aa466);
  hill.scale.set(1.6, 0.35, 0.7);
  hill.position.set(0, -7.1, -34);
  hill.receiveShadow = true;
  targetScene.add(hill);

  const path = new THREE.Mesh(new THREE.PlaneGeometry(8.8, 52), palette.path);
  path.rotation.x = -Math.PI * 0.5;
  path.position.set(0, 0.03, 31);
  path.receiveShadow = true;
  targetScene.add(path);

  for (let index = 0; index < 23; index += 1) {
    const stone = new THREE.Mesh(new THREE.CylinderGeometry(0.82, 0.94, 0.16, 10), palette.stone);
    stone.position.set((index % 2 === 0 ? -1.2 : 1.2) + randomRange(-0.24, 0.24), 0.09, 52 - index * 1.86);
    stone.rotation.y = randomRange(-0.4, 0.4);
    stone.castShadow = true;
    stone.receiveShadow = true;
    targetScene.add(stone);
  }

  const flowerCount = Math.floor(110 * density);
  const grassCount = Math.floor(170 * density);

  for (let index = 0; index < grassCount; index += 1) {
    const position = pickGardenPosition();
    const tuft = createGrassTuft(position.x, position.z);
    animated.grass.push(tuft);
    targetScene.add(tuft);
  }

  for (let index = 0; index < flowerCount; index += 1) {
    const position = pickGardenPosition();
    const flower = createFlowerCluster(position.x, position.z);
    animated.flowers.push(flower);
    targetScene.add(flower);
  }

  const treePositions = [
    [-18, 0, 26],
    [16, 0, 24],
    [-26, 0, 6],
    [26, 0, -2],
    [-18, 0, -18],
    [20, 0, -14],
    [-32, 0, 38],
    [30, 0, 34]
  ];

  treePositions.forEach(([x, y, z], index) => {
    const tree = createTree(x, y, z, 1 + (index % 3) * 0.12);
    animated.trees.push(tree);
    targetScene.add(tree);
  });
}

function createHouse(targetScene, currentRenderer, palette, animated) {
  const house = new THREE.Group();
  targetScene.add(house);

  addBox(house, [19.6, 0.85, 16.2], palette.trim, [0, 0.42, 0]);
  addBox(house, [18.8, 0.18, 14.8], palette.interiorFloor, [0, 0.92, 0]);

  addBox(house, [12.1, 0.28, 14.8], palette.interiorFloor, [-3.35, 5.4, 0]);
  addBox(house, [6.0, 0.28, 4.0], palette.interiorFloor, [6.05, 5.4, 5.3]);
  addBox(house, [6.0, 0.28, 4.0], palette.interiorFloor, [6.05, 5.4, -5.2]);

  addBox(house, [18.8, 0.28, 14.8], palette.darkWood, [0, 9.2, 0]);

  addBox(house, [18.2, 4.9, 0.35], palette.wall, [0, 2.88, -7.2]);
  addBox(house, [0.35, 4.9, 14.5], palette.wall, [-9.08, 2.88, 0]);
  addBox(house, [0.35, 4.9, 14.5], palette.wall, [9.08, 2.88, 0]);
  addBox(house, [6.4, 4.9, 0.35], palette.wall, [-6.02, 2.88, 7.2]);
  addBox(house, [6.4, 4.9, 0.35], palette.wall, [6.02, 2.88, 7.2]);
  addBox(house, [5.2, 1.15, 0.35], palette.wall, [0, 4.75, 7.2]);

  addBox(house, [18.2, 3.5, 0.35], palette.wall, [0, 7.06, -7.2]);
  addBox(house, [0.35, 3.5, 14.5], palette.wall, [-9.08, 7.06, 0]);
  addBox(house, [0.35, 3.5, 14.5], palette.wall, [9.08, 7.06, 0]);
  addBox(house, [5.25, 3.5, 0.35], palette.wall, [-6.35, 7.06, 7.2]);
  addBox(house, [5.25, 3.5, 0.35], palette.wall, [6.35, 7.06, 7.2]);
  addBox(house, [7.3, 0.9, 0.35], palette.wall, [0, 8.75, 7.2]);

  addBox(house, [9.4, 0.42, 4.8], palette.trim, [0, 0.62, 9.6]);
  [-3.7, -1.2, 1.2, 3.7].forEach((x) => {
    addCylinder(house, 0.24, 0.26, 4.9, palette.trim, [x, 3.05, 9.5]);
  });

  addBox(house, [9.2, 0.24, 4.8], palette.deck, [0, 5.5, 9.55]);

  const terraceRailingFront = addBox(house, [9.0, 0.12, 0.12], palette.metal, [0, 6.52, 11.78]);
  terraceRailingFront.castShadow = false;
  const terraceRailingLeft = addBox(house, [0.12, 0.12, 4.5], palette.metal, [-4.44, 6.52, 9.65]);
  terraceRailingLeft.castShadow = false;
  const terraceRailingRight = addBox(house, [0.12, 0.12, 4.5], palette.metal, [4.44, 6.52, 9.65]);
  terraceRailingRight.castShadow = false;
  [-4.44, -2.2, 0, 2.2, 4.44].forEach((x) => {
    const post = addBox(house, [0.12, 1.0, 0.12], palette.metal, [x, 6.02, 11.78]);
    post.castShadow = false;
  });
  [7.55, 8.95, 10.35, 11.78].forEach((z) => {
    addBox(house, [0.12, 1.0, 0.12], palette.metal, [-4.44, 6.02, z]);
    addBox(house, [0.12, 1.0, 0.12], palette.metal, [4.44, 6.02, z]);
  });

  const leftDoorPivot = new THREE.Group();
  leftDoorPivot.position.set(-1.7, 0.95, 7.14);
  house.add(leftDoorPivot);
  const leftDoor = addBox(leftDoorPivot, [1.7, 3.7, 0.12], palette.wood, [0.85, 1.85, 0]);
  leftDoor.castShadow = true;

  const rightDoorPivot = new THREE.Group();
  rightDoorPivot.position.set(1.7, 0.95, 7.14);
  house.add(rightDoorPivot);
  const rightDoor = addBox(rightDoorPivot, [1.7, 3.7, 0.12], palette.wood, [-0.85, 1.85, 0]);
  rightDoor.castShadow = true;

  animated.leftDoorPivot = leftDoorPivot;
  animated.rightDoorPivot = rightDoorPivot;

  addBox(house, [4.2, 0.16, 0.18], palette.trim, [0, 0.92, 7.08]);
  addBox(house, [0.2, 4.0, 0.18], palette.trim, [-1.8, 2.95, 7.08]);
  addBox(house, [0.2, 4.0, 0.18], palette.trim, [1.8, 2.95, 7.08]);
  addBox(house, [4.2, 0.16, 0.18], palette.trim, [0, 4.86, 7.08]);

  const frontWindows = [
    [-5.55, 2.95, 7.03, 2.6, 1.65],
    [5.55, 2.95, 7.03, 2.6, 1.65],
    [-6.2, 7.05, 7.03, 2.0, 1.4],
    [6.2, 7.05, 7.03, 2.0, 1.4]
  ];

  frontWindows.forEach(([x, y, z, width, height]) => {
    addWindowPane(house, palette.windowGlow, width, height, [x, y, z]);
  });

  addWindowPane(house, palette.windowGlow, 2.4, 1.5, [-8.88, 2.9, 2.6], [0, Math.PI * 0.5, 0]);
  addWindowPane(house, palette.windowGlow, 2.4, 1.5, [-8.88, 7.1, 1.6], [0, Math.PI * 0.5, 0]);
  addWindowPane(house, palette.windowGlow, 2.4, 1.5, [8.88, 2.9, -2.4], [0, Math.PI * 0.5, 0]);
  addWindowPane(house, palette.windowGlow, 2.4, 1.5, [8.88, 7.1, -1.6], [0, Math.PI * 0.5, 0]);
  addWindowPane(house, palette.windowGlow, 2.8, 1.6, [-4.6, 2.95, -7.03]);
  addWindowPane(house, palette.windowGlow, 2.8, 1.6, [4.6, 7.05, -7.03]);

  addBox(house, [4.8, 0.16, 1.1], palette.darkWood, [0, 1.26, 5.72]);
  addBox(house, [0.18, 0.95, 0.18], palette.darkWood, [-2.1, 0.84, 5.72]);
  addBox(house, [0.18, 0.95, 0.18], palette.darkWood, [2.1, 0.84, 5.72]);
  addBox(house, [5.6, 0.03, 2.3], palette.rug, [0, 1.02, 2.6]);

  const welcomeTexture = createWelcomeWallTexture(currentRenderer);
  const artTextures = [
    createArtworkTexture(currentRenderer, 1, "Bloom I"),
    createArtworkTexture(currentRenderer, 3, "Petal I"),
    createArtworkTexture(currentRenderer, 4, "Wind I"),
    createArtworkTexture(currentRenderer, 5, "Light I")
  ];

  createFramedArtwork(house, artTextures[0], [-8.78, 2.8, 3.8], [0, Math.PI * 0.5, 0]);
  createFramedArtwork(
    house,
    welcomeTexture,
    [-8.78, 3.15, 0.4],
    [0, Math.PI * 0.5, 0],
    [2.85, 1.45],
    [2.35, 1.02]
  );
  createFramedArtwork(house, artTextures[1], [-8.78, 2.7, -3.1], [0, Math.PI * 0.5, 0]);
  createFramedArtwork(house, artTextures[2], [8.78, 2.9, 2.8], [0, -Math.PI * 0.5, 0]);
  createFramedArtwork(house, artTextures[3], [8.78, 2.8, -1.1], [0, -Math.PI * 0.5, 0]);

  addBox(house, [3.3, 0.82, 0.95], palette.fabric, [-4.4, 1.48, 0.8]);
  addBox(house, [3.2, 1.2, 0.52], palette.fabric, [-4.4, 2.1, 0.46]);
  addBox(house, [1.5, 0.16, 0.82], palette.darkWood, [-4.4, 1.12, -0.55]);
  createLoungeSofa(house, palette, [5.05, 1.06, -3.05], -Math.PI * 0.5);
  createTelevision(house, currentRenderer, palette, animated, [8.76, 1.18, -2.85], -Math.PI * 0.5);
  addBox(house, [1.65, 0.14, 0.96], palette.darkWood, [5.06, 1.18, -1.35]);
  addBox(house, [0.14, 0.68, 0.14], palette.metal, [4.5, 0.86, -1.35]);
  addBox(house, [0.14, 0.68, 0.14], palette.metal, [5.62, 0.86, -1.35]);

  animated.people.push(
    createStylizedPerson(house, {
      position: [5.34, 1.62, -2.5],
      rotationY: -Math.PI * 0.5,
      seated: true,
      activity: "tv",
      outfitColor: 0x5d7186,
      accentColor: 0xd3995c,
      skinColor: 0xe2bb97
    }),
    createStylizedPerson(house, {
      position: [4.88, 1.62, -3.58],
      rotationY: -Math.PI * 0.5,
      seated: true,
      activity: "tv",
      outfitColor: 0x7a6c8e,
      accentColor: 0x6a8f66,
      skinColor: 0xc99676
    })
  );

  for (let index = 0; index < 12; index += 1) {
    const step = addBox(
      house,
      [2.9, 0.34, 0.64],
      palette.deck,
      [5.45, 0.78 + index * 0.385, 1.85 - index * 0.62]
    );
    step.castShadow = true;
  }

  addBox(house, [0.1, 4.8, 0.1], palette.metal, [3.95, 2.9, -1.6]);
  addBox(house, [0.1, 4.8, 0.1], palette.metal, [6.95, 2.9, -1.6]);
  addBox(house, [3.2, 0.1, 0.1], palette.metal, [5.45, 5.2, -1.6]);

  addBox(house, [5.9, 0.1, 0.1], palette.metal, [2.85, 5.62, 3.08]);
  addBox(house, [0.1, 0.9, 3.7], palette.metal, [5.75, 5.98, 1.34]);
  addBox(house, [0.1, 0.9, 3.7], palette.metal, [0, 5.98, 1.34]);

  addBox(house, [0.08, 3.3, 3.2], palette.wall, [-1.55, 7.06, -2.6]);
  addBox(house, [0.08, 3.3, 3.4], palette.wall, [-1.55, 7.06, 2.7]);
  addBox(house, [0.08, 0.9, 1.95], palette.wall, [-1.55, 8.36, 0]);
  addBox(house, [0.08, 3.3, 3.2], palette.wall, [1.55, 7.06, -2.6]);
  addBox(house, [0.08, 3.3, 3.4], palette.wall, [1.55, 7.06, 2.7]);
  addBox(house, [0.08, 0.9, 1.95], palette.wall, [1.55, 8.36, 0]);
  addBox(house, [2.65, 0.03, 7.1], palette.rug, [0, 5.56, 0.1]);

  const upperLeftDoorPivot = new THREE.Group();
  upperLeftDoorPivot.position.set(-1.46, 5.56, -0.82);
  house.add(upperLeftDoorPivot);
  addBox(upperLeftDoorPivot, [0.12, 2.86, 1.62], palette.wood, [-0.02, 1.43, 0.81]);

  const upperRightDoorPivot = new THREE.Group();
  upperRightDoorPivot.position.set(1.46, 5.56, 0.82);
  house.add(upperRightDoorPivot);
  addBox(upperRightDoorPivot, [0.12, 2.86, 1.62], palette.wood, [0.02, 1.43, -0.81]);

  animated.upperLeftDoorPivot = upperLeftDoorPivot;
  animated.upperRightDoorPivot = upperRightDoorPivot;

  addBox(house, [0.32, 3.25, 6.1], palette.darkWood, [-7.85, 7.08, 0]);
  addBox(house, [0.22, 0.12, 5.88], palette.darkWood, [-7.62, 8.28, 0]);
  addBox(house, [0.22, 0.12, 5.88], palette.darkWood, [-7.62, 7.08, 0]);
  addBox(house, [0.22, 0.12, 5.88], palette.darkWood, [-7.62, 5.88, 0]);
  addBox(house, [0.22, 3.12, 0.12], palette.darkWood, [-7.62, 7.02, -2.9]);
  addBox(house, [0.22, 3.12, 0.12], palette.darkWood, [-7.62, 7.02, 2.9]);
  addShelfBooks(house, [-7.6, 6.08, 0], 8);
  addShelfBooks(house, [-7.6, 7.28, 0], 8);
  addShelfBooks(house, [-7.6, 8.48, 0], 8);

  addWindowPane(house, palette.glass, 3.1, 2.45, [6.25, 7.12, 7.04]);
  addBox(house, [3.38, 0.12, 0.16], palette.trim, [6.25, 8.39, 7.05]);
  addBox(house, [3.38, 0.12, 0.16], palette.trim, [6.25, 5.86, 7.05]);
  addBox(house, [0.12, 2.45, 0.16], palette.trim, [4.6, 7.12, 7.05]);
  addBox(house, [0.12, 2.45, 0.16], palette.trim, [7.9, 7.12, 7.05]);
  addBox(house, [0.08, 2.45, 0.12], palette.trim, [6.25, 7.12, 7.05]);

  const curtainLeft = createCurtainPanel([5.12, 7.08, 6.92], 1.08, 2.45);
  const curtainRight = createCurtainPanel([7.38, 7.08, 6.92], 1.08, 2.45, -1);
  house.add(curtainLeft, curtainRight);
  animated.curtainPanels.push(curtainLeft, curtainRight);
  addBox(house, [3.1, 0.03, 3.6], palette.rug, [6.22, 5.56, 3.35]);
  addBox(house, [1.82, 0.18, 0.86], palette.darkWood, [6.2, 6.14, 1.08]);
  addBox(house, [0.14, 0.58, 0.14], palette.metal, [5.52, 5.86, 1.08]);
  addBox(house, [0.14, 0.58, 0.14], palette.metal, [6.88, 5.86, 1.08]);
  createSpeakerStack(house, palette, [4.84, 5.56, 2.24], 0.04);
  createSpeakerStack(house, palette, [7.62, 5.56, 2.24], -0.04);
  addBox(house, [2.0, 0.12, 0.82], palette.darkWood, [5.16, 5.86, 4.92]);
  addBox(house, [0.16, 0.54, 0.16], palette.darkWood, [4.38, 5.65, 4.92]);
  addBox(house, [0.16, 0.54, 0.16], palette.darkWood, [5.94, 5.65, 4.92]);

  const discoBall = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 18, 14),
    new THREE.MeshStandardMaterial({ color: 0xc9d3db, roughness: 0.22, metalness: 0.78 })
  );
  discoBall.position.set(6.22, 8.54, 3.28);
  house.add(discoBall);

  const dancingSpotlight = new THREE.SpotLight(0xff7d67, 0, 20, Math.PI * 0.22, 0.5, 1.7);
  dancingSpotlight.position.set(5.72, 8.62, 2.42);
  dancingSpotlight.target.position.set(5.28, 5.76, 2.56);
  dancingSpotlight.castShadow = false;
  house.add(dancingSpotlight, dancingSpotlight.target);
  animated.dancingSpotlight = dancingSpotlight;

  createPottedPlant(house, palette, [-6.9, 5.79, 2.9], 0.95);
  createPottedPlant(house, palette, [7.4, 5.77, 8.9], 0.9);
  createPottedPlant(house, palette, [-3.4, 5.82, 10.4], 1.1);

  addBox(house, [2.8, 0.16, 1.1], palette.darkWood, [2.8, 6.15, 10.1]);
  addBox(house, [0.16, 0.46, 0.16], palette.darkWood, [1.6, 5.85, 10.1]);
  addBox(house, [0.16, 0.46, 0.16], palette.darkWood, [4.0, 5.85, 10.1]);

  const terraceLampLeft = addCylinder(house, 0.12, 0.12, 0.42, palette.glow, [-3.85, 6.72, 11.3]);
  const terraceLampRight = addCylinder(house, 0.12, 0.12, 0.42, palette.glow, [3.85, 6.72, 11.3]);
  animated.lanterns.push(terraceLampLeft, terraceLampRight);
}

function createWindmill(targetScene, palette, animated) {
  const windmill = new THREE.Group();
  windmill.position.set(13.5, 0, -18);
  targetScene.add(windmill);

  addCylinder(windmill, 1.3, 1.8, 10.8, palette.stone, [0, 5.4, 0]);
  addCylinder(windmill, 2.1, 2.4, 1.6, palette.darkWood, [0, 11.1, 0]);
  addBox(windmill, [2.8, 1.1, 2.8], palette.darkWood, [0, 12.12, 0]);
  addBox(windmill, [1.4, 2.6, 0.12], palette.windowGlow, [0, 4.2, 1.34]);

  const cap = new THREE.Group();
  cap.position.set(0, 11.2, 1.2);
  windmill.add(cap);
  animated.windmillCap = cap;

  const rotor = new THREE.Group();
  cap.add(rotor);
  animated.windmillRotor = rotor;

  const hub = addCylinder(rotor, 0.34, 0.34, 0.9, palette.trim, [0, 0, 0], [Math.PI * 0.5, 0, 0]);
  hub.castShadow = true;

  for (let index = 0; index < 4; index += 1) {
    const blade = new THREE.Group();
    blade.rotation.z = (Math.PI * 0.5 * index) + Math.PI * 0.25;
    const arm = addBox(blade, [0.16, 5.2, 0.16], palette.darkWood, [0, 2.3, 0]);
    arm.castShadow = true;
    const sail = addBox(blade, [1.4, 2.6, 0.04], palette.wall, [0, 3.8, 0.1]);
    sail.castShadow = false;
    rotor.add(blade);
  }
}

function createClouds(targetScene, palette, animated, density) {
  const count = Math.max(4, Math.round(6 * density));

  for (let index = 0; index < count; index += 1) {
    const cloud = new THREE.Group();
    const puffMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.92,
      transparent: true,
      opacity: 0.92
    });

    const puffCount = 4 + (index % 3);
    for (let puffIndex = 0; puffIndex < puffCount; puffIndex += 1) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(randomRange(1.4, 2.8), 14, 12),
        puffMaterial
      );
      puff.position.set(
        (puffIndex - puffCount * 0.5) * 1.6,
        randomRange(-0.25, 0.45),
        randomRange(-0.45, 0.45)
      );
      puff.scale.y = randomRange(0.75, 1.1);
      cloud.add(puff);
    }

    cloud.position.set(randomRange(-52, 52), randomRange(21, 32), randomRange(-48, 14));
    cloud.userData.baseX = cloud.position.x;
    cloud.userData.baseY = cloud.position.y;
    cloud.userData.speed = randomRange(0.75, 1.4);
    cloud.userData.seed = Math.random() * Math.PI * 2;
    targetScene.add(cloud);
    animated.clouds.push(cloud);
  }
}

function createGrassTuft(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.seed = Math.random() * Math.PI * 2;
  group.userData.amplitude = randomRange(0.08, 0.16);

  for (let index = 0; index < 3; index += 1) {
    const shade = new THREE.Color(index % 2 === 0 ? 0x5e9f53 : 0x78b864);
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, randomRange(0.82, 1.26), 0.14),
      new THREE.MeshStandardMaterial({ color: shade, roughness: 0.95 })
    );
    blade.position.y = blade.geometry.parameters.height * 0.5;
    blade.position.x = randomRange(-0.08, 0.08);
    blade.position.z = randomRange(-0.08, 0.08);
    blade.rotation.y = index * (Math.PI / 3) + randomRange(-0.24, 0.24);
    blade.rotation.z = randomRange(-0.28, 0.28);
    blade.castShadow = false;
    blade.receiveShadow = false;
    group.add(blade);
  }

  return group;
}

function createFlowerCluster(x, z) {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  group.userData.seed = Math.random() * Math.PI * 2;
  group.userData.amplitude = randomRange(0.12, 0.22);

  const petalColors = [0xff7b8f, 0xffd257, 0xf4f3f0, 0xa78fff, 0xff9ad5];
  const stem = new THREE.Mesh(
    new THREE.CylinderGeometry(0.04, 0.06, randomRange(0.7, 1.12), 8),
    new THREE.MeshStandardMaterial({ color: 0x5c9251, roughness: 0.9 })
  );
  stem.position.y = stem.geometry.parameters.height * 0.5;
  stem.castShadow = false;
  group.add(stem);

  const blossom = new THREE.Group();
  const petalMaterial = new THREE.MeshStandardMaterial({
    color: petalColors[Math.floor(Math.random() * petalColors.length)],
    roughness: 0.8
  });

  for (let index = 0; index < 5; index += 1) {
    const petal = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), petalMaterial);
    const angle = (Math.PI * 2 * index) / 5;
    petal.position.set(Math.cos(angle) * 0.18, stem.geometry.parameters.height - 0.05, Math.sin(angle) * 0.18);
    petal.scale.set(1.1, 0.55, 1);
    petal.castShadow = false;
    blossom.add(petal);
  }

  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.11, 10, 10),
    new THREE.MeshStandardMaterial({ color: 0x5a4325, roughness: 0.82 })
  );
  center.position.y = stem.geometry.parameters.height - 0.03;
  blossom.add(center);
  group.add(blossom);

  return group;
}

function createTree(x, y, z, scale) {
  const tree = new THREE.Group();
  tree.position.set(x, y, z);
  tree.scale.setScalar(scale);
  tree.userData.seed = Math.random() * Math.PI * 2;

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.32, 0.42, 3.8, 10),
    new THREE.MeshStandardMaterial({ color: 0x6f4d36, roughness: 0.92 })
  );
  trunk.position.y = 1.9;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  tree.add(trunk);

  const canopyMaterial = new THREE.MeshStandardMaterial({ color: 0x5f9154, roughness: 0.9 });
  [
    [0, 4.25, 0, 2.2],
    [-0.95, 3.8, 0.4, 1.6],
    [0.92, 3.75, -0.2, 1.7]
  ].forEach(([cx, cy, cz, radius]) => {
    const canopy = new THREE.Mesh(new THREE.SphereGeometry(radius, 16, 12), canopyMaterial);
    canopy.position.set(cx, cy, cz);
    canopy.castShadow = true;
    tree.add(canopy);
  });

  return tree;
}

function createPottedPlant(parent, palette, position, scale) {
  addCylinder(parent, 0.32 * scale, 0.44 * scale, 0.5 * scale, palette.pot, position);
  for (let index = 0; index < 5; index += 1) {
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(0.26 * scale, 12, 10),
      palette.leaf
    );
    leaf.position.set(
      position[0] + randomRange(-0.22, 0.22) * scale,
      position[1] + 0.44 * scale + index * 0.12 * scale,
      position[2] + randomRange(-0.22, 0.22) * scale
    );
    leaf.scale.set(randomRange(0.7, 1.15), randomRange(1.1, 1.5), randomRange(0.8, 1.2));
    leaf.castShadow = true;
    parent.add(leaf);
  }
}

function createLoungeSofa(parent, palette, position, rotationY = 0) {
  const sofa = new THREE.Group();
  sofa.position.set(...position);
  sofa.rotation.y = rotationY;
  parent.add(sofa);

  addBox(sofa, [3.1, 0.72, 1.16], palette.fabric, [0, 0.36, 0]);
  addBox(sofa, [3.1, 1.02, 0.34], palette.fabric, [0, 0.92, -0.42]);
  addBox(sofa, [0.28, 0.88, 1.1], palette.fabric, [-1.42, 0.48, 0]);
  addBox(sofa, [0.28, 0.88, 1.1], palette.fabric, [1.42, 0.48, 0]);
  addBox(sofa, [3.1, 0.12, 1.12], palette.darkWood, [0, 0.1, 0]);
  addBox(sofa, [0.14, 0.34, 0.14], palette.darkWood, [-1.26, -0.11, -0.38]);
  addBox(sofa, [0.14, 0.34, 0.14], palette.darkWood, [1.26, -0.11, -0.38]);
  addBox(sofa, [0.14, 0.34, 0.14], palette.darkWood, [-1.26, -0.11, 0.38]);
  addBox(sofa, [0.14, 0.34, 0.14], palette.darkWood, [1.26, -0.11, 0.38]);

  const pillowMaterial = new THREE.MeshStandardMaterial({ color: 0xe5d4b2, roughness: 0.92 });
  const leftPillow = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.34, 0.42), pillowMaterial);
  leftPillow.position.set(-0.65, 0.72, 0.1);
  sofa.add(leftPillow);
  const rightPillow = leftPillow.clone();
  rightPillow.position.x = 0.65;
  sofa.add(rightPillow);
}

function createTelevision(parent, currentRenderer, palette, animated, position, rotationY = 0) {
  const television = new THREE.Group();
  television.position.set(...position);
  television.rotation.y = rotationY;
  parent.add(television);

  addBox(television, [1.04, 0.12, 0.62], palette.darkWood, [0, 0.06, 0]);
  addBox(television, [0.12, 0.9, 0.12], palette.metal, [0, 0.56, 0]);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(2.46, 1.48, 0.18),
    new THREE.MeshStandardMaterial({ color: 0x171c20, roughness: 0.36, metalness: 0.24 })
  );
  frame.position.set(0, 1.62, 0);
  television.add(frame);

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.18, 1.22),
    new THREE.MeshStandardMaterial({
      map: createTelevisionTexture(currentRenderer),
      color: 0xffffff,
      emissive: new THREE.Color(0x8cc6ff),
      emissiveIntensity: 0.82,
      roughness: 0.32
    })
  );
  screen.position.set(0, 1.62, 0.1);
  television.add(screen);
  animated.tvScreens.push(screen);
}

function createStylizedPerson(
  parent,
  {
    position,
    rotationY = 0,
    scale = 1,
    seated = false,
    activity = "idle",
    outfitColor = 0x6f7d68,
    accentColor = 0xc08563,
    skinColor = 0xe0bb99
  }
) {
  const group = new THREE.Group();
  group.position.set(...position);
  group.rotation.y = rotationY;
  group.scale.setScalar(scale);
  parent.add(group);

  const outfitMaterial = new THREE.MeshStandardMaterial({ color: outfitColor, roughness: 0.9 });
  const accentMaterial = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.88 });
  const skinMaterial = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.92 });
  const shoeMaterial = new THREE.MeshStandardMaterial({ color: 0x3d332e, roughness: 0.94 });

  const hips = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.24, 0.28), accentMaterial);
  hips.position.y = seated ? 0.28 : 0.54;
  group.add(hips);

  const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.28, 0.74, 12), outfitMaterial);
  torso.position.y = seated ? 0.74 : 1.02;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), skinMaterial);
  head.position.y = seated ? 1.18 : 1.48;
  group.add(head);

  const leftArmPivot = new THREE.Group();
  leftArmPivot.position.set(-0.3, seated ? 0.86 : 1.12, 0);
  group.add(leftArmPivot);
  const leftArm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.58, 10), outfitMaterial);
  leftArm.position.y = -0.28;
  leftArm.rotation.z = seated ? 0.18 : 0.1;
  leftArmPivot.add(leftArm);

  const rightArmPivot = new THREE.Group();
  rightArmPivot.position.set(0.3, seated ? 0.86 : 1.12, 0);
  group.add(rightArmPivot);
  const rightArm = leftArm.clone();
  rightArm.rotation.z = seated ? -0.28 : -0.1;
  rightArmPivot.add(rightArm);

  if (seated) {
    [-0.12, 0.12].forEach((x) => {
      const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.42, 10), accentMaterial);
      thigh.position.set(x, 0.12, 0.14);
      thigh.rotation.x = Math.PI * 0.5;
      group.add(thigh);

      const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.42, 10), accentMaterial);
      calf.position.set(x, -0.16, 0.35);
      calf.rotation.x = 0.32;
      group.add(calf);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.22), shoeMaterial);
      shoe.position.set(x, -0.34, 0.53);
      group.add(shoe);
    });
  } else {
    [-0.11, 0.11].forEach((x) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 0.62, 10), accentMaterial);
      leg.position.set(x, 0.24, 0);
      group.add(leg);

      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.06, 0.22), shoeMaterial);
      shoe.position.set(x, -0.1, 0.03);
      group.add(shoe);
    });
  }

  return {
    group,
    head,
    torso,
    leftArmPivot,
    rightArmPivot,
    baseY: group.position.y,
    baseRotationY: rotationY,
    seed: Math.random() * Math.PI * 2,
    activity,
    seated
  };
}

function addShelfBooks(parent, position, count) {
  const colors = [0x5f7a67, 0x84755c, 0xc19365, 0x6985a4, 0x936c73, 0x5f5c8b];
  let cursor = position[2] - 2.35;

  for (let index = 0; index < count; index += 1) {
    const depth = 0.34 + randomRange(-0.04, 0.08);
    const height = 0.42 + randomRange(0.08, 0.42);
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, height, depth),
      new THREE.MeshStandardMaterial({ color: colors[index % colors.length], roughness: 0.86 })
    );
    book.position.set(position[0], position[1] + height * 0.5 - 0.12, cursor + depth * 0.5);
    book.rotation.x = randomRange(-0.02, 0.02);
    book.rotation.z = randomRange(-0.05, 0.05);
    parent.add(book);
    cursor += depth + 0.08;
  }

  const vase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 0.4, 12),
    new THREE.MeshStandardMaterial({ color: 0xc8c1b2, roughness: 0.66 })
  );
  vase.position.set(position[0], position[1] + 0.12, position[2] + 2.38);
  parent.add(vase);
}

function createSpeakerStack(parent, palette, position, rotationY = 0) {
  const speaker = new THREE.Group();
  speaker.position.set(...position);
  speaker.rotation.y = rotationY;
  parent.add(speaker);

  addBox(speaker, [0.76, 1.56, 0.66], palette.darkWood, [0, 0.78, 0]);
  const ringMaterial = new THREE.MeshStandardMaterial({ color: 0x7f8a92, roughness: 0.42, metalness: 0.42 });
  const coneMaterial = new THREE.MeshStandardMaterial({ color: 0x1d2328, roughness: 0.62, metalness: 0.18 });

  [
    { y: 1.16, radius: 0.19 },
    { y: 0.48, radius: 0.24 }
  ].forEach(({ y, radius }) => {
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, 0.06, 18), ringMaterial);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.set(0, y, 0.34);
    speaker.add(ring);

    const cone = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.55, radius * 0.78, 0.08, 18), coneMaterial);
    cone.rotation.x = Math.PI * 0.5;
    cone.position.set(0, y, 0.35);
    speaker.add(cone);
  });
}

function createFramedArtwork(
  parent,
  texture,
  position,
  rotation,
  frameSize = [1.8, 2.2],
  artSize = [1.45, 1.78]
) {
  addBox(
    parent,
    [frameSize[0], frameSize[1], 0.12],
    new THREE.MeshStandardMaterial({ color: 0x5a3728, roughness: 0.72 }),
    position,
    rotation
  );
  const normalOffset = 0.071;
  const yRotation = rotation[1] || 0;
  const offsetX = Math.sin(yRotation) * normalOffset;
  const offsetZ = Math.cos(yRotation) * normalOffset;
  addTexturedPlane(
    parent,
    artSize[0],
    artSize[1],
    texture,
    [position[0] + offsetX, position[1], position[2] + offsetZ],
    rotation
  );
}

function addWindowPane(parent, material, width, height, position, rotation = [0, 0, 0]) {
  const pane = addBox(parent, [width, height, 0.08], material, position, rotation);
  pane.castShadow = false;
  pane.receiveShadow = false;
  return pane;
}

function addTexturedPlane(parent, width, height, texture, position, rotation = [0, 0, 0]) {
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
  plane.position.set(...position);
  plane.rotation.set(...rotation);
  parent.add(plane);
  return plane;
}

function addBox(parent, size, material, position, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(size[0], size[1], size[2]), material);
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function addCylinder(parent, radiusTop, radiusBottom, height, material, position, rotation = [0, 0, 0]) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, 14),
    material
  );
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

function createWelcomeWallTexture(currentRenderer) {
  return createCanvasTexture(currentRenderer, 980, 280, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#f5ecdc");
    gradient.addColorStop(1, "#d9ebd0");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "#405538";
    context.lineWidth = 10;
    context.strokeRect(20, 20, width - 40, height - 40);

    context.fillStyle = "#6b7e42";
    context.font = "700 34px Georgia, serif";
    context.fillText("WELCOME TO", 56, 78);

    context.fillStyle = "#1b2f17";
    context.font = "700 66px Georgia, serif";
    context.fillText("Lakshmanan Palani's", 56, 162);

    context.fillStyle = "#46604a";
    context.font = "700 48px Georgia, serif";
    context.fillText("House", 56, 230);
  });
}

function createArtworkTexture(currentRenderer, seed, label) {
  const rand = createSeededRandom(seed);
  return createCanvasTexture(currentRenderer, 720, 900, (context, width, height) => {
    const backgrounds = [
      ["#f4ddd0", "#ffd3a5"],
      ["#d8e9f6", "#fef1df"],
      ["#e8f2da", "#b0d7c0"],
      ["#ece1ff", "#ffd9ef"]
    ];
    const palette = backgrounds[seed % backgrounds.length];
    const background = context.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, palette[0]);
    background.addColorStop(1, palette[1]);
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    for (let index = 0; index < 12; index += 1) {
      context.save();
      context.translate(rand() * width, rand() * height);
      context.rotate(rand() * Math.PI * 2);
      context.fillStyle = `hsla(${Math.floor(rand() * 360)}, 72%, 62%, 0.34)`;
      context.beginPath();
      context.ellipse(0, 0, 40 + rand() * 110, 18 + rand() * 36, 0, 0, Math.PI * 2);
      context.fill();
      context.restore();
    }

    for (let index = 0; index < 14; index += 1) {
      const cx = rand() * width;
      const cy = rand() * height;
      const petals = 5 + Math.floor(rand() * 3);
      for (let petal = 0; petal < petals; petal += 1) {
        const angle = (Math.PI * 2 * petal) / petals;
        context.fillStyle = `hsla(${Math.floor(rand() * 360)}, 78%, 68%, 0.76)`;
        context.beginPath();
        context.ellipse(
          cx + Math.cos(angle) * 34,
          cy + Math.sin(angle) * 34,
          32 + rand() * 16,
          14 + rand() * 10,
          angle,
          0,
          Math.PI * 2
        );
        context.fill();
      }
      context.fillStyle = "#59422b";
      context.beginPath();
      context.arc(cx, cy, 12 + rand() * 8, 0, Math.PI * 2);
      context.fill();
    }

    context.fillStyle = "rgba(24, 36, 20, 0.84)";
    context.font = "700 56px Georgia, serif";
    context.fillText(label, 54, height - 62);
  });
}

function createTelevisionTexture(currentRenderer) {
  return createCanvasTexture(currentRenderer, 1220, 720, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#10213c");
    gradient.addColorStop(1, "#234b3a");
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(255, 255, 255, 0.08)";
    context.fillRect(34, 34, width - 68, height - 68);

    context.fillStyle = "rgba(255, 229, 173, 0.34)";
    context.beginPath();
    context.arc(220, 182, 96, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#16283d";
    context.fillRect(0, height * 0.64, width, height * 0.36);

    context.fillStyle = "#263f31";
    for (let index = 0; index < 18; index += 1) {
      const x = 40 + index * 68;
      const h = 120 + Math.sin(index * 0.8) * 18;
      context.beginPath();
      context.moveTo(x, height * 0.78);
      context.lineTo(x + 24, height * 0.78 - h);
      context.lineTo(x + 50, height * 0.78);
      context.closePath();
      context.fill();
    }

    context.fillStyle = "#f6f2e8";
    context.fillRect(300, 264, 312, 172);
    context.fillStyle = "#7d5539";
    context.fillRect(340, 300, 74, 136);
    context.fillRect(466, 248, 70, 92);

    context.fillStyle = "#f3f6ff";
    context.fillRect(468, 274, 56, 36);
    context.fillStyle = "#98c8ff";
    context.fillRect(472, 278, 48, 28);

    context.fillStyle = "#dcd0b6";
    context.fillRect(756, 214, 208, 228);
    context.fillStyle = "#3b5b44";
    for (let index = 0; index < 6; index += 1) {
      context.fillRect(790 + index * 22, 274 - index * 16, 18, 180);
    }

    context.fillStyle = "rgba(255, 255, 255, 0.14)";
    context.fillRect(54, 70, 280, 46);
    context.fillStyle = "#fff6df";
    context.font = "700 30px 'Trebuchet MS', sans-serif";
    context.fillText("Tonight in the house", 72, 102);

    context.fillStyle = "#d7f1ff";
    context.font = "600 22px 'Trebuchet MS', sans-serif";
    context.fillText("Garden breeze, warm lights, and one chaotic upstairs dance room", 72, 152);
  });
}

function createSkillCardTexture(currentRenderer, skill) {
  return createCanvasTexture(currentRenderer, 420, 560, (context, width, height) => {
    const gradient = context.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#fff9ed");
    gradient.addColorStop(1, skill.tone);
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "rgba(23, 35, 19, 0.26)";
    context.lineWidth = 8;
    context.strokeRect(18, 18, width - 36, height - 36);

    context.fillStyle = "rgba(19, 29, 19, 0.55)";
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.fillText("SKILL", 40, 74);

    context.fillStyle = "#132217";
    context.font = "700 64px Georgia, serif";
    wrapText(context, skill.label, 40, 168, width - 80, 68);

    context.fillStyle = "rgba(19, 29, 19, 0.76)";
    context.font = "600 26px 'Trebuchet MS', sans-serif";
    wrapText(context, skill.category, 40, 408, width - 80, 34);
  });
}

function createProjectNoteTexture(currentRenderer, project) {
  return createCanvasTexture(currentRenderer, 420, 420, (context, width, height) => {
    const colors = ["#fff0b8", "#f5dfb8", "#dbeecf", "#d7e8ff"];
    const background = colors[project.name.length % colors.length];
    context.fillStyle = background;
    context.fillRect(0, 0, width, height);

    context.fillStyle = "rgba(36, 25, 16, 0.68)";
    context.font = "700 24px 'Trebuchet MS', sans-serif";
    context.fillText(project.language.toUpperCase(), 28, 52);

    context.fillStyle = "#26170e";
    context.font = "700 46px Georgia, serif";
    wrapText(context, project.name, 28, 118, width - 56, 52);

    context.fillStyle = "rgba(38, 23, 14, 0.82)";
    context.font = "600 24px 'Trebuchet MS', sans-serif";
    wrapText(context, project.description, 28, 234, width - 56, 32);

    context.fillStyle = "rgba(38, 23, 14, 0.54)";
    context.font = "600 20px 'Trebuchet MS', sans-serif";
    context.fillText("github.com/Luxxgit2k4", 28, height - 34);
  });
}

function createCanvasTexture(currentRenderer, width, height, draw) {
  const canvasElement = document.createElement("canvas");
  canvasElement.width = width;
  canvasElement.height = height;
  const context = canvasElement.getContext("2d");
  draw(context, width, height);

  const texture = new THREE.CanvasTexture(canvasElement);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = currentRenderer.capabilities.getMaxAnisotropy();
  return texture;
}

function wrapText(context, text, x, startY, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let y = startY;

  words.forEach((word) => {
    const nextLine = line ? `${line} ${word}` : word;
    if (context.measureText(nextLine).width > maxWidth && line) {
      context.fillText(line, x, y);
      line = word;
      y += lineHeight;
      return;
    }
    line = nextLine;
  });

  if (line) {
    context.fillText(line, x, y);
  }
}

function updateWorldAnimations(animated, elapsed, delta, progress) {
  animated.grass.forEach((tuft) => {
    tuft.rotation.z = Math.sin(elapsed * 1.9 + tuft.userData.seed) * tuft.userData.amplitude;
    tuft.rotation.x = Math.cos(elapsed * 1.2 + tuft.userData.seed * 0.7) * 0.03;
  });

  animated.flowers.forEach((flower) => {
    flower.rotation.z = Math.sin(elapsed * 1.6 + flower.userData.seed) * flower.userData.amplitude;
    flower.rotation.x = Math.cos(elapsed * 1.05 + flower.userData.seed * 0.8) * 0.04;
  });

  animated.trees.forEach((tree) => {
    tree.rotation.z = Math.sin(elapsed * 0.8 + tree.userData.seed) * 0.03;
    tree.rotation.x = Math.cos(elapsed * 0.6 + tree.userData.seed) * 0.02;
  });

  animated.clouds.forEach((cloud) => {
    cloud.position.x = wrapRange(cloud.userData.baseX + elapsed * cloud.userData.speed * 2.2, -66, 66);
    cloud.position.y = cloud.userData.baseY + Math.sin(elapsed * 0.18 + cloud.userData.seed) * 0.3;
  });

  animated.mixers.forEach((mixer) => {
    mixer.update(delta);
  });

  animated.birds.forEach((bird) => {
    const angle = elapsed * bird.speed + bird.phase;
    bird.model.position.set(
      bird.center.x + Math.cos(angle) * bird.radiusX,
      bird.height + Math.sin(elapsed * 0.9 + bird.phase) * 0.7,
      bird.center.z + Math.sin(angle) * bird.radiusZ
    );
    bird.model.rotation.y = -angle + bird.headingOffset;
    bird.model.rotation.z = Math.sin(elapsed * 1.8 + bird.phase) * 0.08;
  });

  if (animated.windmillRotor) {
    animated.windmillRotor.rotation.z = elapsed * 1.9;
  }

  if (animated.windmillCap) {
    animated.windmillCap.rotation.y = Math.sin(elapsed * 0.24) * 0.08;
  }

  const doorOpen = smoothRange(progress, 0.29, 0.47);
  if (animated.leftDoorPivot && animated.rightDoorPivot) {
    animated.leftDoorPivot.rotation.y = -doorOpen * 1.18;
    animated.rightDoorPivot.rotation.y = doorOpen * 1.18;
  }

  const upperLeftOpen = smoothRange(progress, 0.83, 0.9) * 0.48;
  const upperRightOpen = smoothRange(progress, 0.83, 0.91);
  if (animated.upperLeftDoorPivot) {
    animated.upperLeftDoorPivot.rotation.y = upperLeftOpen;
  }
  if (animated.upperRightDoorPivot) {
    animated.upperRightDoorPivot.rotation.y = -upperRightOpen * 1.22;
  }

  animated.curtainPanels.forEach((curtain) => {
    const baseRotation = curtain.userData.baseRotation;
    curtain.rotation.z = baseRotation + Math.sin(elapsed * 0.9 + curtain.userData.seed) * 0.045;
    curtain.position.x = curtain.userData.baseX + Math.sin(elapsed * 0.5 + curtain.userData.seed) * 0.06;
  });

  animated.people.forEach((person, index) => {
    const sway = Math.sin(elapsed * (person.seated ? 0.84 : 1.02) + person.seed);
    const bob = Math.sin(elapsed * (person.seated ? 1.32 : 1.58) + person.seed * 0.8);
    person.group.position.y = person.baseY + bob * (person.seated ? 0.014 : 0.022);
    person.group.rotation.y = person.baseRotationY + Math.sin(elapsed * 0.38 + person.seed) * (person.seated ? 0.02 : 0.06);
    person.head.rotation.y = Math.sin(elapsed * 0.56 + person.seed) * 0.12;
    person.head.rotation.z = Math.cos(elapsed * 0.72 + person.seed) * 0.03;

    if (person.activity === "art") {
      person.torso.rotation.z = -0.08 + sway * 0.04;
      person.leftArmPivot.rotation.z = 0.12 + sway * 0.06;
      person.rightArmPivot.rotation.z = -0.12 - sway * 0.04;
      return;
    }

    person.torso.rotation.z = 0.08 + sway * 0.02;
    person.leftArmPivot.rotation.z = 0.5 + sway * 0.04;
    person.rightArmPivot.rotation.z = -0.32 - sway * 0.05;
    person.head.rotation.y = -0.22 + Math.sin(elapsed * 0.42 + index) * 0.05;
  });

  animated.tvScreens.forEach((screen, index) => {
    screen.material.emissiveIntensity =
      0.74 +
      Math.sin(elapsed * 11.4 + index * 0.8) * 0.08 +
      Math.sin(elapsed * 24.2 + index * 1.6) * 0.04;
    screen.material.color.setHSL(0.56 + Math.sin(elapsed * 0.9 + index) * 0.03, 0.48, 0.64);
  });

  if (animated.dancingCharacter) {
    const reveal = smoothRange(progress, 0.84, 0.94);
    animated.dancingCharacter.model.position.y = animated.dancingCharacter.baseY + Math.sin(elapsed * 4.6) * 0.04 * reveal;
    animated.dancingCharacter.model.rotation.y =
      animated.dancingCharacter.baseRotationY + Math.sin(elapsed * 1.8) * 0.12 * reveal;
  }

  if (animated.dancingSpotlight) {
    const danceEnergy = smoothPulse(progress, 0.84, 0.95, 0.03);
    animated.dancingSpotlight.intensity = danceEnergy * (7.8 + Math.sin(elapsed * 6.2) * 2.1);
    animated.dancingSpotlight.color.setHSL(0.02 + Math.sin(elapsed * 0.9) * 0.08, 0.78, 0.62);
  }

  animated.lanterns.forEach((lantern, index) => {
    lantern.material.emissiveIntensity = 0.62 + Math.sin(elapsed * 2.1 + index) * 0.08;
  });
}

function sampleCameraTrack(track, progress, outPosition, outLook) {
  if (progress <= track[0].at) {
    outPosition.copy(track[0].position);
    outLook.copy(track[0].look);
    return;
  }

  for (let index = 1; index < track.length; index += 1) {
    const previous = track[index - 1];
    const next = track[index];
    if (progress <= next.at) {
      const t = smoothstep(clamp01((progress - previous.at) / (next.at - previous.at)));
      outPosition.lerpVectors(previous.position, next.position, t);
      outLook.lerpVectors(previous.look, next.look, t);
      return;
    }
  }

  outPosition.copy(track[track.length - 1].position);
  outLook.copy(track[track.length - 1].look);
}

function pickGardenPosition() {
  let x = 0;
  let z = 0;
  let attempts = 0;

  do {
    x = randomRange(-34, 34);
    z = randomRange(-24, 58);
    attempts += 1;
  } while (
    attempts < 80 &&
    ((Math.abs(x) < 5.3 && z > 6 && z < 58) ||
      (Math.abs(x) < 11.6 && z > -9 && z < 12) ||
      (x > 8 && x < 20 && z < -10 && z > -26))
  );

  return { x, z };
}

function createSeededRandom(seed) {
  let value = seed * 1009;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function randomRange(min, max) {
  return min + Math.random() * (max - min);
}

function clamp01(value) {
  return THREE.MathUtils.clamp(value, 0, 1);
}

function smoothstep(value) {
  return value * value * (3 - 2 * value);
}

function smoothRange(value, start, end) {
  return smoothstep(clamp01((value - start) / (end - start)));
}

function smoothPulse(value, start, end, feather = 0.06) {
  return smoothRange(value, start - feather, start) * (1 - smoothRange(value, end, end + feather));
}

function wrapRange(value, min, max) {
  const size = max - min;
  return ((((value - min) % size) + size) % size) + min;
}

function createCurtainPanel(position, width, height, direction = 1) {
  const material = new THREE.MeshStandardMaterial({
    color: 0xf3e4d6,
    roughness: 0.96,
    side: THREE.DoubleSide
  });
  const curtain = new THREE.Mesh(new THREE.PlaneGeometry(width, height, 12, 18), material);
  curtain.position.set(...position);
  curtain.rotation.y = Math.PI;
  curtain.rotation.z = direction * 0.08;
  curtain.castShadow = false;
  curtain.receiveShadow = false;
  curtain.userData.baseX = position[0];
  curtain.userData.baseRotation = curtain.rotation.z;
  curtain.userData.seed = Math.random() * Math.PI * 2;
  return curtain;
}

function buildFallbackProfileSceneData() {
  return {
    name: portfolioData.name,
    headline: portfolioData.bio,
    aboutItems: portfolioData.focus.slice(0, 4),
    links: Object.entries(portfolioData.links).map(([label, url]) => ({
      label: label === "devto" ? "Dev.to" : label[0].toUpperCase() + label.slice(1),
      url
    })),
    stats: {
      repos: portfolioData.stats.publicRepos,
      followers: portfolioData.stats.followers,
      following: portfolioData.stats.following,
      topLanguage: portfolioData.stack[0]?.label ?? "JavaScript",
      updatedAt: "Live on load"
    },
    topRepos: portfolioData.highlights.map((repo) => ({
      name: repo.name,
      language: repo.language,
      stars: 0,
      description: repo.description
    })),
    repoCards: [
      { label: "Public repos", value: `${portfolioData.stats.publicRepos}` },
      { label: "Followers", value: `${portfolioData.stats.followers}` },
      { label: "Following", value: `${portfolioData.stats.following}` },
      { label: "Top stack", value: portfolioData.stack[0]?.label ?? "JavaScript" }
    ]
  };
}

async function loadLiveGitHubSceneData() {
  const [readmeResponse, userResponse, reposResponse] = await Promise.all([
    fetch("https://raw.githubusercontent.com/Luxxgit2k4/Luxxgit2k4/main/README.md"),
    fetch("https://api.github.com/users/Luxxgit2k4"),
    fetch("https://api.github.com/users/Luxxgit2k4/repos?per_page=100&sort=updated")
  ]);

  if (!readmeResponse.ok || !userResponse.ok || !reposResponse.ok) {
    throw new Error("GitHub sync failed");
  }

  const [readmeText, user, repos] = await Promise.all([
    readmeResponse.text(),
    userResponse.json(),
    reposResponse.json()
  ]);

  return parseGitHubSceneData(readmeText, user, repos);
}

function parseGitHubSceneData(readmeText, user, repos) {
  const lines = readmeText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const headingLine = lines.find((line) => /^#{1,6}\s/.test(line));
  const nameMatch = headingLine?.match(/I'?m\s+(.+)/i);
  const headline = lines.find(
    (line) =>
      !/^#{1,6}\s/.test(line) &&
      !line.startsWith("- ") &&
      !line.startsWith("<") &&
      !/^Connect with me/i.test(line) &&
      !/^###/.test(line)
  );

  const aboutItems = lines
    .filter((line) => line.startsWith("- "))
    .map((line) => stripMarkdown(line.slice(2)))
    .slice(0, 5);

  const links = extractReadmeLinks(readmeText).slice(0, 5);
  const topRepos = [...repos]
    .filter((repo) => !repo.fork)
    .sort((left, right) => {
      if (right.stargazers_count !== left.stargazers_count) {
        return right.stargazers_count - left.stargazers_count;
      }
      return new Date(right.updated_at) - new Date(left.updated_at);
    })
    .slice(0, 5)
    .map((repo) => ({
      name: repo.name,
      language: repo.language ?? "n/a",
      stars: repo.stargazers_count,
      description: repo.description ?? "No description yet"
    }));

  const languageSummary = Object.entries(
    repos.reduce((accumulator, repo) => {
      if (!repo.fork && repo.language) {
        accumulator[repo.language] = (accumulator[repo.language] ?? 0) + 1;
      }
      return accumulator;
    }, {})
  ).sort((left, right) => right[1] - left[1]);

  return {
    name: nameMatch?.[1]?.trim() ?? user.name ?? portfolioData.name,
    headline: stripMarkdown(headline ?? user.bio ?? portfolioData.bio),
    aboutItems,
    links,
    stats: {
      repos: user.public_repos,
      followers: user.followers,
      following: user.following,
      topLanguage: languageSummary[0]?.[0] ?? "JavaScript",
      updatedAt: formatDate(user.updated_at)
    },
    topRepos,
    repoCards: [
      { label: "Public repos", value: `${user.public_repos}` },
      { label: "Followers", value: `${user.followers}` },
      { label: "Following", value: `${user.following}` },
      { label: "Top language", value: languageSummary[0]?.[0] ?? "JavaScript" }
    ]
  };
}

function extractReadmeLinks(readmeText) {
  const links = [];
  const matches = readmeText.matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g);

  for (const match of matches) {
    const [, url, innerHtml] = match;
    const messageMatch = innerHtml.match(/message=([^&"]+)/i);
    const altMatch = innerHtml.match(/alt="([^"]+)"/i);
    const rawLabel = messageMatch?.[1]
      ? decodeURIComponent(messageMatch[1].replace(/\+/g, " "))
      : altMatch?.[1] ?? "Link";

    links.push({
      label: rawLabel.replace(/\s*logo$/i, ""),
      url
    });
  }

  return links;
}

function applyProfileSceneContent(currentRenderer, panels, sceneData) {
  if (!panels.leftOverviewPanel) {
    return;
  }

  updatePanelTexture(panels.leftOverviewPanel, createRepoOverviewTexture(currentRenderer, sceneData));
  updatePanelTexture(panels.leftTopReposPanel, createTopReposTexture(currentRenderer, sceneData));
  updatePanelTexture(panels.leftStatsPanel, createRepoCardsTexture(currentRenderer, sceneData));
  updatePanelTexture(panels.rightAboutPanel, createAboutPanelTexture(currentRenderer, sceneData));
  updatePanelTexture(panels.rightLinksPanel, createLinksPanelTexture(currentRenderer, sceneData));
  updatePanelTexture(panels.rightFocusPanel, createFocusPanelTexture(currentRenderer, sceneData));
}

function updatePanelTexture(panelMesh, texture) {
  panelMesh.material.map = texture;
  panelMesh.material.needsUpdate = true;
}

function createPlaceholderBoardTexture(currentRenderer, title, lines) {
  return createCanvasTexture(currentRenderer, 960, 620, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#f4ecdd", "#dbe9d6");
    context.fillStyle = "#7a5a36";
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.fillText("SYNCING", 46, 74);
    context.fillStyle = "#17261a";
    context.font = "700 58px Georgia, serif";
    wrapText(context, title, 46, 158, width - 92, 62);
    context.fillStyle = "rgba(23, 38, 26, 0.78)";
    context.font = "600 28px 'Trebuchet MS', sans-serif";
    lines.forEach((line, index) => {
      wrapText(context, line, 46, 278 + index * 66, width - 92, 34);
    });
  });
}

function createRepoOverviewTexture(currentRenderer, sceneData) {
  return createCanvasTexture(currentRenderer, 960, 540, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#f3eadb", "#e2f0de");
    context.fillStyle = "#7a5a36";
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.fillText("LEFT ROOM · OVERVIEW", 40, 70);
    context.fillStyle = "#16251a";
    context.font = "700 60px Georgia, serif";
    wrapText(context, sceneData.name, 40, 148, width - 80, 60);
    context.fillStyle = "rgba(22, 37, 26, 0.8)";
    context.font = "600 28px 'Trebuchet MS', sans-serif";
    wrapText(context, sceneData.headline, 40, 222, width - 80, 36);

    [
      [`${sceneData.stats.repos}`, "Public repos"],
      [`${sceneData.stats.followers}`, "Followers"],
      [sceneData.stats.topLanguage, "Top language"]
    ].forEach(([value, label], index) => {
      const x = 40 + index * 286;
      context.fillStyle = "rgba(22, 37, 26, 0.08)";
      context.fillRect(x, 320, 250, 148);
      context.fillStyle = "#1e2a1e";
      context.font = "700 52px Georgia, serif";
      context.fillText(value, x + 20, 392);
      context.fillStyle = "rgba(22, 37, 26, 0.72)";
      context.font = "600 24px 'Trebuchet MS', sans-serif";
      context.fillText(label, x + 20, 430);
    });
  });
}

function createTopReposTexture(currentRenderer, sceneData) {
  return createCanvasTexture(currentRenderer, 960, 760, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#1d2738", "#243b34");
    context.fillStyle = "#ffe9b5";
    context.font = "700 30px 'Trebuchet MS', sans-serif";
    context.fillText("TOP REPOSITORIES", 42, 70);

    context.font = "700 26px 'Trebuchet MS', sans-serif";
    sceneData.topRepos.slice(0, 5).forEach((repo, index) => {
      const y = 142 + index * 118;
      context.fillStyle = "rgba(255, 255, 255, 0.08)";
      context.fillRect(38, y - 44, width - 76, 88);
      context.fillStyle = "#fff5df";
      context.fillText(repo.name, 60, y);
      context.fillStyle = "#b7d8c7";
      context.font = "600 22px 'Trebuchet MS', sans-serif";
      context.fillText(`${repo.language} · ${repo.stars} stars`, 60, y + 30);
      wrapText(context, repo.description, 420, y - 2, width - 470, 28);
      context.font = "700 26px 'Trebuchet MS', sans-serif";
    });
  });
}

function createRepoCardsTexture(currentRenderer, sceneData) {
  return createCanvasTexture(currentRenderer, 960, 540, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#efe4d4", "#dde9f5");
    context.fillStyle = "#7a5a36";
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.fillText("STAT CARDS", 40, 70);

    sceneData.repoCards.forEach((card, index) => {
      const x = 40 + (index % 2) * 438;
      const y = 134 + Math.floor(index / 2) * 162;
      context.fillStyle = "rgba(20, 30, 22, 0.08)";
      context.fillRect(x, y, 400, 126);
      context.fillStyle = "#1a2a1b";
      context.font = "700 50px Georgia, serif";
      wrapText(context, card.value, x + 22, y + 58, 356, 52);
      context.fillStyle = "rgba(26, 42, 27, 0.72)";
      context.font = "600 24px 'Trebuchet MS', sans-serif";
      context.fillText(card.label, x + 22, y + 98);
    });
  });
}

function createAboutPanelTexture(currentRenderer, sceneData) {
  return createCanvasTexture(currentRenderer, 1080, 720, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#f4ede1", "#dce9da");
    context.fillStyle = "#7a5a36";
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.fillText("RIGHT ROOM · ABOUT", 44, 74);
    context.fillStyle = "#16251a";
    context.font = "700 58px Georgia, serif";
    wrapText(context, sceneData.name, 44, 154, width - 88, 58);
    context.fillStyle = "rgba(22, 37, 26, 0.82)";
    context.font = "600 28px 'Trebuchet MS', sans-serif";
    wrapText(context, sceneData.headline, 44, 226, width - 88, 36);

    context.font = "600 24px 'Trebuchet MS', sans-serif";
    sceneData.aboutItems.slice(0, 4).forEach((item, index) => {
      context.fillStyle = "rgba(22, 37, 26, 0.08)";
      context.fillRect(44, 320 + index * 82, width - 88, 58);
      context.fillStyle = "#223023";
      wrapText(context, item, 64, 358 + index * 82, width - 128, 28);
    });
  });
}

function createLinksPanelTexture(currentRenderer, sceneData) {
  return createCanvasTexture(currentRenderer, 720, 940, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#142032", "#1d3d34");
    context.fillStyle = "#ffe7b8";
    context.font = "700 28px 'Trebuchet MS', sans-serif";
    context.fillText("CONNECT", 40, 70);

    context.font = "700 26px 'Trebuchet MS', sans-serif";
    sceneData.links.slice(0, 5).forEach((link, index) => {
      const y = 150 + index * 150;
      context.fillStyle = "rgba(255, 255, 255, 0.08)";
      context.fillRect(36, y - 44, width - 72, 104);
      context.fillStyle = "#fff6df";
      context.fillText(link.label, 58, y);
      context.fillStyle = "#b5d6c6";
      context.font = "600 18px 'Trebuchet MS', sans-serif";
      wrapText(context, link.url.replace(/^https?:\/\//, ""), 58, y + 34, width - 116, 24);
      context.font = "700 26px 'Trebuchet MS', sans-serif";
    });
  });
}

function createFocusPanelTexture(currentRenderer, sceneData) {
  return createCanvasTexture(currentRenderer, 760, 420, (context, width, height) => {
    drawRoomPanelBackground(context, width, height, "#f5e7da", "#ecf4da");
    context.fillStyle = "#7a5a36";
    context.font = "700 24px 'Trebuchet MS', sans-serif";
    context.fillText("WINDOW NOTES", 34, 60);
    context.fillStyle = "#1a2a1b";
    context.font = "700 46px Georgia, serif";
    context.fillText("Updated", 34, 128);
    context.fillStyle = "rgba(26, 42, 27, 0.8)";
    context.font = "600 24px 'Trebuchet MS', sans-serif";
    context.fillText(sceneData.stats.updatedAt, 34, 172);
    wrapText(
      context,
      sceneData.aboutItems.slice(0, 2).join(" · "),
      34,
      246,
      width - 68,
      30
    );
  });
}

function drawRoomPanelBackground(context, width, height, startColor, endColor) {
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, startColor);
  gradient.addColorStop(1, endColor);
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.strokeStyle = "rgba(32, 42, 28, 0.18)";
  context.lineWidth = 10;
  context.strokeRect(14, 14, width - 28, height - 28);
}

function stripMarkdown(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value) {
  if (!value) {
    return "Recently updated";
  }

  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function loadBirdAssets(targetScene, animated, loader) {
  const birdAssets = [
    {
      path: "/models/Parrot.glb",
      count: 2,
      scale: 0.03,
      center: new THREE.Vector3(-6, 18.5, 4),
      radiusX: 18,
      radiusZ: 10,
      speed: 0.38,
      headingOffset: Math.PI * 0.5
    },
    {
      path: "/models/Stork.glb",
      count: 1,
      scale: 0.034,
      center: new THREE.Vector3(8, 22, -4),
      radiusX: 24,
      radiusZ: 14,
      speed: 0.24,
      headingOffset: Math.PI * 0.5
    }
  ];

  birdAssets.forEach((asset) => {
    loader.load(asset.path, (gltf) => {
      for (let index = 0; index < asset.count; index += 1) {
        const model = cloneSkeleton(gltf.scene);
        model.scale.setScalar(asset.scale);
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = false;
            child.receiveShadow = false;
          }
        });

        const mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

        const phase = index * Math.PI * 0.8 + Math.random() * 0.4;
        const bird = {
          model,
          center: asset.center.clone().add(new THREE.Vector3(0, index * 1.2, index * 2.4)),
          radiusX: asset.radiusX + index * 4,
          radiusZ: asset.radiusZ + index * 2.4,
          height: asset.center.y + index * 1.1,
          speed: asset.speed + index * 0.08,
          phase,
          headingOffset: asset.headingOffset
        };

        targetScene.add(model);
        animated.mixers.push(mixer);
        animated.birds.push(bird);
      }
    });
  });

  loader.load("/models/RobotExpressive.glb", (gltf) => {
    const model = cloneSkeleton(gltf.scene);
    model.scale.setScalar(0.64);
    model.position.set(5.28, 5.58, 2.56);
    model.rotation.y = -Math.PI * 0.82;
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const mixer = new THREE.AnimationMixer(model);
    const danceClip = gltf.animations.find((clip) => /dance/i.test(clip.name)) ?? gltf.animations[0];
    if (danceClip) {
      const action = mixer.clipAction(danceClip);
      action.timeScale = 0.95;
      action.play();
    }

    animated.mixers.push(mixer);
    animated.dancingCharacter = {
      model,
      baseY: model.position.y,
      baseRotationY: model.rotation.y
    };
    targetScene.add(model);
  });
}

function createAmbientSoundController(button) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  let context;
  let masterGain;
  let enabled = false;
  let channels;
  let lastStairStep = -1;
  let available = Boolean(AudioContextClass);

  function updateButtonLabel() {
    if (!available) {
      button.textContent = "Sound unavailable";
      button.setAttribute("aria-pressed", "false");
      button.disabled = true;
      return;
    }

    button.disabled = false;
    button.textContent = enabled ? "Sound on" : "Sound off";
    button.setAttribute("aria-pressed", String(enabled));
  }

  function createNoiseSource(noiseBuffer) {
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    return source;
  }

  function setGain(gainNode, value, ramp = 0.18) {
    const now = context.currentTime;
    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.linearRampToValueAtTime(value, now + ramp);
  }

  function triggerWelcomeChime() {
    if (!context || !masterGain) {
      return;
    }

    const now = context.currentTime + 0.02;
    [
      [392, 0],
      [523.25, 0.06],
      [659.25, 0.12]
    ].forEach(([frequency, delay], index) => {
      const osc = context.createOscillator();
      osc.type = index === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(frequency, now + delay);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.58, now + delay + 0.42);

      const gain = context.createGain();
      gain.gain.setValueAtTime(0.0001, now + delay);
      gain.gain.linearRampToValueAtTime(0.026, now + delay + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + delay + 0.48);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now + delay);
      osc.stop(now + delay + 0.52);
    });
  }

  function triggerStairStep(level) {
    const now = context.currentTime;
    const thump = context.createOscillator();
    thump.type = "triangle";
    thump.frequency.setValueAtTime(92, now);
    thump.frequency.exponentialRampToValueAtTime(56, now + 0.12);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 180;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(level, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    thump.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);
    thump.start(now);
    thump.stop(now + 0.24);
  }

  function buildSoundscape() {
    if (!AudioContextClass) {
      available = false;
      updateButtonLabel();
      return false;
    }

    context = new AudioContextClass();
    const compressor = context.createDynamicsCompressor();
    compressor.threshold.value = -22;
    compressor.knee.value = 18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.22;

    masterGain = context.createGain();
    masterGain.gain.value = 0.0001;
    masterGain.connect(compressor);
    compressor.connect(context.destination);

    const noiseBuffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    let last = 0;
    for (let index = 0; index < data.length; index += 1) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[index] = last * 3.3;
    }

    const windSource = createNoiseSource(noiseBuffer);
    const highPass = context.createBiquadFilter();
    highPass.type = "highpass";
    highPass.frequency.value = 170;

    const lowPass = context.createBiquadFilter();
    lowPass.type = "lowpass";
    lowPass.frequency.value = 960;
    const windGain = context.createGain();
    windGain.gain.value = 0.0001;

    const lfo = context.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.08;
    const lfoGain = context.createGain();
    lfoGain.gain.value = 220;

    lfo.connect(lfoGain);
    lfoGain.connect(lowPass.frequency);

    windSource.connect(highPass);
    highPass.connect(lowPass);
    lowPass.connect(windGain);
    windGain.connect(masterGain);

    const leafSource = createNoiseSource(noiseBuffer);
    const leafBand = context.createBiquadFilter();
    leafBand.type = "bandpass";
    leafBand.frequency.value = 920;
    leafBand.Q.value = 0.7;
    const leafGain = context.createGain();
    leafGain.gain.value = 0.0001;
    leafSource.connect(leafBand);
    leafBand.connect(leafGain);
    leafGain.connect(masterGain);

    const roomOscillator = context.createOscillator();
    roomOscillator.type = "triangle";
    roomOscillator.frequency.value = 114;
    const roomSub = context.createOscillator();
    roomSub.type = "sine";
    roomSub.frequency.value = 72;
    const roomFilter = context.createBiquadFilter();
    roomFilter.type = "lowpass";
    roomFilter.frequency.value = 220;
    const roomGain = context.createGain();
    roomGain.gain.value = 0.0001;

    const roomLfo = context.createOscillator();
    roomLfo.frequency.value = 0.06;
    const roomLfoGain = context.createGain();
    roomLfoGain.gain.value = 8;
    roomLfo.connect(roomLfoGain);
    roomLfoGain.connect(roomFilter.frequency);

    roomOscillator.connect(roomFilter);
    roomSub.connect(roomFilter);
    roomFilter.connect(roomGain);
    roomGain.connect(masterGain);

    const tvSource = createNoiseSource(noiseBuffer);
    const tvBand = context.createBiquadFilter();
    tvBand.type = "bandpass";
    tvBand.frequency.value = 1280;
    tvBand.Q.value = 0.8;
    const tvBuzz = context.createOscillator();
    tvBuzz.type = "sawtooth";
    tvBuzz.frequency.value = 58;
    const tvBuzzGain = context.createGain();
    tvBuzzGain.gain.value = 0.004;
    const tvGain = context.createGain();
    tvGain.gain.value = 0.0001;
    tvSource.connect(tvBand);
    tvBand.connect(tvGain);
    tvBuzz.connect(tvBuzzGain);
    tvBuzzGain.connect(tvGain);
    tvGain.connect(masterGain);

    const danceOscillator = context.createOscillator();
    danceOscillator.type = "square";
    danceOscillator.frequency.value = 92;
    const danceFilter = context.createBiquadFilter();
    danceFilter.type = "lowpass";
    danceFilter.frequency.value = 360;
    const danceGain = context.createGain();
    danceGain.gain.value = 0.0001;
    const dancePulse = context.createOscillator();
    dancePulse.frequency.value = 2.2;
    const dancePulseGain = context.createGain();
    dancePulseGain.gain.value = 0.018;
    dancePulse.connect(dancePulseGain);
    dancePulseGain.connect(danceGain.gain);
    danceOscillator.connect(danceFilter);
    danceFilter.connect(danceGain);
    danceGain.connect(masterGain);

    const gardenTone = context.createOscillator();
    gardenTone.type = "triangle";
    gardenTone.frequency.value = 740;
    const gardenToneGain = context.createGain();
    gardenToneGain.gain.value = 0.0001;
    const gardenFlutter = context.createOscillator();
    gardenFlutter.frequency.value = 0.24;
    const gardenFlutterGain = context.createGain();
    gardenFlutterGain.gain.value = 0.003;
    gardenFlutter.connect(gardenFlutterGain);
    gardenFlutterGain.connect(gardenToneGain.gain);
    gardenTone.connect(gardenToneGain);
    gardenToneGain.connect(masterGain);

    const birdOscillator = context.createOscillator();
    birdOscillator.type = "sine";
    birdOscillator.frequency.value = 1320;
    const birdLfo = context.createOscillator();
    birdLfo.frequency.value = 0.34;
    const birdLfoGain = context.createGain();
    birdLfoGain.gain.value = 260;
    birdLfo.connect(birdLfoGain);
    birdLfoGain.connect(birdOscillator.frequency);
    const birdGain = context.createGain();
    birdGain.gain.value = 0.0001;
    const birdPulse = context.createOscillator();
    birdPulse.frequency.value = 0.56;
    const birdPulseGain = context.createGain();
    birdPulseGain.gain.value = 0.004;
    birdPulse.connect(birdPulseGain);
    birdPulseGain.connect(birdGain.gain);
    birdOscillator.connect(birdGain);
    birdGain.connect(masterGain);

    windSource.start();
    leafSource.start();
    lfo.start();
    roomOscillator.start();
    roomSub.start();
    roomLfo.start();
    tvSource.start();
    tvBuzz.start();
    danceOscillator.start();
    dancePulse.start();
    gardenTone.start();
    gardenFlutter.start();
    birdOscillator.start();
    birdLfo.start();
    birdPulse.start();

    channels = {
      windGain,
      leafGain,
      roomGain,
      tvGain,
      danceGain,
      gardenToneGain,
      birdGain
    };

    return true;
  }

  async function ensureContext() {
    if (!context) {
      const built = buildSoundscape();
      if (built === false) {
        return false;
      }
    }
    if (context.state === "suspended") {
      await context.resume();
    }
    return true;
  }

  async function setEnabled(nextValue) {
    const ready = await ensureContext();
    if (!ready) {
      return;
    }

    enabled = nextValue;
    const now = context.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(enabled ? 0.16 : 0.0001, now + 0.8);
    if (enabled) {
      triggerWelcomeChime();
    }
    updateButtonLabel();
  }

  updateButtonLabel();

  return {
    enable: async () => setEnabled(true),
    toggle: async () => setEnabled(!enabled),
    update: (progress) => {
      if (!context || !channels || !enabled) {
        if (!enabled) {
          lastStairStep = -1;
        }
        return;
      }

      const outdoor = Math.max(1 - smoothRange(progress, 0.34, 0.48), smoothRange(progress, 0.95, 1.0));
      const living = smoothPulse(progress, 0.52, 0.66, 0.04);
      const indoorBed = smoothPulse(progress, 0.38, 0.95, 0.08);
      const dance = smoothPulse(progress, 0.84, 0.95, 0.03);
      const stairZone = smoothPulse(progress, 0.64, 0.83, 0.03);
      const terrace = smoothRange(progress, 0.95, 1.0);

      setGain(channels.windGain, 0.02 + outdoor * 0.11 + dance * 0.01, 0.22);
      setGain(channels.leafGain, outdoor * 0.04 + terrace * 0.02, 0.22);
      setGain(channels.roomGain, 0.012 + indoorBed * 0.05, 0.22);
      setGain(channels.tvGain, living * 0.05, 0.16);
      setGain(channels.danceGain, dance * 0.082, 0.12);
      setGain(channels.gardenToneGain, outdoor * 0.004 + terrace * 0.006, 0.22);
      setGain(channels.birdGain, outdoor * 0.006 + terrace * 0.009, 0.24);

      if (stairZone > 0.12) {
        const stepIndex = Math.floor(clamp01((progress - 0.64) / 0.19) * 11.999);
        if (stepIndex !== lastStairStep) {
          triggerStairStep(0.026 + stairZone * 0.02);
          lastStairStep = stepIndex;
        }
      } else {
        lastStairStep = -1;
      }
    }
  };
}
