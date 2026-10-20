import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Card } from '@gamepark/paper-tales/material/Artifact'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialLogProps } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { ReactivateUnitData } from '@gamepark/paper-tales/rules/CustomMoveType'
import { useUnitName } from './useUnitName'
import { Who } from './Who'

/** A unit revealed in a kingdom. Its face was hidden to the others until now: the move itself reveals its id */
export const DeployLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const unitName = useUnitName()
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).index(move.itemIndex).getItem<Card>()
  const unit = (item?.id ?? (move as MoveItem & { reveal?: { id?: Card } }).reveal?.id) as Card | undefined
  const who = <Who player={item?.location.player} />
  if (unit === undefined) return <Trans i18nKey="log.deploy.hidden" defaults="<who/> deploys a unit" components={{ who }} />
  return <Trans i18nKey="log.deploy" defaults="<who/> deploys {unit}" values={{ unit: unitName(unit) }} components={{ who }} />
}

/** The Shadow applies again the "when revealed" effects of a unit */
export const ReactivateLog: FC<MaterialLogProps<CustomMove>> = ({ move, context }) => {
  const unitName = useUnitName()
  const { unitIndex, player } = move.data as ReactivateUnitData
  const unit = new PaperTalesRules(context.game).material(MaterialType.Unit).getItem<Card>(unitIndex).id
  return <Trans i18nKey="log.reactivate" defaults="<who/> applies again the effects of {unit}" values={{ unit: unitName(unit) }} components={{ who: <Who player={player} /> }} />
}
