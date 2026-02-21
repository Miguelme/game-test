import { el } from "../dom.js";

export async function renderSettings(root, { getSettings, setSettings, navigate }) {
  const s = getSettings();

  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Ajustes" }),
        el("span", { class: "chip" }, "Accesibilidad"),
      ]),
      el("p", {
        class: "subtitle",
        text: "Configura lectura, contraste y movimiento para jugar con comodidad.",
      }),
    ]),
  );

  const panel = el("section", { class: "panel card stack" });
  root.append(panel);

  panel.append(
    settingGroup(
      "Tamano de texto",
      "Aumenta el tamano para leer y tocar mejor.",
      segmented({
        options: [
          { label: "Normal", value: 1 },
          { label: "Grande", value: 1.12 },
          { label: "Muy grande", value: 1.25 },
        ],
        value: s.textScale,
        ariaLabel: "Tamano de texto",
        onChange: (v) => setSettings({ ...getSettings(), textScale: v }),
      }),
    ),
    settingGroup(
      "Contraste alto",
      "Sube contraste de texto, bordes y botones para ver mejor.",
      toggle({
        labelOn: "Activado",
        labelOff: "Normal",
        value: s.highContrast,
        ariaLabel: "Contraste alto",
        onChange: (v) => setSettings({ ...getSettings(), highContrast: v }),
      }),
    ),
    settingGroup(
      "Sonidos",
      "Activa tonos cortos para confirmar aciertos y errores.",
      toggle({
        labelOn: "Activado",
        labelOff: "Silencio",
        value: s.sound,
        ariaLabel: "Sonidos",
        onChange: (v) => setSettings({ ...getSettings(), sound: v }),
      }),
    ),
    settingGroup(
      "Reducir movimiento",
      "Reduce animaciones para evitar distracciones.",
      toggle({
        labelOn: "Reducido",
        labelOff: "Normal",
        value: s.reduceMotion,
        ariaLabel: "Reducir movimiento",
        onChange: (v) => setSettings({ ...getSettings(), reduceMotion: v }),
      }),
    ),
    el("button", { class: "btn", type: "button", onclick: () => navigate("home") }, "Volver al inicio"),
  );

  return () => {};
}

function settingGroup(title, hint, control) {
  return el("section", { class: "settingCard" }, [
    el("div", { class: "label", text: title }),
    el("p", { class: "hint", text: hint }),
    el("div", { class: "settingControl" }, control),
  ]);
}

function segmented({ options, value, onChange, ariaLabel }) {
  const wrap = el("div", {
    class: "choiceGrid cols-3",
    role: "group",
    "aria-label": ariaLabel,
  });

  for (const opt of options) {
    const selected = nearlyEqual(opt.value, value);
    wrap.append(
      el(
        "button",
        {
          class: `btn ${selected ? "primary" : ""}`,
          type: "button",
          "aria-pressed": selected ? "true" : "false",
          onclick: () => onChange(opt.value),
        },
        opt.label,
      ),
    );
  }

  return wrap;
}

function toggle({ value, onChange, labelOn, labelOff, ariaLabel }) {
  return el(
    "div",
    { class: "choiceGrid cols-2", role: "group", "aria-label": ariaLabel },
    [
      el(
        "button",
        {
          class: `btn ${value ? "primary" : ""}`,
          type: "button",
          "aria-pressed": value ? "true" : "false",
          onclick: () => onChange(true),
        },
        labelOn,
      ),
      el(
        "button",
        {
          class: `btn ${!value ? "primary" : ""}`,
          type: "button",
          "aria-pressed": !value ? "true" : "false",
          onclick: () => onChange(false),
        },
        labelOff,
      ),
    ],
  );
}

function nearlyEqual(a, b) {
  return Math.abs(a - b) < 0.03;
}
