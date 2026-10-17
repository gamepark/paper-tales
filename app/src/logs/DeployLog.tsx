import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialLogProps } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { useUnitName } from './useUnitName'
import { Who } from './Who'

/** A unit revealed in a kingdom. Its face was hidden to the others until now: the move itself reveals its id */
export const DeployLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const unitName = useUnitName()
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.itemIndex).getItem<Unit>()
  const unit = (item?.id ?? (move as MoveItem & { reveal?: { id?: Unit } }).reveal?.id) as Unit | undefined
  const who = <Who player={item?.location.player} />
  if (unit === undefined) return <Trans i18nKey="log.deploy.hidden" defaults="<who/> deploys a unit" components={{ who }} />
  return <Trans i18nKey="log.deploy" defaults="<who/> deploys {unit}" values={{ unit: unitName(unit) }} components={{ who }} />
}
