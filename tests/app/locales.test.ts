import { describe, it, expect } from 'vitest'
import de from '~~/i18n/locales/de.json'
import en from '~~/i18n/locales/en.json'

const keys = (o: Record<string, unknown>, p = ''): string[] =>
  Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' ? keys(v as Record<string, unknown>, `${p}${k}.`) : [`${p}${k}`]))
const get = (o: Record<string, unknown>, path: string) => path.split('.').reduce((acc: any, s) => acc?.[s], o)

describe('locale files', () => {
  it('have identical key sets', () => {
    expect(keys(en).sort()).toEqual(keys(de).sort())
  })
  it('have no empty strings', () => {
    for (const [name, file] of [['de', de], ['en', en]] as const) {
      expect(keys(file).filter((k) => get(file, k) === ''), name).toEqual([])
    }
  })
})
