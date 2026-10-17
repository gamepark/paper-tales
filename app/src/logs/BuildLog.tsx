import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { MaterialLogProps } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { Who } from './Who'

/** A construction: a Building built at level 1, directly at level 2, or upgraded (rulebook p.7) */
export const BuildLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const item = new PaperTalesRules(context.game).material(MaterialType.Building).index(move.itemIndex).getItem<Building>()!
  const values = { building: t(`building.${item.id}`) }
  const components = { who: <Who player={move.location.player as PlayerColor} /> }
  const fromHand = item.location.type === LocationType.PlayerBuildingHand
  if (!fromHand) return <Trans i18nKey="log.upgrade" defaults="<who/> upgrades {building} to level 2" values={values} components={components} />
  if (move.location.rotation)
    return <Trans i18nKey="log.build.level2" defaults="<who/> builds {building} directly at level 2" values={values} components={components} />
  return <Trans i18nKey="log.build" defaults="<who/> builds {building}" values={values} components={components} />
}
