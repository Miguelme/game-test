const KEY = "mg.v1";

function readJson(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

const defaultSettings = {
  textScale: 1,
  sound: true,
  reduceMotion: false,
};

export const storage = {
  getSettings() {
    const v = readJson(`${KEY}.settings`, defaultSettings);
    return {
      ...defaultSettings,
      ...v,
      textScale: clampNumber(v?.textScale ?? defaultSettings.textScale, 0.95, 1.25),
      sound: Boolean(v?.sound ?? defaultSettings.sound),
      reduceMotion: Boolean(v?.reduceMotion ?? defaultSettings.reduceMotion),
    };
  },
  setSettings(next) {
    writeJson(`${KEY}.settings`, next);
  },
  getProgress(gameId) {
    return readJson(`${KEY}.progress.${gameId}`, {});
  },
  setProgress(gameId, progress) {
    writeJson(`${KEY}.progress.${gameId}`, progress);
  },
};

function clampNumber(v, min, max) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}
