import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { draftHandCoordinates, getPlayerPositionDependencies, isMyAreaDisplayed } from './TableLayout'

/**
 * Cards to draft: a fan at the left of my hands row, during the recruitment only
 */
export class PlayerDraftHandLocator extends HandLocator {
  coordinates = { ...draftHandCoordinates, z: 0.05 }
  radius = 125

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isMyAreaDisplayed(context, item.location.player)
  }

  getMaxAngle(location: Location, context: ItemContext): number {
    // 9 cards with 2 players (rulebook p.8): a wider fan keeps the Keep buttons apart
    if (context.player !== location.player) return 3
    return context.rules.players.length === 2 ? 20 : 12
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }
}

export const playerDraftHandLocator = new PlayerDraftHandLocator()
