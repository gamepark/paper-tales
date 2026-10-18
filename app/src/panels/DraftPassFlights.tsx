import { css, keyframes } from '@emotion/react'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { getDraftRecipient, getPanelPosition, getPanelsOrder, getViewedPlayer, PANEL_HEIGHT, PANEL_WIDTH, PANEL_X } from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { TableAnchor } from '../table/TableAnchor'

/** The size of a pack of cards passed between two panels, as a ratio of a unit card */
const PACK_SCALE = 0.34
const PACK_WIDTH = unitCardDescription.width * PACK_SCALE
const PACK_HEIGHT = unitCardDescription.height * PACK_SCALE
/** The room at the right of the column, before the player area: where a pack goes from a panel to the next one */
const RIGHT_LANE_X = PANEL_X + PANEL_WIDTH + 2.4
/** The left edge of the column, along the line of the turn order that goes back to the first panel */
const LEFT_LANE_X = PANEL_X + 0.2
const FLIGHT = 1.4

type Point = { x: number; y: number }

/**
 * When the hands are passed during the recruitment, every Monarch gives their hand to their neighbour at the same time.
 * The rules move the hands one after the other, and the framework animates one move at a time: the hands passed between
 * the Monarchs whose area is not displayed are not animated by the moves (see PaperTalesAnimations), they are drawn
 * here, all together, each a small pack of cards that follows the turn order arrows. From a panel to the next one, it
 * comes out at the right of the panel and goes into the next one in an arc, in the room between the column and the
 * table; from the last panel to the first one, it goes along the line of the turn order, at the left of the column.
 * The hands that leave or reach the displayed area are animated by their moves.
 */
export const DraftPassFlights: FC = () => {
  const context = useMaterialContext()
  // Out of the pass, the back of a card stays drawn, invisible: decoded, it shows at once on the packs (without it, the
  // packs show their outline only for a moment)
  if (context.rules.game.rule?.id !== RuleId.GiveDraftToNeighbor) {
    return <img src={unitCardDescription.backImage} alt="" decoding="sync" css={warmCss} />
  }
  const displayed = getViewedPlayer(context)
  const order = getPanelsOrder(context)
  const centerY = (index: number) => getPanelPosition(index).y + PANEL_HEIGHT / 2
  return (
    <>
      {context.rules.players.map((giver) => {
        const receiver = getDraftRecipient(context, giver)
        if (giver === displayed || receiver === displayed || receiver === giver) return null
        const from = order.indexOf(giver)
        const to = order.indexOf(receiver)
        if (from === -1 || to === -1) return null
        const path: Point[] =
          Math.abs(from - to) === 1
            ? [
                { x: RIGHT_LANE_X - 3.5, y: centerY(from) },
                { x: RIGHT_LANE_X, y: (centerY(from) + centerY(to)) / 2 },
                { x: RIGHT_LANE_X - 3.5, y: centerY(to) }
              ]
            : [
                { x: LEFT_LANE_X + 3, y: centerY(from) },
                { x: LEFT_LANE_X, y: centerY(from) },
                { x: LEFT_LANE_X, y: centerY(to) },
                { x: LEFT_LANE_X + 3, y: centerY(to) }
              ]
        return (
          <TableAnchor key={giver} position={path[0]} css={flightCss(path)}>
            {[0, 1, 2].map((card) => (
              <img key={card} src={unitCardDescription.backImage} alt="" decoding="sync" css={cardCss(card)} />
            ))}
          </TableAnchor>
        )
      })}
    </>
  )
}

/** Through the points of the path, at an even pace: the pack shows at the start and fades at the end */
const flight = (path: Point[]) => {
  const lengths = path.slice(1).map((point, index) => Math.hypot(point.x - path[index].x, point.y - path[index].y))
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1
  let done = 0
  const frames = path.map((point, index) => {
    if (index > 0) done += lengths[index - 1]
    const at = Math.round((done / total) * 100)
    return `${at}% { transform: translate(calc(-50% + ${point.x - path[0].x}em), calc(-50% + ${point.y - path[0].y}em)); }`
  })
  return keyframes`
    ${frames.join('\n')}
    0% { opacity: 0; }
    6% { opacity: 1; }
    92% { opacity: 1; }
    100% { opacity: 0; }
  `
}

const flightCss = (path: Point[]) => css`
  position: relative;
  width: ${PACK_WIDTH}em;
  height: ${PACK_HEIGHT}em;
  opacity: 0;
  pointer-events: none;
  animation: ${flight(path)} ${FLIGHT}s ease-in-out forwards;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`

const warmCss = css`
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0.01;
  pointer-events: none;
`

const cardCss = (card: number) => css`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: 0.12em;
  box-shadow: 0 0.08em 0.2em #000a;
  outline: 0.08em solid #f6ece6;
  transform: translate(${card * 0.18}em, ${card * -0.12}em);
`
