import { css } from '@emotion/react'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getPanelPosition, getPanelsOrder, getRound, PANEL_HEIGHT, PANEL_WIDTH, PANEL_X } from '../locators/TableLayout'
import { TableAnchor } from '../table/TableAnchor'
import { paper } from '../theme/tableTheme'

/** Room at the left of the column for the line that goes back from the last panel to the first one */
const RETURN_X = 0.32

/**
 * The round of the table, in the column of panels (laid in seating order): a small chevron between two panels, and a
 * thin line at the left that goes back from the last panel to the first one. They point the way the cards go this
 * round: to the left (down the column) on rounds 1 and 3, to the right (up) on rounds 2 and 4 (rulebook p.5).
 * At 2 players everyone passes to the only other Monarch: no arrows.
 */
export const TurnOrderArrows: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const count = getPanelsOrder(context).length
  if (count < 3) return null
  const down = getRound(context) % 2 === 1
  const title = down ? t('panel.order.left', 'The cards go to the left this round') : t('panel.order.right', 'The cards go to the right this round')
  const first = getPanelPosition(0)
  const last = getPanelPosition(count - 1)
  const top = first.y + PANEL_HEIGHT / 2
  const bottom = last.y + PANEL_HEIGHT / 2
  const height = bottom - top
  const width = PANEL_X - RETURN_X
  return (
    <>
      {Array.from({ length: count - 1 }, (_, index) => {
        const y = (getPanelPosition(index).y + PANEL_HEIGHT + getPanelPosition(index + 1).y) / 2
        return (
          <TableAnchor key={index} position={{ x: PANEL_X + PANEL_WIDTH / 2, y }} css={chevronCss} title={title}>
            <svg viewBox="0 0 2 1" css={[chevronSvgCss, !down && upCss]}>
              <path d="M 0.2 0.15 L 1 0.85 L 1.8 0.15" />
            </svg>
          </TableAnchor>
        )
      })}
      <TableAnchor position={{ x: RETURN_X, y: top }} css={returnCss} title={title}>
        <svg viewBox={`0 0 ${width} ${height}`} width={`${width}em`} height={`${height}em`} css={returnSvgCss}>
          <path d={`M ${width} ${height} H 0.3 Q 0 ${height} 0 ${height - 0.3} V 0.3 Q 0 0 0.3 0 H ${width}`} />
          {/* The head, as big as a chevron between the panels, pointing into the panel the cards come back to */}
          {down ? (
            <path d={`M ${width - 0.36} -0.42 L ${width} 0 L ${width - 0.36} 0.42`} />
          ) : (
            <path d={`M ${width - 0.36} ${height - 0.42} L ${width} ${height} L ${width - 0.36} ${height + 0.42}`} />
          )}
        </svg>
      </TableAnchor>
    </>
  )
}

const chevronCss = css`
  transform: translate(-50%, -50%);
  pointer-events: auto;
`

const chevronSvgCss = css`
  display: block;
  width: 1.3em;
  height: 0.65em;
  overflow: visible;
  fill: none;
  stroke: ${paper};
  stroke-width: 0.26;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0.06em 0.08em 0 #00000059);
`

const upCss = css`
  rotate: 180deg;
`

const returnCss = css`
  transform: translateY(0);
`

const returnSvgCss = css`
  display: block;
  overflow: visible;
  fill: none;
  stroke: ${paper};
  /* As thick as the chevrons, with the same shadow: one sign, all along the round of the table */
  stroke-width: 0.17;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0.06em 0.08em 0 #00000059);
`
