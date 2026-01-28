import { clear, el } from "./dom.js";

export function createAppShell(root, { getSettings, setSettings }) {
  const screen = el("main", { class: "screen" });
  const nav = el("nav", { class: "nav", role: "navigation", "aria-label": "Main" });

  const homeBtn = el("button", {
    class: "navbtn",
    type: "button",
    onclick: () => (window.location.hash = "#/home"),
  }, "Inicio");
  const settingsBtn = el(
    "button",
    {
      class: "navbtn",
      type: "button",
      onclick: () => (window.location.hash = "#/settings"),
    },
    "Ajustes",
  );

  nav.append(homeBtn, settingsBtn);
  root.append(screen, nav);

  let unmount = null;
  let overlay = null;

  function setActiveRoute(routeId) {
    const isHome = routeId === "home";
    const isSettings = routeId === "settings";
    homeBtn.setAttribute("aria-current", isHome ? "page" : "false");
    settingsBtn.setAttribute("aria-current", isSettings ? "page" : "false");
  }

  async function setScreen(route, api) {
    if (typeof unmount === "function") unmount();
    unmount = null;
    clear(screen);

    unmount = await route.render(screen, {
      ...api,
      getSettings,
      setSettings,
    });
  }

  function showRestPrompt({ onStop, onContinue }) {
    if (overlay) return;
    overlay = el("div", { class: "overlay", role: "dialog", "aria-modal": "true" });
    const modal = el("div", { class: "panel modal" });
    modal.append(
      el("h2", { text: "Muy bien." }),
      el("p", { text: "¿Quieres descansar o jugar un poco más?" }),
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
                close();
                onContinue();
              },
            },
            "Continuar",
          ),
          el(
            "button",
            {
              class: "btn",
              type: "button",
              onclick: () => {
                close();
                onStop();
              },
            },
            "Descansar",
          ),
        ],
      ),
    );
    overlay.append(modal);
    document.body.append(overlay);

    function close() {
      overlay?.remove();
      overlay = null;
    }
  }

  return { setActiveRoute, setScreen, showRestPrompt };
}
