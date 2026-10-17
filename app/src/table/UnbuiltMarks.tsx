import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { BUILDING_SCALE, getBuildingSlotCoordinates, getViewedPlayer, isBuildingsDisplayed } from '../locators/TableLayout'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import { Sash } from './Sash'

/**
 * The buildings not built yet of the displayed area carry a "Not built" band across them (rulebook p.7, construction).
 * Once built, the building leaves the hand and its band goes.
 */
export const UnbuiltMarks: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const player = getViewedPlayer(context)
  if (!isBuildingsDisplayed(context, player)) return null
  const width = buildingCardDescription.width * BUILDING_SCALE
  const height = buildingCardDescription.height * BUILDING_SCALE
  const label = t('building.unbuilt', 'Not built')
  return (
    <>
      {context.rules
        .material(MaterialType.Building)
        .location(LocationType.PlayerBuildingHand)
        .player(player)
        .getItems<Building>()
        .map((building) => {
          const { x, y } = getBuildingSlotCoordinates(building.id)
          return <Sash key={building.id} rect={{ x: x - width / 2, y: y - height / 2, width, height }} label={label} />
        })}
    </>
  )
}
