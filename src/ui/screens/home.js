import { el } from "../dom.js";

export async function renderHome(root, { navigate, storage }) {
  const match = storage.getProgress("match");
  const vanish = storage.getProgress("vanish");
  const simon = storage.getProgress("simon");

  const games = [
    {
      id: "match",
      title: "Parejas",
      subtitle: "Encuentra dos dibujos iguales",
      progress: match,
      bestLabel: match.bestLevel ? `Nivel ${match.bestLevel}` : "Nuevo",
      tone: "teal",
      icon: iconCards(),
    },
    {
      id: "vanish",
      title: "Objeto que falta",
      subtitle: "Uno desaparece. Cual falta?",
      progress: vanish,
      bestLabel: vanish.bestLevel ? `Nivel ${vanish.bestLevel}` : "Nuevo",
      tone: "amber",
      icon: iconEye(),
    },
    {
      id: "simon",
      title: "Jardin de Simon",
      subtitle: "Repite la secuencia",
      progress: simon,
      bestLabel: simon.bestLen ? `Longitud ${simon.bestLen}` : "Nuevo",
      tone: "coral",
      icon: iconFlower(),
    },
  ];

  const lastGame = games
    .filter((g) => g.progress?.lastPlayedAt)
    .sort((a, b) => b.progress.lastPlayedAt - a.progress.lastPlayedAt)[0];

  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Juegos de Memoria" }),
        el("span", { class: "chip" }, formatLongDate(new Date())),
      ]),
      el("p", { class: "subtitle", text: "Tres juegos cortos para entrenar memoria y atencion." }),
      el("div", { class: "heroStats" }, [
        el("span", { class: "badge" }, `Parejas: ${games[0].bestLabel}`),
        el("span", { class: "badge" }, `Objeto: ${games[1].bestLabel}`),
        el("span", { class: "badge" }, `Simon: ${games[2].bestLabel}`),
      ]),
    ]),
  );

  if (lastGame) {
    root.append(
      el("section", { class: "panel banner stack" }, [
        el("div", { class: "row" }, [
          el("div", { class: "stack compact" }, [
            el("div", { class: "bannerTitle", text: "Continuar" }),
            el("div", { class: "hint", text: `Ultima sesion: ${lastGame.title} (${formatShortDate(lastGame.progress.lastPlayedAt)})` }),
          ]),
          el("span", { class: "badge" }, lastGame.bestLabel),
        ]),
        el("button", { class: "btn primary", type: "button", onclick: () => navigate(lastGame.id) }, `Jugar ${lastGame.title}`),
      ]),
    );
  }

  root.append(
    el("section", { class: "panel card stack" }, [
      el("div", { class: "label", text: "Juegos" }),
      el("div", { class: "gameList" }, games.map((game) => gameCard({
        title: game.title,
        subtitle: game.subtitle,
        meta: buildMeta(game),
        tone: game.tone,
        icon: game.icon,
        onClick: () => navigate(game.id),
      }))),
    ]),
  );

  root.append(
    el("section", { class: "panel card stack" }, [
      el("div", { class: "label", text: "Progreso" }),
      el("div", { class: "statGrid" }, [
        stat("Parejas", games[0].bestLabel),
        stat("Objeto", games[1].bestLabel),
        stat("Simon", games[2].bestLabel),
      ]),
    ]),
  );

  return () => {};
}

function gameCard({ title, subtitle, meta, icon, onClick, tone }) {
  return el(
    "button",
    {
      class: `gameCard tone-${tone}`,
      type: "button",
      onclick: onClick,
    },
    [
      el("span", { class: "gameIcon", "aria-hidden": "true" }, icon),
      el("span", { class: "gameText" }, [
        el("span", { class: "gameTitle", text: title }),
        el("span", { class: "gameSubtitle", text: subtitle }),
        el("span", { class: "gameMeta", text: meta }),
      ]),
      el("span", { class: "gameArrow", "aria-hidden": "true" }, "→"),
    ],
  );
}

function buildMeta(game) {
  const bits = [game.bestLabel];
  if (game.progress?.lastPlayedAt) {
    bits.push(`Ultima vez ${formatShortDate(game.progress.lastPlayedAt)}`);
  }
  return bits.join(" · ");
}

function formatShortDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

function formatLongDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function stat(label, value) {
  return el("div", { class: "stat" }, [
    el("div", { class: "statLabel", text: label }),
    el("div", { class: "statValue", text: value }),
  ]);
}

function iconCards() {
  return svg(
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M3 15V5a2 2 0 0 1 2-2h12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  );
}

function iconEye() {
  return svg(
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12S6.5 5.5 12 5.5 21.5 12 21.5 12 17.5 18.5 12 18.5 2.5 12 2.5 12Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.75" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
  );
}

function iconFlower() {
  return svg(
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21c2-2.2 2-5.2 0-7.5-2 2.3-2 5.3 0 7.5Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 13c1.9-1.8 4.8-1.8 6.6 0 .4-2.5-1.4-4.9-3.9-5.3.4-2.5-1.7-4.7-4.2-4.2-2.5-.5-4.6 1.7-4.2 4.2-2.5.4-4.3 2.8-3.9 5.3 1.8-1.8 4.7-1.8 6.6 0Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
  );
}

function svg(markup) {
  const span = el("span", { class: "svg" });
  span.innerHTML = markup;
  return span;
}
