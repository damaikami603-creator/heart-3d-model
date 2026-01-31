const container = document.getElementById("canvas-container");

// Scene
const scene = new THREE.Scene();

// Camera
const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  10000
);

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("heartCanvas"),
  antialias: true,
  alpha: true
});
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xff5555, 1.5);
directionalLight.position.set(3, 4, 5);
scene.add(directionalLight);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.5;
controls.zoomSpeed = 0.7;
controls.enablePan = false;

// Load heart GLB
const loader = new THREE.GLTFLoader();
let heartModel;
let baseScale = 0;

loader.load("./heart.glb", (gltf) => {
  heartModel = gltf.scene;
  scene.add(heartModel);

  // Center the model
  const box = new THREE.Box3().setFromObject(heartModel);
  const center = box.getCenter(new THREE.Vector3());
  heartModel.position.sub(center);

  // Use full scale (1.0) as the animation does
  heartModel.scale.setScalar(1);

  // Calculate camera distance for the FULL-SIZED heart
  const sphere = new THREE.Sphere();
  box.getBoundingSphere(sphere);
  const radius = sphere.radius;

  // Position camera to be prominent but not too big (0.9x margin)
  const fov = camera.fov * (Math.PI / 180);
  const distance = (radius / Math.sin(fov / 2)) * 0.9;
  camera.position.set(0, 0, distance);
  camera.lookAt(0, 0, 0);

  controls.target.set(0, 0, 0);
  controls.update();

  // render immediately to prevent visibility issues
  renderer.render(scene, camera);
});

// Animate
function animate(time) {
  requestAnimationFrame(animate);

  if (heartModel) {
    // 80 BPM = 80 beats / 60,000 ms
    // Frequency = 80/60000. Rotation/Omega = Frequency * 2 * PI
    const bpm = 80;
    const omega = (bpm * 2 * Math.PI) / 60000;
    const beat = Math.sin(time * omega) * 0.015;
    heartModel.scale.setScalar(1 + beat);
  }

  controls.update();
  renderer.render(scene, camera);
}
animate(0);

// Responsive
window.addEventListener("resize", () => {
  if (container.clientWidth > 0) {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }
});

