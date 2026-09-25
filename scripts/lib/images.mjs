import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { variantWidths } from './files.mjs'

// Returns { width, height, variants } of the (cropped) master.
export async function processImage({ input, id, outDir, cropLeft = 0 }) {
  const master = await sharp(input, { failOn: 'none' }).rotate().toColourspace('srgb').toBuffer()
  let img = sharp(master)
  let { width, height } = await img.metadata()
  if (cropLeft > 0) {
    const left = Math.round(width * cropLeft)
    img = sharp(await img.extract({ left, top: 0, width: width - left, height }).toBuffer())
    width -= left
  }
  const variants = variantWidths(width)
  for (const w of variants) {
    const out = path.join(outDir, `${id}-${w}.webp`)
    if (fs.existsSync(out)) continue
    await img.clone().resize({ width: w }).webp({ quality: 78 }).toFile(out)
  }
  return { width, height, variants }
}

// Black-on-white JPG logo → black-on-transparent PNG (inverted to white in dark mode via CSS).
export async function processLogo(input, output) {
  const { data, info } = await sharp(input).greyscale().resize({ height: 256 }).raw().toBuffer({ resolveWithObject: true })
  const rgba = Buffer.alloc(info.width * info.height * 4)
  for (let i = 0; i < info.width * info.height; i++) {
    const a = 255 - data[i]
    rgba[i * 4 + 3] = a < 24 ? 0 : Math.min(255, Math.round(a * 1.15))
  }
  await sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).trim().png().toFile(output)
}
