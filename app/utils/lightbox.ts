// Pure helpers for the lightbox (after Praxis-Websites features/gallery/Lightbox.vue).

export interface FitSize { width: number, height: number }

/** Like object-fit: contain, but the image ends up exactly as large as its visible part,
 *  so the radius sits on the image corners instead of a letterbox. */
export function fitContain(boxW: number, boxH: number, ratio: number): FitSize {
  if (!(boxW > 0) || !(boxH > 0)) return { width: 0, height: 0 }
  const r = ratio > 0 && Number.isFinite(ratio) ? ratio : 1.5
  let width = boxW
  let height = boxW / r
  if (height > boxH) {
    height = boxH
    width = boxH * r
  }
  return { width: Math.floor(width), height: Math.floor(height) }
}

/** Paging with wrap-around: after the last image comes the first. */
export function wrapIndex(index: number, count: number): number {
  if (!(count > 0)) return 0
  return ((index % count) + count) % count
}
