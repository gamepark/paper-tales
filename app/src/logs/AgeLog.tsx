import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MysticEffectType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useUnitName } from './useUnitName'

/** A unit that dies at the Age (rulebook p.8), read on the game before it leaves the kingdom */
export const DeathLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const unitName = useUnitName()
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.itemIndex).getItem<Unit>()!
  const name = usePlayerName(item.location.player)
  return <>{t('log.age.dead', { defaultValue: '{player} loses {unit}', player: name, unit: unitName(item.id) })}</>
}

/** A unit the Mystic keeps from dying */
export const SaveLog: FC<MaterialLogProps<CustomMove<MysticEffectType>>> = ({ move, context }) => {
  const { t } = useTranslation()
  const unitName = useUnitName()
  const name = usePlayerName(move.data.player)
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.data.unitIndex).getItem<Unit>()!
  return <>{t('log.age.saved', { defaultValue: '{player} saves {unit}', player: name, unit: unitName(item.id) })}</>
}
