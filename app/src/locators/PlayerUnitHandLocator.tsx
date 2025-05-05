/** @jsxImportSource @emotion/react */
import { DropAreaDescription, HandLocator, ItemContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { unitCardDescription } from '../material/UnitCardDescription'
import { isTopPlayer } from '../position/position.utils'
import { isDraftRule, playerDraftHandLocator } from './PlayerDraftHandLocator'

export class PlayerUnitHandLocator extends HandLocator {
  locationDescription = new DropAreaDescription({
    width: unitCardDescription.width * 2,
    height: unitCardDescription.height + 2,
    borderRadius: unitCardDescription.borderRadius
  })

  getCoordinates(location: Location, context: ItemContext) {
    let { x = 0, y = 0 } = playerDraftHandLocator.getCoordinates(location, context)
    if (!isDraftRule(context)) return { x: x, y: y, z: 1 }
    x += context.player === location.player ? 36 : 30

    const isTopPlayers = isTopPlayer(context, location.player)
    if (context.rules.players.length > 3) {
      y += isTopPlayers ? 15 : -15.5
    } else {
      x += isTopPlayers ? -45 : 15
    }

    return { x: x, y: y, z: 1 }
  }

  getBaseAngle(location: Location, context: ItemContext): number {
    return playerDraftHandLocator.getBaseAngle(location, context)
  }

  radius = 125

  getMaxAngle(location: Location, context: ItemContext): number {
    if (!isDraftRule(context)) return context.player === location.player ? 13 : 3
    return context.player === location.player ? 3.5 : 1
  }

  getHoverTransform(item: MaterialItem, context: ItemContext): string[] {
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }
}

export const playerUnitHandLocator = new PlayerUnitHandLocator()
