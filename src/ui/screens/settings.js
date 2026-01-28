import { el } from "../dom.js";

export async function renderSettings(root, { getSettings, setSettings, navigate }) {
  const s = getSettings();

  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Ajustes" }),
        el("span", { class: "chip" }, "Preferencias"),
      ]),
      el("p", { class: "subtitle", text: "Hazlo más cómodo para jugar." }),
    ]),
  );

  const panel = el("section", { class: "panel card stack" });
  root.append(panel);

  panel.append(
    settingGroup(
      "Tamaño de texto",
      "Texto más grande: más fácil de leer y tocar.",
      segmented({
        options: [
          { label: "Normal", value: 1 },
          { label: "Grande", value: 1.12 },
          { label: "Muy grande", value: 1.25 },
        ],
        value: s.textScale,
        onChange: (v) => setSettings({ ...getSettings(), textScale: v }),
      }),
    ),
    settingGroup(
      "Sonidos",
      "Sonidos suaves al acertar.",
      toggle({
        labelOn: "Sí",
        labelOff: "No",
        value: s.sound,
        onChange: (v) => setSettings({ ...getSettings(), sound: v }),
      }),
    ),
    settingGroup(
      "Reducir movimiento",
      "Menos animaciones en pantalla.",
      toggle({
        labelOn: "Sí",
        labelOff: "No",
        value: s.reduceMotion,
        onChange: (v) => setSettings({ ...getSettings(), reduceMotion: v }),
      }),
    ),
    el(
      "button",
      { class: "btn small", type: "button", onclick: () => navigate("home") },
      "Volver a Inicio",
    ),
  );

  return () => {};
}

function settingGroup(title, hint, control) {
  return el("div", { class: "panel card" }, [
    el("div", { class: "row" }, [
      el("div", {}, [
        el("div", { class: "label", text: title }),
        el("div", { class: "hint", text: hint }),
      ]),
    ]),
    el("div", { style: "margin-top:12px" }, control),
  ]);
}

function segmented({ options, value, onChange }) {
  const wrap = el("div", { class: "grid", style: "grid-template-columns: 1fr 1fr 1fr" });
  for (const opt of options) {
    const selected = nearlyEqual(opt.value, value);
    const btn = el(
      "button",
      {
        class: `btn small ${selected ? "primary" : ""}`,
        type: "button",
        onclick: () => onChange(opt.value),
      },
      opt.label,
    );
    wrap.append(btn);
  }
  return wrap;
}

function toggle({ value, onChange, labelOn, labelOff }) {
  return el("div", { class: "grid", style: "grid-template-columns: 1fr 1fr" }, [
    el(
      "button",
      {
        class: `btn small ${value ? "primary" : ""}`,
        type: "button",
        onclick: () => onChange(true),
      },
      labelOn,
    ),
    el(
      "button",
      {
        class: `btn small ${!value ? "primary" : ""}`,
        type: "button",
        onclick: () => onChange(false),
      },
      labelOff,
    ),
  ]);
}

function nearlyEqual(a, b) {
  return Math.abs(a - b) < 0.03;
}
