import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { HandLocator, ItemContext, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { getPlayerBoardPosition, isTopPlayer } from '../position/position.utils'

export class PlayerDraftHandLocator extends HandLocator {


  getCoordinates(location: Location, context: MaterialContext) {
    let { x = 0, y = 0 } = getPlayerBoardPosition(context, location.player)
    if (context.rules.players.length === 2) {
      x += 3
    } else {
      x += 15
    }

    if (isTopPlayer(context, location.player)) {
      y -= 12
    } else {
      y += 30
    }

    return { x: x, y: y, z: 0.05 }
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  radius = 125

  getMaxAngle(location: Location, context: ItemContext): number {
    if (isDraftRule(context)) return context.player === location.player? 13: 3
    return context.player === location.player? 5: 2
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
