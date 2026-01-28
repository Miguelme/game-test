import { createAppShell } from "./ui/shell.js";
import { createRouter } from "./router.js";
import { storage } from "./storage.js";
import { createAudio } from "./audio.js";
import { routes } from "./routes.js";

const appRoot = document.getElementById("app");
if (!appRoot) throw new Error("Missing #app");

const settings = storage.getSettings();
applySettings(settings);

const audio = createAudio(() => storage.getSettings());

const shell = createAppShell(appRoot, {
  getSettings: () => storage.getSettings(),
  setSettings: (next) => {
    storage.setSettings(next);
    applySettings(next);
  },
});

const router = createRouter({
  onRoute: async (routeId) => {
    const route = routes[routeId] ?? routes.home;
    shell.setActiveRoute(routeId);
    await shell.setScreen(route, {
      navigate: router.navigate,
      storage,
      audio,
    });
  },
});

router.start();

// Gentle rest prompt after 7 minutes.
let restTimerId = window.setTimeout(() => {
  shell.showRestPrompt({
    onStop: () => router.navigate("home"),
    onContinue: () => {
      restTimerId = window.setTimeout(() => {
        shell.showRestPrompt({
          onStop: () => router.navigate("home"),
          onContinue: () => {},
        });
      }, 7 * 60 * 1000);
    },
  });
}, 7 * 60 * 1000);

function applySettings(s) {
  document.documentElement.style.setProperty("--font-scale", String(s.textScale));
  document.documentElement.style.setProperty("--motion-ok", s.reduceMotion ? "0" : "1");
}
