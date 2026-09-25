const BASE_WIDTHS = [480, 960, 1600]

export function fileId(source, kokenId) {
  return `${source === 'grandtower' ? 'gt' : 'm'}-${kokenId}`
}

export function variantWidths(width) {
  const top = Math.min(width, 1600)
  return [...new Set([...BASE_WIDTHS.filter((w) => w < top), top])]
}

export function altText(title, index, total) {
  return total > 1 ? `${title} – Bild ${index} von ${total}` : title
}
