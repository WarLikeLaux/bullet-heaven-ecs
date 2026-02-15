import {
  TextureLoader,
  NearestFilter,
  ClampToEdgeWrapping,
  Texture,
  SRGBColorSpace,
} from 'three';

const loader = new TextureLoader();
let debugEl: HTMLElement | null = null;

function getDebugEl(): HTMLElement {
  if (!debugEl) {
    debugEl = document.createElement('pre');
    debugEl.style.cssText =
      'position:fixed;bottom:0;left:0;right:0;z-index:99999;' +
      'background:rgba(0,0,0,0.85);color:#0f0;padding:1rem;' +
      'font:11px monospace;max-height:40vh;overflow:auto;pointer-events:none';
    document.body.appendChild(debugEl);
  }
  return debugEl;
}

function debugLog(msg: string) {
  const el = getDebugEl();
  el.textContent = (el.textContent ?? '') + msg + '\n';
  el.scrollTop = el.scrollHeight;
}

export function loadTexture(path: string): Promise<Texture> {
  const url = import.meta.env.BASE_URL + path;
  debugLog(`[load] ${url}`);

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.colorSpace = SRGBColorSpace;
        debugLog(`[ok]   ${path}`);
        resolve(texture);
      },
      undefined,
      (err) => {
        debugLog(`[FAIL] ${path} — ${err}`);
        reject(err);
      }
    );
  });
}

export function preloadAll(paths: string[]): Promise<Texture[]> {
  debugLog(`preloadAll: ${paths.length} textures`);
  return Promise.all(paths.map(loadTexture));
}
