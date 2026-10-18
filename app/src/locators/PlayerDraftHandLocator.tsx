import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { draftHandCoordinates, getPlayerPositionDependencies, isAreaDisplayed } from './TableLayout'

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
    return !isAreaDisplayed(context, item.location.player)
  }

  /**
   * My fan of 5 cards (3 to 7 players) lies almost flat on a wide arc, so that the cards spread apart and stay readable,
   * the curve of the hand still showing. With 2 players, the 9 cards (rulebook p.8) keep a tighter arc: the row has no
   * room for them to spread more. The hands of the others stay small.
   */
  getRadius(location: Location, context: ItemContext): number {
    return this.isMyWideFan(location, context) ? 240 : this.radius
  }

  getGapMaxAngle(location: Location, context: ItemContext): number {
    return this.isMyWideFan(location, context) ? 1.8 : this.gapMaxAngle
  }

  getMaxAngle(location: Location, context: ItemContext): number {
    // 9 cards with 2 players (rulebook p.8): a wider fan keeps the Keep buttons apart
    if (context.player !== location.player) return 3
    return context.rules.players.length === 2 ? 20 : 12
  }

  private isMyWideFan(location: Location, context: ItemContext) {
    return context.player === location.player && context.rules.players.length > 2
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }
}

export const playerDraftHandLocator = new PlayerDraftHandLocator()
