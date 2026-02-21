import { mountMatchGame } from "../../games/match.js";
import { el } from "../dom.js";

export async function renderMatch(root, api) {
  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Parejas" }),
        el("span", { class: "chip" }, "Memoria visual"),
      ]),
      el("p", { class: "subtitle", text: "Encuentra dos cartas iguales. No hay limite de tiempo." }),
    ]),
  );

  root.append(
    el("details", { class: "panel card howTo howToToggle" }, [
      el("summary", { class: "howToSummary" }, "Como jugar"),
      el("ol", { class: "steps" }, [
        el("li", { text: "Mira las cartas cuando se muestran al inicio." }),
        el("li", { text: "Toca dos cartas para formar una pareja." }),
        el("li", { text: "Si fallas, vuelve a intentar." }),
      ]),
    ]),
  );

  const host = el("section", { class: "panel board gameStage" });
  root.append(host);
  return mountMatchGame(host, api);
}
