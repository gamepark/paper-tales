import { css } from '@emotion/react'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { helpIconComponents } from './helpIconComponents'

/** The symbols of the printed texts that need a word, each with its meaning */
const symbols = ['deploy', 'ageplus'] as const

/** Which of these symbols the given printed texts use */
const usedSymbols = (texts: string[]) => symbols.filter((symbol) => texts.some((text) => text.includes(`<${symbol}/>`)))

/** A small legend under the timeline: what each symbol of the card means */
export const SymbolLegend: FC<{ texts: string[] }> = ({ texts }) => {
  const used = usedSymbols(texts)
  if (!used.length) return null
  return (
    <div css={legendCss}>
      {used.map((symbol) => (
        <p key={symbol} css={lineCss}>
          <Trans
            i18nKey={`help.symbol.${symbol}`}
            defaults={symbol === 'deploy' ? '<deploy/>: when the card is revealed, once.' : '<ageplus/>: place an Age token.'}
            components={helpIconComponents}
          />
        </p>
      ))}
    </div>
  )
}

const legendCss = css`
  display: grid;
  gap: 0.2em;
  margin: -0.6em 0 1em 0.4em;
`

const lineCss = css`
  margin: 0;
  font-size: 0.88em;
  color: #6b6058;
`
