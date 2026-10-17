import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

/** A construction: a Building built at level 1, directly at level 2, or upgraded (rulebook p.7) */
export const BuildLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const name = usePlayerName(move.location.player)
  const item = new PaperTalesRules(context.game).material(MaterialType.Building).index(move.itemIndex).getItem<Building>()!
  const building = t(`building.${item.id}`)
  const fromHand = item.location.type === LocationType.PlayerBuildingHand
  if (!fromHand) return <>{t('log.upgrade', { defaultValue: '{player} upgrades {building} to level 2', player: name, building })}</>
  if (move.location.rotation) return <>{t('log.build.level2', { defaultValue: '{player} builds {building} directly at level 2', player: name, building })}</>
  return <>{t('log.build', { defaultValue: '{player} builds {building}', player: name, building })}</>
}
