import { mountVanishGame } from "../../games/vanish.js";
import { el } from "../dom.js";

export async function renderVanish(root, api) {
  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "El objeto que falta" }),
        el("span", { class: "chip" }, "Atencion"),
      ]),
      el("p", { class: "subtitle", text: "Recuerda los objetos. Uno desaparece. ¿Cuál falta?" }),
    ]),
  );

  const host = el("section", { class: "panel board" });
  root.append(host);
  return mountVanishGame(host, api);
}
