// utilitário de cores sem libs externas
export function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

export function clamp(n: number, min = 0, max = 255) {
  return Math.max(min, Math.min(max, n));
}

// shade: negativo = escurecer, positivo = clarear (0..1)
export function shade(hex: string, amount = -0.1) {
  if (hex.startsWith('rgb')) return hex; // respeita cores já em rgb()
  const { r, g, b } = hexToRgb(hex);
  const m = amount;
  const rr = clamp(m >= 0 ? r + (255 - r) * m : r * (1 + m));
  const gg = clamp(m >= 0 ? g + (255 - g) * m : g * (1 + m));
  const bb = clamp(m >= 0 ? b + (255 - b) * m : b * (1 + m));
  return `rgb(${Math.round(rr)}, ${Math.round(gg)}, ${Math.round(bb)})`;
}

// alpha: aplica transparência a uma cor base (hex ou rgb)
export function alpha(color: string, a = 0.15) {
  if (color.startsWith('rgb')) {
    const content = color.replace(/[^\d,]/g, '');
    const [r, g, b] = content.split(',').map((v) => Number(v.trim()));
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }
  const { r, g, b } = hexToRgb(color);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}
