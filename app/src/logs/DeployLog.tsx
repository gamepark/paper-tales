import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useUnitName } from './useUnitName'

/** A unit revealed in a kingdom. Its face was hidden to the others until now: the move itself reveals its id */
export const DeployLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const unitName = useUnitName()
  const name = usePlayerName(move.location.player)
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.itemIndex).getItem<Unit>()
  const unit = (item?.id ?? (move as MoveItem & { reveal?: { id?: Unit } }).reveal?.id) as Unit | undefined
  if (unit === undefined) return <>{t('log.deploy.hidden', { defaultValue: '{player} deploys a unit', player: name })}</>
  return <>{t('log.deploy', { defaultValue: '{player} deploys {unit}', player: name, unit: unitName(unit) })}</>
}
