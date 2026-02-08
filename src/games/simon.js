import { clear, el, sleep } from "../ui/dom.js";
import { clamp } from "./shared.js";

const PADS = [
  { id: "teal", label: "Verde", color: "rgba(42,157,143,0.22)", border: "rgba(42,157,143,0.55)", freq: 392.0 },
  { id: "coral", label: "Coral", color: "rgba(231,111,81,0.22)", border: "rgba(231,111,81,0.55)", freq: 440.0 },
  { id: "sand", label: "Arena", color: "rgba(233,196,106,0.26)", border: "rgba(233,196,106,0.7)", freq: 523.25 },
  { id: "ink", label: "Gris", color: "rgba(45,45,45,0.14)", border: "rgba(45,45,45,0.35)", freq: 329.63 },
];

export function mountSimonGame(root, { storage, audio }) {
  let disposed = false;
  let showing = false;
  let accepting = false;
  let sequence = [];
  let inputIndex = 0;
  let bestLen = storage.getProgress("simon").bestLen ?? 0;

  const header = el("div", { class: "stack", style: "margin-bottom:12px" });
  const board = el("div", {
    class: "grid simonBoard",
    style: "grid-template-columns: 1fr 1fr",
    "data-mode": "",
    "data-turn": "",
  });
  const footer = el("div", { class: "stack", style: "margin-top:12px" });
  root.append(header, board, footer);

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
      el("div", { style: "font-weight:700;font-size:1.1rem" }, p.label),
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
      board.setAttribute("data-mode", "Mirando… (espera)");
      board.setAttribute("data-turn", "");
      board.classList.add("simonShowing");
      board.classList.remove("simonTurn");
      pads.forEach((p) => p.setAttribute("disabled", "true"));
      replayBtn.setAttribute("disabled", "true");
      return;
    }

    if (mode === "turn") {
      board.setAttribute("data-mode", "");
      board.setAttribute("data-turn", "Tu turno");
      board.classList.remove("simonShowing");
      board.classList.add("simonTurn");
      pads.forEach((p) => p.removeAttribute("disabled"));
      replayBtn.removeAttribute("disabled");
      return;
    }

    // idle
    board.setAttribute("data-mode", "");
    board.setAttribute("data-turn", "");
    board.classList.remove("simonShowing");
    board.classList.remove("simonTurn");
    pads.forEach((p) => p.removeAttribute("disabled"));
    replayBtn.removeAttribute("disabled");
  }

  async function startOver() {
    sequence = [randPad()];
    inputIndex = 0;
    accepting = false;
    updateHeader();
    await sleep(250);
    showSequence();
  }

  function updateHeader(msg, tone = "info") {
    clear(header);
    const msgClass = tone === "ok" ? "msg msg--ok" : tone === "bad" ? "msg msg--bad" : "msg";
    header.append(
      el("div", { class: "row" }, [
        el("span", { class: "pill" }, `Longitud: ${sequence.length}`),
        el("span", { class: "pill" }, `Mejor: ${bestLen}`),
      ]),
      el(
        "div",
        { class: msgClass },
        msg ?? '1) Mira la secuencia. 2) Toca las flores en el mismo orden. 3) Pulsa "Mostrar otra vez" si lo necesitas.',
      ),
    );
  }

  async function showSequence() {
    if (disposed || showing) return;
    showing = true;
    setMode("watch");
    accepting = false;
    inputIndex = 0;
    updateHeader("Mirando…");

    for (const idx of sequence) {
      if (disposed) return;
      await flash(idx);
      await sleep(420);
    }
    showing = false;
    accepting = true;
    setMode("turn");
    updateHeader("Tu turno. Sin prisa.");
  }

  async function onPad(idx) {
    if (disposed || !accepting) return;
    await flash(idx, true);

    if (idx !== sequence[inputIndex]) {
      audio.gentleNo();
      board.classList.add("simonBad");
      updateHeader("No era esa. Vamos a mirarlo otra vez.", "bad");
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
      updateHeader("¡Muy bien! Uno más.", "ok");
      accepting = false;
      await sleep(500);
      board.classList.remove("simonOk");
      sequence.push(randPad());
      showSequence();
      return;
    }

    updateHeader("Correcto. Sigue.", "ok");
  }

  async function flash(idx, userTap = false) {
    const pad = pads[idx];
    pad.classList.add("isActive");
    audio.note(PADS[idx].freq);
    await sleep(userTap ? 260 : 900);
    pad.classList.remove("isActive");
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
  };
}
