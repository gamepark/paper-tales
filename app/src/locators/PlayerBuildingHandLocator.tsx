import { Building } from '@gamepark/paper-tales/material/Building'
import { ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import { BUILDING_SCALE, getBuildingSlotCoordinates, getHoverShift, getPlayerPositionDependencies, isBuildingsDisplayed, scaleTransform } from './TableLayout'

/**
 * Buildings not built yet: the same fixed slot as once built, greyed out (see BuildingCardDescription)
 */
export class PlayerBuildingHandLocator extends Locator {
  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  getItemCoordinates(item: MaterialItem) {
    return getBuildingSlotCoordinates(item.id as Building)
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isBuildingsDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext) {
    return [...super.placeItem(item, context), ...scaleTransform(BUILDING_SCALE)]
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    const { x, y } = getBuildingSlotCoordinates(item.id as Building)
    const shift = getHoverShift({ x, y, width: buildingCardDescription.width * BUILDING_SCALE, height: buildingCardDescription.height * BUILDING_SCALE, zoom: 1.8 })
    return ['translateZ(30em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(1.8)', ...shift]
  }
}

export const playerBuildingHandLocator = new PlayerBuildingHandLocator()
