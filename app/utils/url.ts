// Social previews ignore relative og:image URLs – only emit them when the site URL is known.
export function absoluteUrl(siteUrl: string | undefined, path: string): string | undefined {
  return siteUrl ? new URL(path, siteUrl).href : undefined
}
