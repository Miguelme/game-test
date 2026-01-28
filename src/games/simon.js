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
  const board = el("div", { class: "grid simonBoard", style: "grid-template-columns: 1fr 1fr" });
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

  footer.append(
    el(
      "button",
      { class: "btn small", type: "button", onclick: () => showSequence() },
      "Mostrar otra vez",
    ),
    el(
      "button",
      { class: "btn small", type: "button", onclick: () => startOver() },
      "Reiniciar",
    ),
  );

  startOver();

  async function startOver() {
    sequence = [randPad()];
    inputIndex = 0;
    accepting = false;
    updateHeader();
    await sleep(250);
    showSequence();
  }

  function updateHeader(msg) {
    clear(header);
    header.append(
      el("div", { class: "row" }, [
        el("span", { class: "pill" }, `Longitud: ${sequence.length}`),
        el("span", { class: "pill" }, `Mejor: ${bestLen}`),
      ]),
      el(
        "div",
        { class: "msg" },
        msg ?? '1) Mira la secuencia. 2) Toca las flores en el mismo orden. 3) Pulsa "Mostrar otra vez" cuando quieras.',
      ),
    );
  }

  async function showSequence() {
    if (disposed || showing) return;
    showing = true;
    board.classList.add("simonShowing");
    accepting = false;
    inputIndex = 0;
    updateHeader("Mirando…");

    for (const idx of sequence) {
      if (disposed) return;
      await flash(idx);
      await sleep(220);
    }
    showing = false;
    board.classList.remove("simonShowing");
    accepting = true;
    updateHeader("Tu turno. Sin prisa.");
  }

  async function onPad(idx) {
    if (disposed || !accepting) return;
    await flash(idx, true);

    if (idx !== sequence[inputIndex]) {
      audio.gentleNo();
      updateHeader("Buen intento. Vamos a mirarlo otra vez.");
      accepting = false;
      await sleep(650);
      showSequence();
      return;
    }

    audio.softOk();
    inputIndex += 1;
    if (inputIndex >= sequence.length) {
      bestLen = Math.max(bestLen, sequence.length);
      persist();
      updateHeader("Muy bien. Uno más.");
      accepting = false;
      await sleep(500);
      sequence.push(randPad());
      showSequence();
    }
  }

  async function flash(idx, userTap = false) {
    const pad = pads[idx];
    pad.classList.add("isActive");
    audio.note(PADS[idx].freq);
    await sleep(userTap ? 220 : 420);
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
