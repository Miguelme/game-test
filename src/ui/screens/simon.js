import { mountSimonGame } from "../../games/simon.js";
import { el } from "../dom.js";

export async function renderSimon(root, api) {
  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Jardín de Simón" }),
        el("span", { class: "chip" }, "Secuencias"),
      ]),
      el("p", { class: "subtitle", text: "Mira las flores. Tócalas en el mismo orden." }),
    ]),
  );

  const host = el("section", { class: "panel board" });
  root.append(host);
  return mountSimonGame(host, api);
}
