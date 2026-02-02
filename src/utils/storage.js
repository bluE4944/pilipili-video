const STORAGE_PREFIX = 'pilipili';

export function loadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}:${key}`);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.warn('[storage] load failed', err);
    return fallback;
  }
}

export function saveStorage(key, value) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}:${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn('[storage] save failed', err);
  }
}

export function removeStorage(key) {
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}:${key}`);
  } catch (err) {
    console.warn('[storage] remove failed', err);
  }
}

export function uid(prefix = 'id') {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}
