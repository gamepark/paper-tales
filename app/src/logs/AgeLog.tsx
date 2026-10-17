import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { MysticEffectType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { MaterialLogProps } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { useUnitName } from './useUnitName'
import { Who } from './Who'

/** A unit that dies at the Age (rulebook p.8), read on the game before it leaves the kingdom */
export const DeathLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const unitName = useUnitName()
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.itemIndex).getItem<Unit>()!
  return (
    <Trans
      i18nKey="log.age.dead"
      defaults="<who/> loses {unit}"
      values={{ unit: unitName(item.id) }}
      components={{ who: <Who player={item.location.player as PlayerColor} /> }}
    />
  )
}

/** A unit the Mystic keeps from dying */
export const SaveLog: FC<MaterialLogProps<CustomMove<MysticEffectType>>> = ({ move, context }) => {
  const unitName = useUnitName()
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.data.unitIndex).getItem<Unit>()!
  return (
    <Trans
      i18nKey="log.age.saved"
      defaults="<who/> saves {unit}"
      values={{ unit: unitName(item.id) }}
      components={{ who: <Who player={move.data.player} /> }}
    />
  )
}
