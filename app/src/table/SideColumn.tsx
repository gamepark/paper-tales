import { css, keyframes } from '@emotion/react'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import time1 from '../images/time/time1.png'
import time2 from '../images/time/time2.png'
import time3 from '../images/time/time3.png'
import time4 from '../images/time/time4.png'
import { deckLabelPosition, discardLabelPosition, getRound, SIDE_COLUMN_WIDTH, sideColumnPosition } from '../locators/TableLayout'
import { captionCss, ochre } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

// The open book of the rulebook (p.3), with the number of the turn and the direction of the draft (p.5)
const turnImages = [time1, time2, time3, time4]

/**
 * The top of the right column: the current turn, drawn as the book printed on the score track. It swells and glows
 * when the turn changes, so that the change is noticed.
 */
export const SideColumn: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const round = getRound(context)
  const title = t('turn.counter', { defaultValue: 'Turn {turn} / {total}', turn: round, total: turnImages.length })
  return (
    <>
      <TableAnchor position={sideColumnPosition} css={columnCss}>
        <img key={round} src={turnImages[round - 1]} alt={title} title={title} css={turnCss} />
        <div css={captionCss}>{title}</div>
      </TableAnchor>
      <TableAnchor position={deckLabelPosition} css={columnCss}>
        <div css={captionCss}>{t('side.deck', 'Deck')}</div>
      </TableAnchor>
      <TableAnchor position={discardLabelPosition} css={columnCss}>
        <div css={captionCss}>{t('side.discard', 'Discard')}</div>
      </TableAnchor>    </>
  )
}

const columnCss = css`
  width: ${SIDE_COLUMN_WIDTH}em;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5em;
`

const turnChange = keyframes`
  0% { transform: scale(0.8); filter: grayscale(0.6) brightness(0.75); }
  40% { transform: scale(1.2); filter: drop-shadow(0 0 0.8em ${ochre}) brightness(1.15); }
  100% { transform: scale(1); filter: drop-shadow(0 0 0.3em ${ochre}); }
`

const turnCss = css`
  width: 7em;
  filter: drop-shadow(0 0 0.3em ${ochre});
  animation: ${turnChange} 1.2s ease-out;
`
