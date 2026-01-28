import { renderHome } from "./ui/screens/home.js";
import { renderSettings } from "./ui/screens/settings.js";
import { renderMatch } from "./ui/screens/match.js";
import { renderVanish } from "./ui/screens/vanish.js";
import { renderSimon } from "./ui/screens/simon.js";

export const routes = {
  home: { id: "home", title: "Juegos de Memoria", render: renderHome },
  settings: { id: "settings", title: "Ajustes", render: renderSettings },
  match: { id: "match", title: "Parejas", render: renderMatch },
  vanish: { id: "vanish", title: "El objeto que falta", render: renderVanish },
  simon: { id: "simon", title: "Jardín de Simón", render: renderSimon },
};
