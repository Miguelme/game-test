import { mountVanishGame } from "../../games/vanish.js";
import { el } from "../dom.js";

export async function renderVanish(root, api) {
  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Objeto que falta" }),
        el("span", { class: "chip" }, "Atencion"),
      ]),
      el("p", { class: "subtitle", text: "Recuerda los objetos y elige el que desaparece." }),
    ]),
  );

  root.append(
    el("details", { class: "panel card howTo howToToggle" }, [
      el("summary", { class: "howToSummary" }, "Como jugar"),
      el("ol", { class: "steps" }, [
        el("li", { text: "Observa todos los objetos." }),
        el("li", { text: "Pulsa Listo cuando los recuerdes." }),
        el("li", { text: "Elige el objeto que falta." }),
      ]),
    ]),
  );

  const host = el("section", { class: "panel board gameStage" });
  root.append(host);
  return mountVanishGame(host, api);
}
