import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { getPlayerBoardPosition, isTopPlayer } from '../position/position.utils'
import { isNotViewedPlayerItem } from '../view/viewHelpers'

export class PlayerDraftHandLocator extends HandLocator {
  hide(item: MaterialItem, context: ItemContext): boolean {
    return isNotViewedPlayerItem(item, context)
  }

  getCoordinates(location: Location, context: MaterialContext) {
    // Hand centré à (10, 23) sous le board joueur (board cells y:9.1..16.1).
    // Cards 10×14 → arc r=125 spread ~ ±19em horiz, donc spans x:[-9, 29], y:[16, 30].
    // Gap depuis building hand (right edge x=-16) : -9-(-16) = 7em.
    let { x = 0, y = 0 } = getPlayerBoardPosition(context, location.player)
    x += 10
    y += 23
    return { x: x, y: y, z: 0.05 }
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  radius = 125

  getMaxAngle(location: Location, context: ItemContext): number {
    if (isDraftRule(context)) return context.player === location.player ? 13 : 3
    return context.player === location.player ? 5 : 2
  }

  getBaseAngle(location: Location, context: ItemContext): number {
    return isTopPlayer(context, location.player) ? 180 : 0
  }
}

export const isDraftRule = (context: MaterialContext) => {
  const rule = context.rules.game.rule
  return rule && [RuleId.GiveDraftToNeighbor, RuleId.Draft, RuleId.Deal].includes(rule.id)
}

export const playerDraftHandLocator = new PlayerDraftHandLocator()
