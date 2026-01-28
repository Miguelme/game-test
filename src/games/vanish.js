import { clear, el, sleep } from "../ui/dom.js";
import { ICONS } from "../ui/icons.js";
import { shuffle, clamp } from "./shared.js";

export function mountVanishGame(root, { storage, audio }) {
  let disposed = false;
  let roundItems = [];
  let missing = null;
  let stage = "start"; // start | question | result
  let questionState = null;

  const progress = storage.getProgress("vanish");
  let level = clamp(progress.currentLevel ?? 3, 3, 5);
  let correctStreak = 0;

  const header = el("div", { class: "stack", style: "margin-bottom:12px" });
  const panel = el("div", { class: "stack" });
  root.append(header, panel);

  nextRound();

  async function nextRound() {
    if (disposed) return;
    stage = "start";
    clear(header);
    clear(panel);

    header.append(
      el("div", { class: "row" }, [
        el("span", { class: "pill" }, `Items: ${level}`),
        el("span", { class: "pill" }, `Streak: ${correctStreak}`),
      ]),
      el("div", { class: "msg" }, "Mira los objetos. Cuando estes listo, toca Listo."),
    );

    roundItems = shuffle(ICONS).slice(0, level);
    missing = null;
    questionState = null;

    const grid = el("div", { class: "grid", style: "grid-template-columns: 1fr 1fr 1fr" });
    for (const it of roundItems) {
      grid.append(el("div", { class: "tile", role: "img", "aria-label": it.label }, html(it.svg)));
    }

    panel.append(
      grid,
      el(
        "button",
        {
          class: "btn primary",
          type: "button",
          onclick: () => askQuestion(),
        },
        "Listo",
      ),
    );
  }

  async function askQuestion() {
    if (disposed) return;
    stage = "question";
    clear(panel);

    if (!questionState) {
      const removedIndex = Math.floor(Math.random() * roundItems.length);
      missing = roundItems[removedIndex];
      const shown = roundItems.filter((_, i) => i !== removedIndex);
      const optionsList = shuffle([...roundItems]);
      questionState = { missing, shown, optionsList };
    }

    missing = questionState.missing;
    const shown = questionState.shown;

    const grid = el("div", { class: "grid", style: "grid-template-columns: 1fr 1fr 1fr" });
    for (const it of shown) {
      grid.append(el("div", { class: "tile", role: "img", "aria-label": it.label }, html(it.svg)));
    }

    panel.append(
      el("div", { class: "msg" }, "¿Cuál objeto falta?"),
      grid,
      options(questionState.optionsList, (picked) => onPick(picked)),
    );
  }

  async function onPick(picked) {
    if (disposed || stage !== "question") return;
    stage = "result";

    if (picked.id === missing.id) {
      audio.ok();
      correctStreak += 1;
      persist(true);
      maybeLevelUp();
      panel.prepend(el("div", { class: "msg" }, "Sí. Muy bien."));
      panel.append(
        el(
          "div",
          { class: "actions" },
          [
            el(
              "button",
              {
                class: "btn primary",
                type: "button",
                onclick: () => {
                  questionState = null;
                  nextRound();
                },
              },
              "Siguiente",
            ),
          ],
        ),
      );
      return;
    }

    audio.gentleNo();
    correctStreak = 0;
    persist(false);
    panel.prepend(el("div", { class: "msg" }, `Buen intento. Faltaba: ${missing.label}.`));
    panel.append(
      el(
        "div",
        { class: "actions" },
        [
          el(
            "button",
            {
              class: "btn primary",
              type: "button",
              onclick: () => {
                stage = "question";
                askQuestion();
              },
            },
            "Intentar de nuevo",
          ),
          el(
            "button",
            {
              class: "btn",
              type: "button",
              onclick: () => {
                questionState = null;
                nextRound();
              },
            },
            "Nueva ronda",
          ),
        ],
      ),
    );
  }

  function maybeLevelUp() {
    if (correctStreak >= 4 && level < 5) {
      level += 1;
      correctStreak = 0;
    }
  }

  function persist(wasCorrect) {
    const p = storage.getProgress("vanish");
    const bestLevel = Math.max(p.bestLevel ?? 0, level);
    storage.setProgress("vanish", {
      ...p,
      bestLevel,
      currentLevel: level,
      lastWasCorrect: wasCorrect,
      lastPlayedAt: Date.now(),
    });
  }

  return () => {
    disposed = true;
  };
}

function options(items, onPick) {
  const wrap = el("div", { class: "grid", style: "grid-template-columns: 1fr 1fr" });
  for (const it of items) {
    wrap.append(
      el(
        "button",
        {
          class: "btn small",
          type: "button",
          onclick: () => onPick(it),
        },
        it.label,
      ),
    );
  }
  return wrap;
}

function html(svg) {
  const span = el("span");
  span.innerHTML = svg;
  return span;
}
