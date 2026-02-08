import { clear, el, sleep } from "../ui/dom.js";
import { ICONS } from "../ui/icons.js";
import { shuffle, clamp } from "./shared.js";

const LEVELS = [
  { level: 1, cols: 2, rows: 2 },
  { level: 2, cols: 3, rows: 2 },
  { level: 3, cols: 4, rows: 3 },
];

export function mountMatchGame(root, { storage, audio }) {
  let disposed = false;
  let lock = false;
  let firstPick = null;
  let secondPick = null;

  const progress = storage.getProgress("match");
  const currentLevel = clamp(progress.currentLevel ?? 1, 1, LEVELS.length);
  let activeLevelNum = currentLevel;

  const header = el("div", { class: "stack", style: "margin-bottom:12px" });
  const board = el("div", { class: "grid matchBoard", "data-mode": "" });
  const footer = el("div", { class: "stack", style: "margin-top:12px" });
  root.append(header, board, footer);

  let hintUsed = false;
  let matchedCount = 0;
  let totalPairs = 0;
  let cards = [];
  let reveal = new Set();
  let matched = new Set();

  renderLevel(currentLevel);

  async function renderLevel(levelNum) {
    activeLevelNum = levelNum;
    clear(header);
    clear(board);
    clear(footer);

    lock = false;
    firstPick = null;
    secondPick = null;
    hintUsed = false;
    matchedCount = 0;
    reveal = new Set();
    matched = new Set();

    const spec = LEVELS[levelNum - 1];
    const size = spec.cols * spec.rows;
    totalPairs = size / 2;

    const iconPool = shuffle(ICONS).slice(0, totalPairs);
    cards = shuffle([...iconPool, ...iconPool].map((i, idx) => ({ ...i, idx })));

    header.append(
      el("div", { class: "row" }, [
        el("span", { class: "pill" }, `Nivel ${spec.level} de ${LEVELS.length}`),
        el("span", { class: "pill" }, `Parejas: ${matchedCount} / ${totalPairs}`),
      ]),
      el("div", { class: "msg" }, "Las cartas se verán un momento al empezar."),
    );

    board.style.gridTemplateColumns = `repeat(${spec.cols}, 1fr)`;
    for (let i = 0; i < cards.length; i++) {
      const btn = el("button", {
        class: "tile",
        type: "button",
        "data-i": String(i),
        "aria-label": "Carta",
        onclick: () => onPick(i),
      });
      board.append(btn);
    }

    const hintBtn = el(
      "button",
      {
        class: "btn small",
        type: "button",
        onclick: () => {
          if (hintUsed) return;
          hintUsed = true;
          hintBtn.setAttribute("disabled", "true");
          hintBtn.textContent = "Pista usada";
          showAllBriefly(1200);
        },
      },
      "Ver una pista",
    );

    footer.append(
      hintBtn,
      el(
        "button",
        {
          class: "btn small",
          type: "button",
          onclick: () => renderLevel(levelNum),
        },
        "Reiniciar nivel",
      ),
    );

    // Initial preview scales with level: 1 second per card.
    await showAllBriefly(cards.length * 1000, "Memoriza…");
  }

  async function showAllBriefly(ms, label = "") {
    if (disposed) return;
    setPreviewMode(true, label);
    const all = new Set(cards.map((_, i) => i));
    reveal = new Set([...reveal, ...all]);
    paint();
    await sleep(ms);
    // Keep matched ones visible.
    reveal = new Set([...matched]);
    paint();
    setPreviewMode(false);
  }

  function setPreviewMode(on, label) {
    if (on) {
      lock = true;
      board.classList.add("matchShowing");
      board.setAttribute("data-mode", label || "Memoriza…");
      board.querySelectorAll("button.tile").forEach((b) => b.setAttribute("disabled", "true"));
      return;
    }

    board.classList.remove("matchShowing");
    board.setAttribute("data-mode", "");
    board.querySelectorAll("button.tile").forEach((b) => b.removeAttribute("disabled"));
    // Keep matched tiles non-interactive.
    matched.forEach((i) => {
      const elBtn = board.querySelector(`button.tile[data-i="${i}"]`);
      if (elBtn) elBtn.setAttribute("disabled", "true");
    });
    lock = false;
  }

  async function onPick(i) {
    if (disposed || lock) return;
    if (matched.has(i) || reveal.has(i)) return;

    reveal.add(i);
    paint();

    if (firstPick === null) {
      firstPick = i;
      audio.softOk();
      return;
    }

    if (secondPick === null) {
      secondPick = i;
      lock = true;
    }

    const a = cards[firstPick];
    const b = cards[secondPick];
    if (a.id === b.id) {
      matched.add(firstPick);
      matched.add(secondPick);
      matchedCount += 1;
      audio.ok();
      firstPick = null;
      secondPick = null;
      lock = false;
      updateHeader();
      if (matchedCount >= totalPairs) onWin(activeLevelNum);
      return;
    }

    audio.gentleNo();
    await sleep(1200);
    reveal.delete(firstPick);
    reveal.delete(secondPick);
    firstPick = null;
    secondPick = null;
    lock = false;
    paint();
  }

  function updateHeader() {
    const pills = header.querySelectorAll(".pill");
    if (pills[1]) pills[1].textContent = `Parejas: ${matchedCount} / ${totalPairs}`;
  }

  function paint() {
    const nodes = board.querySelectorAll("button.tile");
    nodes.forEach((node) => {
      const i = Number(node.getAttribute("data-i"));
      const isUp = reveal.has(i);
      const isDone = matched.has(i);
      node.setAttribute("aria-label", isUp ? cards[i].label : "Carta");
      node.setAttribute("aria-disabled", isDone ? "true" : "false");
      node.innerHTML = isUp ? cards[i].svg : `<div class="back" aria-hidden="true"></div>`;
      node.style.opacity = isDone ? "0.82" : "1";
      node.style.borderColor = isDone ? "rgba(42,157,143,0.55)" : "var(--border)";
    });
  }

  function onWin(levelNum) {
    const p = storage.getProgress("match");
    const nextBest = Math.max(p.bestLevel ?? 0, levelNum);
    const nextCurrent = clamp(levelNum + 1, 1, LEVELS.length);
    const isLast = levelNum >= LEVELS.length;
    storage.setProgress("match", {
      ...p,
      bestLevel: nextBest,
      currentLevel: nextCurrent,
      lastPlayedAt: Date.now(),
    });

    footer.prepend(
      el(
        "div",
        { class: "msg" },
        isLast ? "¡Excelente! Has completado todos los niveles." : "Muy bien. ¿Quieres probar el siguiente nivel?",
      ),
      el(
        "button",
        {
          class: "btn primary",
          type: "button",
          onclick: () => renderLevel(isLast ? levelNum : nextCurrent),
        },
        isLast ? "Jugar otra vez" : "Siguiente nivel",
      ),
    );
  }

  return () => {
    disposed = true;
  };
}
