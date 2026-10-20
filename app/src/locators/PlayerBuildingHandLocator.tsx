import { Building } from '@gamepark/paper-tales/material/Building'
import { ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import {
  getBuildingHoverZoom,
  getBuildingScale,
  getBuildingSlotCoordinates,
  getHoverShift,
  getPlayerPositionDependencies,
  isBuildingsDisplayed,
  scaleTransform
} from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * Buildings not built yet: the same fixed slot as once built, greyed out (see BuildingCardDescription)
 */
export class PlayerBuildingHandLocator extends Locator {
  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    return getBuildingSlotCoordinates(context, item.id as Building)
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isBuildingsDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext) {
    return placeAtPanelWhenHidden(this, item, context, () => [...super.placeItem(item, context), ...scaleTransform(getBuildingScale(context))])
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    const { x, y } = getBuildingSlotCoordinates(context, item.id as Building)
    const scale = getBuildingScale(context)
    const zoom = getBuildingHoverZoom(context)
    const shift = getHoverShift({ x, y, width: buildingCardDescription.width * scale, height: buildingCardDescription.height * scale, zoom })
    return ['translateZ(30em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, `scale(${zoom})`, ...shift]
  }
}

export const playerBuildingHandLocator = new PlayerBuildingHandLocator()
