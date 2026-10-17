import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { useRankedPlayers, useResultText } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { scoreTokenDescription } from '../material/ScoreTokenDescription'
import { tornDiscClip, paper, rust } from '../theme/tableTheme'
import { getColor } from '../utils/color'

/**
 * The left page of the last page of the story book (validated mockup docs/mockups/theme.html, direction B): « Fin », the
 * score marker of the winner on a disc of their colour, and the result. The framework shows the same header in the bar
 * at the top: there, only the text (the result dialog shows the rest, see theme/result.ts).
 */
export const ResultPage: FC = () => {
  const { t } = useTranslation()
  const resultText = useResultText()
  const winner = useRankedPlayers<PlayerColor>()[0]?.id
  return (
    <span css={pageCss}>
      <span css={endCss} data-book-only>{t('result.end', 'The End')}</span>
      {winner !== undefined && (
        <span css={discCss} data-book-only style={{ '--pc': getColor(winner).substring(0, 7) } as Record<string, string>}>
          <img src={scoreTokenDescription.images[winner]} alt="" />
        </span>
      )}
      <span data-book-text>{resultText}</span>
    </span>
  )
}

const pageCss = css`
  [data-book-only] {
    display: none;
  }
`

const endCss = css`
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 3.6em;
  line-height: 0.9;
  color: ${rust};
`

const discCss = css`
  position: relative;
  display: grid;
  place-items: center;
  width: 5em;
  height: 5em;

  &::before,
  &::after {
    content: '';
    position: absolute;
    clip-path: ${tornDiscClip};
  }

  &::before {
    inset: 0;
    background: var(--pc);
  }

  &::after {
    inset: 0.22em;
    background: ${paper};
  }

  > img {
    position: relative;
    z-index: 1;
    height: 3.3em;
    filter: drop-shadow(0 0.06em 0 #0006);
  }
`
