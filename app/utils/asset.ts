import type { FileAsset } from '~/types/content'

export function pickWidth(variants: number[], wanted = Number.POSITIVE_INFINITY): number {
  const sorted = [...variants].sort((a, b) => a - b)
  return sorted.find((w) => w >= wanted) ?? sorted[sorted.length - 1]!
}

export function assetUrl(file: FileAsset, width?: number): string {
  return `/media/${file.id}-${pickWidth(file.variants, width)}.webp`
}

export function assetSrcset(file: FileAsset): string {
  return [...file.variants].sort((a, b) => a - b).map((w) => `/media/${file.id}-${w}.webp ${w}w`).join(', ')
}
