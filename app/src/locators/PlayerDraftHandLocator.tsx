import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import {
  draftHandCoordinates,
  getPlayerPositionDependencies,
  isAreaDisplayed,
  twoPlayersDraftHandCoordinates,
  getHoverShift
} from './TableLayout'
import { unitCardDescription } from '../material/UnitCardDescription'
import { placeAtPanelWhenHidden } from './placeAtPanelWhenHidden'

/**
 * Cards to draft: a fan at the left of my hands row, during the recruitment only
 */
export class PlayerDraftHandLocator extends HandLocator {
  coordinates = { ...draftHandCoordinates, z: 0.05 }
  radius = 125

  getPositionDependencies(location: Location, context: MaterialContext) {
    return { ...getPlayerPositionDependencies(context), items: super.getPositionDependencies(location, context) }
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

export const playerDraftHandLocator = new PlayerDraftHandLocator()
