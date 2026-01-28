import { el } from "../dom.js";

export async function renderHome(root, { navigate, storage }) {
  const match = storage.getProgress("match");
  const vanish = storage.getProgress("vanish");
  const simon = storage.getProgress("simon");

  const today = new Date().toLocaleDateString();

  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Juegos de Memoria" }),
        el("span", { class: "chip" }, `Hoy: ${today}`),
      ]),
      el("p", { class: "subtitle", text: "Elige un juego y juega a tu ritmo." }),
    ]),
  );

  root.append(
    el("section", { class: "panel card stack" }, [
      el("div", { class: "tip" }, [
        el("span", { class: "tipDot", "aria-hidden": "true" }, ""),
        el("div", {}, [
          el("div", { class: "tipTitle", text: "Consejo" }),
          el("div", { class: "hint", text: "Unos minutos al día es suficiente. Puedes parar cuando quieras." }),
        ]),
      ]),
      el("div", { class: "gameList" }, [
        gameCard({
          title: "Parejas",
          subtitle: "Encuentra dos dibujos iguales",
          meta: match.bestLevel ? `Mejor: ${match.bestLevel}` : "",
          tone: "teal",
          icon: iconCards(),
          onClick: () => navigate("match"),
        }),
        gameCard({
          title: "El objeto que falta",
          subtitle: "Uno desaparece. ¿Cuál falta?",
          meta: vanish.bestLevel ? `Mejor: ${vanish.bestLevel}` : "",
          tone: "amber",
          icon: iconEye(),
          onClick: () => navigate("vanish"),
        }),
        gameCard({
          title: "Jardín de Simón",
          subtitle: "Repite la secuencia",
          meta: simon.bestLen ? `Mejor: ${simon.bestLen}` : "",
          tone: "coral",
          icon: iconFlower(),
          onClick: () => navigate("simon"),
        }),
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
        meta ? el("span", { class: "gameMeta", text: meta }) : null,
      ]),
      el("span", { class: "gameArrow", "aria-hidden": "true" }, "›"),
    ],
  );
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
