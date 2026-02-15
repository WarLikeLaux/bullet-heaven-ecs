import {
  TextureLoader,
  NearestFilter,
  ClampToEdgeWrapping,
  Texture,
  SRGBColorSpace,
} from 'three';

const loader = new TextureLoader();

export function loadTexture(path: string): Promise<Texture> {
  const url = import.meta.env.BASE_URL + path;

  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.magFilter = NearestFilter;
        texture.minFilter = NearestFilter;
        texture.wrapS = ClampToEdgeWrapping;
        texture.wrapT = ClampToEdgeWrapping;
        texture.colorSpace = SRGBColorSpace;
        resolve(texture);
      },
      undefined,
      reject
    );
  });
}

export function preloadAll(paths: string[]): Promise<Texture[]> {
  return Promise.all(paths.map(loadTexture));
}
