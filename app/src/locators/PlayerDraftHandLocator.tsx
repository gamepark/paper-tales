import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import {
  draftHandCoordinates,
  getHiddenHandCoordinates,
  getPlayerPositionDependencies,
  HIDDEN_HAND_SCALE,
  isAreaDisplayed,
  twoPlayersDraftHandCoordinates
} from './TableLayout'

/**
 * Cards to draft: a fan at the left of my hands row, during the recruitment only
 */
export class PlayerDraftHandLocator extends HandLocator {
  coordinates = { ...draftHandCoordinates, z: 0.05 }
  radius = 125

  getPositionDependencies(_location: Location, context: MaterialContext) {
    return getPlayerPositionDependencies(context)
  }

  getCoordinates(location: Location, context: MaterialContext) {
    return context.player === location.player && context.rules.players.length === 2 ? { ...twoPlayersDraftHandCoordinates, z: 0.05 } : this.coordinates
  }

  hide(item: MaterialItem, context: ItemContext) {
    return !isAreaDisplayed(context, item.location.player)
  }

  /**
   * My fan lies almost flat on a wide arc, so that the cards spread apart and stay readable, the curve of the hand still
   * showing: 5 cards from 3 to 7 players, 9 cards with 2 players (rulebook p.8), a little closer to fit between the left
   * edge and the kept cards. The hands of the others stay small.
   */
  getRadius(location: Location, context: ItemContext): number {
    if (!this.isMine(location, context)) return this.radius
    return context.rules.players.length === 2 ? 400 : 240
  }

  getGapMaxAngle(location: Location, context: ItemContext): number {
    if (!this.isMine(location, context)) return this.gapMaxAngle
    return context.rules.players.length === 2 ? 1.12 : 1.8
  }

  getMaxAngle(location: Location, context: ItemContext): number {
    // 9 cards with 2 players (rulebook p.8): a wider fan keeps the Keep buttons apart
    if (context.player !== location.player) return 3
    return context.rules.players.length === 2 ? 20 : 12
  }

  private isMine(location: Location, context: ItemContext) {
    return context.player === location.player
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return ['translateZ(20em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  // The cards to draft of a Monarch whose area is not displayed stand on their panel (see getHiddenHandCoordinates):
  // the hands passed during the recruitment fly from panel to panel
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

export const playerDraftHandLocator = new PlayerDraftHandLocator()
