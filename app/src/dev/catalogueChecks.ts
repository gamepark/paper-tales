import { Effect, EffectType } from '@gamepark/paper-tales/material/effects/Effect'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { i18n } from 'i18next'
import { helpIconComponents } from '../material/help/book/helpIconComponents'

/** The icon tags a printed text can use (translation components of the help pages) */
const knownTags = new Set(Object.keys(helpIconComponents))

/** Checks of a printed text: it exists in the language, and every icon it uses has a component */
export const textIssues = (i18n: i18n, lng: string, key: string): string[] => {
  if (!i18n.exists(key, { lng })) return [`clé manquante : ${key}`]
  const text = i18n.getFixedT(lng)(key)
  const unknown = [...text.matchAll(/<([a-z0-9]+)\/>/g)].map(([, tag]) => tag).filter((tag) => !knownTags.has(tag))
  return unknown.map((tag) => `icône inconnue <${tag}/> dans ${key}`)
}

/** What the code knows about an effect, in one line: its type and its fields, resources by their name */
export const describeEffect = (effect: Effect): string => {
  const { type, ...fields } = effect
  const show = (key: string, value: unknown): string => {
    if (/resource/i.test(key) || key === 'ifResource' || key === 'perResource') {
      const list = Array.isArray(value) ? value : [value]
      return list.map((resource) => Resources[resource as Resources] ?? String(resource)).join('+')
    }
    return Array.isArray(value) ? value.join(',') : String(value)
  }
  const details = Object.entries(fields).map(([key, value]) => `${key}=${show(key, value)}`)
  return [EffectType[type], ...details].join(' ')
}
