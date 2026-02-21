import { el, sleep } from "../ui/dom.js";
import { clamp } from "./shared.js";

const PADS = [
  { id: "teal", label: "Verde", color: "rgba(42,157,143,0.22)", border: "rgba(42,157,143,0.55)", freq: 392.0 },
  { id: "coral", label: "Coral", color: "rgba(231,111,81,0.22)", border: "rgba(231,111,81,0.55)", freq: 440.0 },
  { id: "sand", label: "Arena", color: "rgba(233,196,106,0.26)", border: "rgba(233,196,106,0.7)", freq: 523.25 },
  { id: "ink", label: "Gris", color: "rgba(45,45,45,0.14)", border: "rgba(45,45,45,0.35)", freq: 329.63 },
];

const WATCH_STEP_MS = 1320;

export function mountSimonGame(root, { storage, audio }) {
  let disposed = false;
  let showing = false;
  let accepting = false;
  let sequence = [];
  let inputIndex = 0;
  let bestLen = storage.getProgress("simon").bestLen ?? 0;
  let previewAnimId = 0;

  const header = el("div", { class: "stack", style: "margin-bottom:12px" });
  const board = el("div", {
    class: "grid simonBoard",
    style: "grid-template-columns: 1fr 1fr",
  });
  const footer = el("div", { class: "stack", style: "margin-top:12px" });
  root.append(header, board, footer);

  const lengthPill = el("span", { class: "pill" }, "Longitud: 1");
  const bestPill = el("span", { class: "pill" }, `Mejor: ${bestLen}`);
  const statusText = el(
    "span",
    { class: "matchStatusText" },
    '1) Mira la secuencia. 2) Repite el orden. 3) Usa "Mostrar otra vez" cuando quieras.',
  );
  const previewFill = el("span", { class: "previewProgressFill" });
  const previewTrack = el("span", { class: "previewProgressTrack", "aria-hidden": "true" }, previewFill);
  const statusMsg = el("div", { class: "msg matchStatus", role: "status", "aria-live": "polite" }, [
    statusText,
    previewTrack,
  ]);

  header.append(el("div", { class: "row" }, [lengthPill, bestPill]), statusMsg);

  const pads = PADS.map((p, idx) => {
    const b = el(
      "button",
      {
        class: "tile simonPad",
        type: "button",
        "aria-label": p.label,
        onclick: () => onPad(idx),
        style: `background: ${p.color}; border-color: ${p.border}; min-height: 96px;`,
      },
      el("div", { class: "simonPadLabel" }, p.label),
    );
    return b;
  });
  pads.forEach((p) => board.append(p));

  const replayBtn = el(
    "button",
    { class: "btn small", type: "button", onclick: () => showSequence() },
    "Mostrar otra vez",
  );
  const restartBtn = el(
    "button",
    { class: "btn small", type: "button", onclick: () => startOver() },
    "Reiniciar",
  );
  footer.append(replayBtn, restartBtn);

  startOver();

  function setMode(mode) {
    if (mode === "watch") {
      board.classList.add("simonShowing");
      board.classList.remove("simonTurn");
      pads.forEach((p) => p.setAttribute("disabled", "true"));
      replayBtn.setAttribute("disabled", "true");
      return;
    }

    if (mode === "turn") {
      board.classList.remove("simonShowing");
      board.classList.add("simonTurn");
      pads.forEach((p) => p.removeAttribute("disabled"));
      replayBtn.removeAttribute("disabled");
      return;
    }

    // idle
    board.classList.remove("simonShowing");
    board.classList.remove("simonTurn");
    pads.forEach((p) => p.removeAttribute("disabled"));
    replayBtn.removeAttribute("disabled");
  }

  async function startOver() {
    sequence = [randPad()];
    inputIndex = 0;
    accepting = false;
    setPreviewState(false);
    updateHeader(
      '1) Mira la secuencia. 2) Repite el orden. 3) Usa "Mostrar otra vez" cuando quieras.',
      "info",
    );
    await sleep(250);
    showSequence();
  }

  function updateHeader(msg, tone = "info") {
    lengthPill.textContent = `Longitud: ${sequence.length}`;
    bestPill.textContent = `Mejor: ${bestLen}`;
    statusMsg.classList.remove("msg--ok", "msg--bad");
    if (tone === "ok") statusMsg.classList.add("msg--ok");
    if (tone === "bad") statusMsg.classList.add("msg--bad");
    statusText.textContent = msg;
  }

  async function showSequence() {
    if (disposed || showing) return;
    showing = true;
    setMode("watch");
    accepting = false;
    inputIndex = 0;

    setPreviewState(true, sequence.length * WATCH_STEP_MS);
    updateHeader("Mira la secuencia.", "info");

    for (const idx of sequence) {
      if (disposed) return;
      await flash(idx);
      await sleep(420);
    }

    setPreviewState(false);
    showing = false;
    accepting = true;
    setMode("turn");
    updateHeader("Tu turno. Repite el mismo orden.", "info");
  }

  async function onPad(idx) {
    if (disposed || !accepting) return;
    await flash(idx, true);

    if (idx !== sequence[inputIndex]) {
      audio.gentleNo();
      board.classList.add("simonBad");
      updateHeader("No era ese color. Vamos a verla otra vez.", "bad");
      accepting = false;
      setMode("watch");
      await sleep(650);
      board.classList.remove("simonBad");
      showSequence();
      return;
    }

    audio.softOk();
    inputIndex += 1;
    if (inputIndex >= sequence.length) {
      bestLen = Math.max(bestLen, sequence.length);
      persist();
      board.classList.add("simonOk");
      updateHeader("Muy bien. Agregamos un color mas.", "ok");
      accepting = false;
      await sleep(500);
      board.classList.remove("simonOk");
      sequence.push(randPad());
      showSequence();
      return;
    }

    updateHeader("Correcto. Continua.", "ok");
  }

  async function flash(idx, userTap = false) {
    const pad = pads[idx];
    pad.classList.add("isActive");
    audio.note(PADS[idx].freq);
    await sleep(userTap ? 260 : 900);
    pad.classList.remove("isActive");
  }

  function setPreviewState(on, durationMs = 0) {
    if (!previewFill) return;

    if (!on) {
      statusMsg.classList.remove("isPreview");
      stopPreviewProgress();
      return;
    }

    statusMsg.classList.add("isPreview");
    startPreviewProgress(durationMs);
  }

  function startPreviewProgress(durationMs) {
    stopPreviewProgress();
    if (durationMs <= 0) return;

    const startAt = performance.now();
    previewFill.style.width = "100%";

    const tick = (now) => {
      if (disposed) return;
      const elapsed = Math.min(durationMs, now - startAt);
      const left = Math.max(0, 100 - (elapsed / durationMs) * 100);
      previewFill.style.width = `${left}%`;
      if (elapsed < durationMs) {
        previewAnimId = requestAnimationFrame(tick);
      } else {
        previewAnimId = 0;
      }
    };

    previewAnimId = requestAnimationFrame(tick);
  }

  function stopPreviewProgress() {
    if (previewAnimId) {
      cancelAnimationFrame(previewAnimId);
      previewAnimId = 0;
    }
    previewFill.style.width = "0%";
  }

  function persist() {
    const p = storage.getProgress("simon");
    storage.setProgress("simon", {
      ...p,
      bestLen,
      lastPlayedAt: Date.now(),
    });
  }

  function randPad() {
    return clamp(Math.floor(Math.random() * PADS.length), 0, PADS.length - 1);
  }

  return () => {
    disposed = true;
    stopPreviewProgress();
  };
}
