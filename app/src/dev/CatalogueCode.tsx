import { Effect } from '@gamepark/paper-tales/material/effects/Effect'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { FC } from 'react'
import { codeCss } from './catalogue.css'
import { describeEffect } from './catalogueChecks'

type Production = { type: Resources[]; condition?: object } | Resources[] | undefined

/** What the code knows about a card, raw: each effect on one line, and the produced resources with their condition */
export const CatalogueCode: FC<{ effects?: Effect[]; resources?: Production | Production[] }> = ({ effects = [], resources }) => {
  const productions = (Array.isArray(resources) && resources.every((r) => Array.isArray(r) || r === undefined) ? resources : [resources]) as Production[]
  const lines = [
    ...effects.map(describeEffect),
    ...productions.flatMap((production, index) => {
      if (!production) return []
      const types = Array.isArray(production) ? production : production.type
      const condition = Array.isArray(production) ? undefined : production.condition
      const level = productions.length > 1 ? `level${index + 1} ` : ''
      return [`${level}resources=${types.map((r) => Resources[r]).join('+')}${condition ? ' ' + JSON.stringify(condition) : ''}`]
    })
  ]
  if (!lines.length) return null
  return (
    <code css={codeCss}>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </code>
  )
}
