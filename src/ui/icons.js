// High-contrast, simple SVGs (no tiny details).
export const ICONS = [
  icon("sun", "Sol", `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="9" fill="#E9C46A" stroke="#2D2D2D" stroke-width="2"/><g stroke="#2D2D2D" stroke-width="2" stroke-linecap="round"><path d="M24 5v6"/><path d="M24 37v6"/><path d="M5 24h6"/><path d="M37 24h6"/><path d="M10 10l4 4"/><path d="M34 34l4 4"/><path d="M38 10l-4 4"/><path d="M14 34l-4 4"/></g></svg>`),
  icon("leaf", "Hoja", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M38 10C26 10 12 16 10 30c10 6 22 6 30-2 2-8 0-14-2-18Z" fill="#2A9D8F" stroke="#2D2D2D" stroke-width="2" stroke-linejoin="round"/><path d="M15 28c6-7 14-11 21-13" fill="none" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round"/></svg>`),
  icon("heart", "Corazón", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 41S9 31 9 19c0-5 4-9 9-9 3 0 6 2 7 4 1-2 4-4 7-4 5 0 9 4 9 9 0 12-15 22-15 22Z" fill="#E76F51" stroke="#2D2D2D" stroke-width="2" stroke-linejoin="round"/></svg>`),
  icon("star", "Estrella", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 6l5 12 13 1-10 8 3 13-11-7-11 7 3-13-10-8 13-1 5-12Z" fill="#F4A261" stroke="#2D2D2D" stroke-width="2" stroke-linejoin="round"/></svg>`),
  icon("cup", "Taza", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M12 15h18v12c0 6-4 11-9 11s-9-5-9-11V15Z" fill="#E9C46A" stroke="#2D2D2D" stroke-width="2"/><path d="M30 18h3c3 0 6 2 6 5s-3 5-6 5h-3" fill="none" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round"/></svg>`),
  icon("key", "Llave", `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="18" cy="22" r="7" fill="#FFFFFF" stroke="#2D2D2D" stroke-width="2"/><path d="M24 22h18v6h-5v4h-5v-4h-3" fill="none" stroke="#2D2D2D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`),
  icon("house", "Casa", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 22 24 9l16 13v17H8V22Z" fill="#2A9D8F" stroke="#2D2D2D" stroke-width="2" stroke-linejoin="round"/><path d="M20 39V27h8v12" fill="#FFFFFF" stroke="#2D2D2D" stroke-width="2"/></svg>`),
  icon("bell", "Campana", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 41a4 4 0 0 0 4-4H20a4 4 0 0 0 4 4Z" fill="#FFFFFF" stroke="#2D2D2D" stroke-width="2"/>
  <path d="M10 34h28c-2-3-4-6-4-13 0-6-4-11-10-11S14 15 14 21c0 7-2 10-4 13Z" fill="#F4A261" stroke="#2D2D2D" stroke-width="2" stroke-linejoin="round"/></svg>`),
  icon("book", "Libro", `<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 10h16c4 0 8 2 8 6v22c0-4-4-6-8-6H10V10Z" fill="#FFFFFF" stroke="#2D2D2D" stroke-width="2"/>
  <path d="M38 10H22c-4 0-8 2-8 6v22c0-4 4-6 8-6h16V10Z" fill="#E9C46A" stroke="#2D2D2D" stroke-width="2"/></svg>`),
];

function icon(id, label, svg) {
  return { id, label, svg };
}
