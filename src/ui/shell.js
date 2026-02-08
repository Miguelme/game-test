import { clear, el } from "./dom.js";

export function createAppShell(root, { getSettings, setSettings }) {
  root.classList.add("appShell");

  const screen = el("main", { class: "screen" });
  const nav = el("nav", { class: "nav", role: "navigation", "aria-label": "Navegacion principal" });

  const homeBtn = el(
    "button",
    {
      class: "navbtn",
      type: "button",
      onclick: () => (window.location.hash = "#/home"),
    },
    "Inicio",
  );

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

    const titleId = "rest-title";
    const descId = "rest-desc";

    overlay = el("div", {
      class: "overlay",
      role: "dialog",
      "aria-modal": "true",
      "aria-labelledby": titleId,
      "aria-describedby": descId,
    });

    const modal = el("div", { class: "panel modal" });

    const continueBtn = el(
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
    );

    const stopBtn = el(
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
    );

    modal.append(
      el("h2", { id: titleId, text: "Muy bien." }),
      el("p", { id: descId, text: "Quieres descansar o jugar un poco mas?" }),
      el("div", { class: "actions" }, [continueBtn, stopBtn]),
    );

    overlay.append(modal);
    document.body.append(overlay);
    window.setTimeout(() => continueBtn.focus(), 0);

    function onEscape(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        onStop();
      }
    }

    document.addEventListener("keydown", onEscape);

    function close() {
      document.removeEventListener("keydown", onEscape);
      overlay?.remove();
      overlay = null;
    }
  }

  return { setActiveRoute, setScreen, showRestPrompt };
}
