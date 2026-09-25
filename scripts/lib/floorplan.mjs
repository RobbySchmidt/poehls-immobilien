// Floor plans (Grundrisse) make poor cover images: detect them from pixel statistics.
// Tuned on the legacy images: below 11 % mid-tones there is no photo, only plans.
// Densely hatched plans slip through and simply keep their original position.

// `rgb` = raw RGB buffer of a small thumbnail.
export function looksLikeFloorPlan(rgb) {
  const n = rgb.length / 3
  let white = 0
  let mid = 0
  let satSum = 0
  for (let i = 0; i < n; i++) {
    const r = rgb[i * 3], g = rgb[i * 3 + 1], b = rgb[i * 3 + 2]
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    const y = 0.3 * r + 0.59 * g + 0.11 * b
    if (min > 225) white++
    if (y > 90 && y < 200) mid++
    satSum += max === 0 ? 0 : (max - min) / max
  }
  return white / n > 0.45 && satSum / n < 0.08 && mid / n < 0.11
}

export function orderPhotosFirst(ids, plans) {
  return [...ids.filter((id) => !plans.has(id)), ...ids.filter((id) => plans.has(id))]
}
