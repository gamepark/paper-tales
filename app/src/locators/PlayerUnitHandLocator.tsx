import { DropAreaDescription, HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import {
  getHiddenHandCoordinates,
  getKeptHandCoordinates,
  getPlayerPositionDependencies,
  HIDDEN_HAND_SCALE,
  isAreaDisplayed,
  isDraftRule
} from './TableLayout'

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
    return context.player === location.player ? 4 : 1
  }

  getHoverTransform(item: MaterialItem, context: ItemContext): string[] {
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  // The kept cards of a Monarch whose area is not displayed stand on their panel (see getHiddenHandCoordinates)
  getItemCoordinates(item: MaterialItem, context: ItemContext) {
    return getHiddenHandCoordinates(context, item.location.player) ?? super.getItemCoordinates(item, context)
  }

  getItemRotateZ(item: MaterialItem, context: ItemContext): number {
    return getHiddenHandCoordinates(context, item.location.player) ? 0 : super.getItemRotateZ(item, context)
  }

  placeItem(item: MaterialItem, context: ItemContext): string[] {
    const transform = super.placeItem(item, context)
    return getHiddenHandCoordinates(context, item.location.player) ? [...transform, `scale(${HIDDEN_HAND_SCALE})`] : transform
  }
}

export const playerUnitHandLocator = new PlayerUnitHandLocator()
