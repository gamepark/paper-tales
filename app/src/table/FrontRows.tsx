import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { getKingdomScale, getKingdomSlotCoordinates, getWarPlayers, isWarView } from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { rust } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'
import { useWarReplays, useWarsTold, WAR_RESULTS_AT } from './warPace'

/**
 * The first beat of the wars: the front row of each kingdom, the one that fights (rulebook p.6), outlined while the
 * strengths come in, until the first war is told
 */
export const FrontRows: FC = () => {
  const context = useMaterialContext()
  const told = useWarsTold(context)
  const replays = useWarReplays()
  if (!told || !isWarView(context)) return null
  return (
    <>
      {getWarPlayers(context).map((player) => (
        <FrontRow key={`${player}-${replays}`} player={player} />
      ))}
    </>
  )
}

const FrontRow: FC<{ player: PlayerColor }> = ({ player }) => {
  const context = useMaterialContext()
  const scale = getKingdomScale(context, player)
  // The 5th space, at the right of the front row, once a unit stands there
  const fifth = context.rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).location((location) => location.x === 2).length > 0
  const first = getKingdomSlotCoordinates(context, player, 0, 0)
  const last = getKingdomSlotCoordinates(context, player, fifth ? 2 : 1, 0)
  const width = unitCardDescription.width * scale
  const height = unitCardDescription.height * scale
  const margin = 0.3 * scale
  return (
    <TableAnchor position={{ x: first.x - width / 2 - margin, y: first.y - height / 2 - margin }} css={anchorCss}>
      <span css={outlineCss} style={{ width: `${last.x - first.x + width + 2 * margin}em`, height: `${height + 2 * margin}em` }} />
    </TableAnchor>
  )
}

const shown = keyframes`
  0% { opacity: 0; }
  10% { opacity: 1; }
  85% { opacity: 1; }
  100% { opacity: 0; }
`

const anchorCss = css`
  pointer-events: none;
`

/** A dashed rust frame around the row, as on the mockups */
const outlineCss = css`
  display: block;
  box-sizing: border-box;
  border: 0.18em dashed ${rust};
  border-radius: 0.5em;
  background: ${rust}1f;
  animation: ${shown} ${WAR_RESULTS_AT[0]}s ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01s;
  }
`
