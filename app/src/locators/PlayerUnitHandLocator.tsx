import { DropAreaDescription, HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import {
  getKeptHandCoordinates,
  getPlayerPositionDependencies,
  isAreaDisplayed,
  isDraftRule,
  getHoverShift
} from './TableLayout'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * My kept cards: at the right of the draft fan during the recruitment, in its place otherwise
 */
export class PlayerUnitHandLocator extends HandLocator {
  radius = 125

  locationDescription = new DropAreaDescription({
    width: unitCardDescription.width * 2,
    height: unitCardDescription.height + 2,
    borderRadius: unitCardDescription.borderRadius
  })

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  getCoordinates(_location: Location, context: MaterialContext) {
    return { ...getKeptHandCoordinates(context), z: 1 }
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isAreaDisplayed(context, item.location.player)
  }

  getMaxAngle(location: Location, context: ItemContext): number {
    if (!isDraftRule(context)) return context.player === location.player ? 12 : 3
    // During the recruitment, my kept cards are a tight fan: it stays clear of the discard and its label at its right
    return context.player === location.player ? 1.6 : 1
  }

  // The card zooms in above its place in the hand, kept inside the table (the first card of a wide fan is near its left edge)
  getHoverTransform(item: MaterialItem, context: ItemContext): string[] {
    const { x = 0, y = 0 } = this.getItemCoordinates(item, context)
    const { width, height } = unitCardDescription
    const shift = getHoverShift({ x, y: y - height / 2, width, height, zoom: 2 })
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)', ...shift]
  }

  placeItem(item: MaterialItem, context: ItemContext): string[] {
    return placeAtPanelWhenHidden(this, item, context, () => super.placeItem(item, context))
  }
}

export const playerUnitHandLocator = new PlayerUnitHandLocator()
