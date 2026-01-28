import { mountMatchGame } from "../../games/match.js";
import { el } from "../dom.js";

export async function renderMatch(root, api) {
  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Parejas" }),
        el("span", { class: "chip" }, "Memoria visual"),
      ]),
      el("p", { class: "subtitle", text: "Encuentra dos dibujos iguales. Sin prisa." }),
    ]),
  );

  const host = el("section", { class: "panel board" });
  root.append(host);
  return mountMatchGame(host, api);
}
