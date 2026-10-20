import { Building } from '@gamepark/paper-tales/material/Building'
import { ItemContext, Locator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import {
  getBuildingScale,
  getBuildingSlotCoordinates,
  getHoverShift,
  getKingdomScale,
  getPlayerPositionDependencies,
  getWarBuildingCoordinates,
  isBuildingsDisplayed,
  isKingdomDisplayed,
  isWarView,
  scaleTransform
} from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * Built buildings: each building has a fixed slot in the grid at the right of the kingdom. In the neighbours view,
 * they stand at the right of their kingdom at the same scale, cascaded in the order they were built.
 */
export class PlayerBuildingBoardLocator extends Locator {
  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    if (isWarView(context)) return getWarBuildingCoordinates(context, item.location.player, item.location.y ?? 0)
    return getBuildingSlotCoordinates(context, item.id as Building)
  }

  hide(item: MaterialItem, context: ItemContext) {
    return isWarView(context) ? !isKingdomDisplayed(context, item.location.player) : !isBuildingsDisplayed(context, item.location.player)
  }

  placeItem(item: MaterialItem, context: ItemContext) {
    const scale = isWarView(context) ? getKingdomScale(context, item.location.player) : getBuildingScale(context)
    return placeAtPanelWhenHidden(this, item, context, () => [...super.placeItem(item, context), ...scaleTransform(scale)])
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    const { x, y } = this.getItemCoordinates(item, context)
    const zoom = isWarView(context) ? 2.2 : 1.8
    const scale = isWarView(context) ? getKingdomScale(context, item.location.player) : getBuildingScale(context)
    const shift = getHoverShift({
      x,
      y,
      width: buildingCardDescription.width * scale,
      height: buildingCardDescription.height * scale,
      zoom
    })
    return ['translateZ(30em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, `scale(${zoom})`, ...shift]
  }
}

export const playerBuildingBoardLocator = new PlayerBuildingBoardLocator()
