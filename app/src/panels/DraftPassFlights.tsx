import { css, keyframes } from '@emotion/react'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { getDraftRecipient, getPanelCenter, getViewedPlayer, HIDDEN_HAND_SCALE } from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { TableAnchor } from '../table/TableAnchor'

/**
 * When the hands are passed during the recruitment, every Monarch gives their hand to their neighbour at the same time.
 * The rules move the hands one after the other, and the framework animates one move at a time: the hands passed between
 * the Monarchs whose area is not displayed are not animated by the moves (see PaperTalesAnimations), they are drawn
 * here, all together, each a small pack of cards flying from the panel of the Monarch who gives it to the panel of the
 * one who receives it. The hands that leave or reach the displayed area are animated by their moves.
 */
export const DraftPassFlights: FC = () => {
  const context = useMaterialContext()
  if (context.rules.game.rule?.id !== RuleId.GiveDraftToNeighbor) return null
  const displayed = getViewedPlayer(context)
  return (
    <>
      {context.rules.players.map((giver) => {
        const receiver = getDraftRecipient(context, giver)
        if (giver === displayed || receiver === displayed || receiver === giver) return null
        const from = getPanelCenter(context, giver)
        const to = getPanelCenter(context, receiver)
        if (!from || !to) return null
        return (
          <TableAnchor key={giver} position={from} css={flightCss(to.x - from.x, to.y - from.y)}>
            {[0, 1, 2].map((card) => (
              <img key={card} src={unitCardDescription.backImage} alt="" css={cardCss(card)} />
            ))}
          </TableAnchor>
        )
      })}
    </>
  )
}

const CARD_WIDTH = unitCardDescription.width * HIDDEN_HAND_SCALE
const CARD_HEIGHT = unitCardDescription.height * HIDDEN_HAND_SCALE

const flight = (dx: number, dy: number) => keyframes`
  0% { transform: translate(-50%, -50%); opacity: 0; }
  12% { opacity: 1; }
  50% { transform: translate(calc(-50% + ${dx / 2 + 2.5}em), calc(-50% + ${dy / 2}em)) scale(1.15); }
  88% { opacity: 1; }
  100% { transform: translate(calc(-50% + ${dx}em), calc(-50% + ${dy}em)); opacity: 0; }
`

// The pack bends away from the column on its way, so that two packs passing each other do not overlap
const flightCss = (dx: number, dy: number) => css`
  position: relative;
  width: ${CARD_WIDTH}em;
  height: ${CARD_HEIGHT}em;
  opacity: 0;
  pointer-events: none;
  animation: ${flight(dx, dy)} 1.1s ease-in-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const cardCss = (card: number) => css`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.15em;
  box-shadow: 0 0.05em 0.15em #0006;
  transform: rotate(${(card - 1) * 8}deg) translateX(${(card - 1) * 0.3}em);
`
