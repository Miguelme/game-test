export function createAudio(getSettings) {
  let ctx;

  function ensure() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone({ freq = 440, durationMs = 120, type = "sine", gain = 0.035 }) {
    if (!getSettings().sound) return;
    const c = ensure();
    const o = c.createOscillator();
    const g = c.createGain();

    o.type = type;
    o.frequency.value = freq;

    const now = c.currentTime;
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + 0.01);
    g.gain.linearRampToValueAtTime(0.0001, now + durationMs / 1000);

    o.connect(g);
    g.connect(c.destination);

    o.start(now);
    o.stop(now + durationMs / 1000 + 0.02);
  }

  return {
    ok() {
      tone({ freq: 523.25, durationMs: 120, gain: 0.04 });
    },
    softOk() {
      tone({ freq: 440, durationMs: 100, gain: 0.03 });
    },
    warm() {
      tone({ freq: 392.0, durationMs: 160, gain: 0.03 });
    },
    gentleNo() {
      tone({ freq: 220, durationMs: 170, gain: 0.03, type: "triangle" });
    },
    note(freq) {
      tone({ freq, durationMs: 160, gain: 0.03 });
    },
  };
}
