import { Scene, OrthographicCamera, WebGLRenderer, Color } from 'three';

const BG_COLOR = 0x1a1a2e;

export function createRenderer() {
  const renderer = new WebGLRenderer({ antialias: false });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  return renderer;
}

export function createCamera(zoom: number) {
  const aspect = window.innerWidth / window.innerHeight;

  const camera = new OrthographicCamera(
    -aspect * zoom,
    aspect * zoom,
    zoom,
    -zoom,
    0.1,
    100
  );
  camera.position.z = 10;
  return camera;
}

export function createScene() {
  const scene = new Scene();
  scene.background = new Color(BG_COLOR);
  return scene;
}

export function bindResize(
  camera: OrthographicCamera,
  renderer: WebGLRenderer,
  zoom: number
) {
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const a = w / h;

    camera.left = -a * zoom;
    camera.right = a * zoom;
    camera.top = zoom;
    camera.bottom = -zoom;
    camera.updateProjectionMatrix();

    renderer.setSize(w, h);
  }

  window.addEventListener('resize', onResize);
}
