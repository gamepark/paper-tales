import { css } from '@emotion/react'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import { helpIconComponents } from './helpIconComponents'

type Symbol = { tag: string; key: string; count?: number }

/**
 * The symbols specific to the card effects, which a player cannot guess. The common ones (resources, gold, points,
 * strength) are not explained.
 */
const describe = (tag: string): Symbol | undefined => {
  if (['deploy', 'ageplus', 'b1', 'b2'].includes(tag)) return { tag, key: tag }
  const phase = tag.match(/^phase(\d)$/)
  return phase ? { tag, key: `phase${phase[1]}` } : undefined
}

/** The icons used by the given printed texts, in reading order, each once */
const usedSymbols = (texts: string[]) => {
  const symbols: Symbol[] = []
  for (const text of texts) {
    for (const [, tag] of text.matchAll(/<([a-z0-9]+)\/>/g)) {
      const symbol = describe(tag)
      if (symbol && !symbols.some((known) => known.tag === tag)) symbols.push(symbol)
    }
  }
  return symbols
}

/** A small grey line under a printed effect: each of its icons and what it means */
export const SymbolLegend: FC<{ texts: string[] }> = ({ texts }) => {
  const { t } = useTranslation()
  const symbols = usedSymbols(texts)
  if (!symbols.length) return null
  return (
    <span css={legendCss}>
      {symbols.map((symbol, index) => (
        <Fragment key={symbol.tag}>
          {index > 0 && ' · '}
          <span css={itemCss}>
            {helpIconComponents[symbol.tag as keyof typeof helpIconComponents]} {t(`help.symbol.${symbol.key}`, { count: symbol.count })}
          </span>
        </Fragment>
      ))}
    </span>
  )
}

const legendCss = css`
  display: block;
  margin-top: 0.25em;
  font-family: 'Mulish', sans-serif;
  --icon-shift: -0.15em;
  font-weight: 500;
  font-size: 0.82em;
  line-height: 1.6;
  color: #7a6f67;
`

const itemCss = css`
  white-space: nowrap;
`
