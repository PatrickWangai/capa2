// Clamp a client-supplied ?limit= so it can't be used to force an unbounded
// table scan (e.g. ?limit=999999).
export function clampLimit(value, def, max = 200) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
}

export function clampOffset(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}
