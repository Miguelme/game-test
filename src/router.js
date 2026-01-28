const DEFAULT_ROUTE = "home";

export function createRouter({ onRoute }) {
  function readHash() {
    const raw = window.location.hash.replace(/^#\/?/, "").trim();
    if (!raw) return DEFAULT_ROUTE;
    return raw;
  }

  function navigate(routeId) {
    window.location.hash = `#/${routeId}`;
  }

  function onHashChange() {
    onRoute(readHash());
  }

  function start() {
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
  }

  return { start, navigate };
}
