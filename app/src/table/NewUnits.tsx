import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { getKingdomScale, getKingdomSlotCoordinates, getWarPlayers, isWarView } from '../locators/TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { ochre } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * Once the kingdoms are revealed, until the wars: the units laid this turn are outlined in gold, so that what is new in
 * each kingdom is seen at a glance (they were face down during the deployment)
 */
export const NewUnits: FC = () => {
  const context = useMaterialContext()
  const rule = context.rules.game.rule?.id as RuleId | undefined
  if ((rule !== RuleId.PayDeployedUnits && rule !== RuleId.DeployEffects) || !isWarView(context)) return null
  return (
    <>
      {getWarPlayers(context).map((player) => (
        <PlayerNewUnits key={player} player={player} />
      ))}
    </>
  )
}

const PlayerNewUnits: FC<{ player: PlayerColor }> = ({ player }) => {
  const context = useMaterialContext()
  const laid = context.rules.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
  const units = context.rules
    .material(MaterialType.Unit)
    .location(LocationType.PlayerUnitBoard)
    .player(player)
    .index((index) => laid.includes(index))
  const scale = getKingdomScale(context, player)
  const width = unitCardDescription.width * scale
  const height = unitCardDescription.height * scale
  const margin = 0.2 * scale
  return (
    <>
      {units.entries.map(([index, unit]) => {
        const slot = getKingdomSlotCoordinates(context, player, unit.location.x ?? 0, unit.location.y ?? 0)
        return (
          <TableAnchor key={index} position={{ x: slot.x - width / 2 - margin, y: slot.y - height / 2 - margin }} css={anchorCss}>
            <span css={outlineCss} style={{ width: `${width + 2 * margin}em`, height: `${height + 2 * margin}em` }} />
          </TableAnchor>
        )
      })}
    </>
  )
}

const comeIn = keyframes`
  from { opacity: 0; scale: 1.08; }
`

const anchorCss = css`
  pointer-events: none;
`

const outlineCss = css`
  display: block;
  box-sizing: border-box;
  border: 0.2em solid ${ochre};
  border-radius: 0.45em;
  animation: ${comeIn} 0.4s ease-out both;
`
