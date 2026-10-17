import { css } from '@emotion/react'
import { FC, ReactNode } from 'react'
import { bookSheetClip, ochre } from '../../../theme/tableTheme'

/** One line of the text printed on a card: an effect with the icon of its phase, or the scroll of its production */
export type PrintedLine = { phaseIcon?: string; production?: boolean; text: ReactNode }

/**
 * The text printed on the card, put forward on its own sheet: what the card does, as the player reads it on the card
 * (validated mockup docs/mockups/help-book.html, the printed text under the name).
 */
export const PrintedText: FC<{ lines: PrintedLine[] }> = ({ lines }) => {
  if (!lines.length) return null
  return (
    <div css={sheetCss}>
      {lines.map((line, index) => (
        <p key={index} css={[lineCss, line.production && productionCss]}>
          {line.phaseIcon && <img css={phaseCss} src={line.phaseIcon} alt="" />}
          <span>{line.text}</span>
        </p>
      ))}
    </div>
  )
}

const sheetCss = css`
  position: relative;
  isolation: isolate;
  display: grid;
  gap: 0.4em;
  margin: 0.6em 0 0.9em;
  padding: 0.7em 1.2em 0.65em 0.9em;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: #fffaf6;
    clip-path: ${bookSheetClip};
  }
`

const lineCss = css`
  display: flex;
  align-items: center;
  gap: 0.6em;
  margin: 0;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 600;
  font-size: 1.18em;
  line-height: 1.3;
  color: #4f4741;
`

/** The production, on the ochre scroll of the card */
const productionCss = css`
  width: fit-content;
  padding: 0.15em 0.8em;
  border-radius: 0.2em;
  background: ${ochre}55;
`

const phaseCss = css`
  flex: none;
  width: 2.3em;
`
