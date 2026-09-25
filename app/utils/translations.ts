export interface TranslationEntry { languages_code: string, [field: string]: unknown }

/** Directus-style translations: entry of the requested language, else German, else empty. */
export function pickTranslation<T extends TranslationEntry>(translations: T[] | undefined, locale: string): Partial<T> {
  if (!translations?.length) return {}
  return translations.find((t) => t.languages_code === locale) ?? translations.find((t) => t.languages_code === 'de') ?? {}
}
