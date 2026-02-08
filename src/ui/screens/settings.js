import { el } from "../dom.js";

export async function renderSettings(root, { getSettings, setSettings, navigate }) {
  const s = getSettings();

  root.append(
    el("header", { class: "hero" }, [
      el("div", { class: "heroTop" }, [
        el("h1", { class: "title", text: "Ajustes" }),
        el("span", { class: "chip" }, "Personaliza"),
      ]),
      el("p", { class: "subtitle", text: "Ajusta el tamano, sonido y movimiento para jugar comodo." }),
    ]),
  );

  const panel = el("section", { class: "panel card stack" });
  root.append(panel);

  panel.append(
    settingGroup(
      "Tamano de texto",
      "Sube el tamano si prefieres leer con menos esfuerzo.",
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
      "Sonidos",
      "Activa tonos suaves cuando aciertas.",
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
      "Disminuye animaciones para una vista mas estable.",
      toggle({
        labelOn: "Reducido",
        labelOff: "Normal",
        value: s.reduceMotion,
        ariaLabel: "Reducir movimiento",
        onChange: (v) => setSettings({ ...getSettings(), reduceMotion: v }),
      }),
    ),
    el("button", { class: "btn small", type: "button", onclick: () => navigate("home") }, "Volver al inicio"),
  );

  return () => {};
}

function settingGroup(title, hint, control) {
  return el("div", { class: "settingCard" }, [
    el("div", { class: "label", text: title }),
    el("div", { class: "hint", text: hint }),
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
          class: `btn small ${selected ? "primary" : ""}`,
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
          class: `btn small ${value ? "primary" : ""}`,
          type: "button",
          "aria-pressed": value ? "true" : "false",
          onclick: () => onChange(true),
        },
        labelOn,
      ),
      el(
        "button",
        {
          class: `btn small ${!value ? "primary" : ""}`,
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
