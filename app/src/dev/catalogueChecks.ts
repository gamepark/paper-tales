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

