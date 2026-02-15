import { LOADING_FADE_MS } from '@/config';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function hideLoadingScreen(): Promise<void> {
  const el = document.getElementById('loading-screen');
  if (!el) return;

  el.classList.add('hidden');
  await delay(LOADING_FADE_MS);
  el.remove();
}
