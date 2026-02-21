import { mountSimonGame } from "../../games/simon.js";
import { el } from "../dom.js";

export async function renderSimon(root, api) {
  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Jardin de Simon" }),
        el("span", { class: "chip" }, "Secuencias"),
      ]),
      el("p", { class: "subtitle", text: "Mira la secuencia y repitela en el mismo orden." }),
    ]),
  );

  root.append(
    el("details", { class: "panel card howTo howToToggle" }, [
      el("summary", { class: "howToSummary" }, "Como jugar"),
      el("ol", { class: "steps" }, [
        el("li", { text: "Primero observa la secuencia." }),
        el("li", { text: "Despues toca los colores en el mismo orden." }),
        el("li", { text: "Usa Mostrar otra vez cuando lo necesites." }),
      ]),
    ]),
  );

  const host = el("section", { class: "panel board gameStage" });
  root.append(host);
  return mountSimonGame(host, api);
}
