import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { DropAreaDescription, ItemContext, ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import { isTopPlayer } from '../position/position.utils'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'


export class PlayerBuildingHandLocator extends ListLocator {

  locationDescription = new DropAreaDescription({ width: 20, height: 8, borderRadius: 0.4 })

  getGap(location: Location, context: MaterialContext) {
    if (location.player === context.player) return { y: this.isPlaying(location, context)? -(buildingCardDescription.height + 0.5): -1.5, z: -0.05 }

    return { y: 0.5 }
  }

  getRotateZ(location: Location, context: MaterialContext) {
    const isTopPlayers = isTopPlayer(context, location.player)
    if (isTopPlayers) return 180
    return super.getRotateZ(location, context)
  }

  getCoordinates(location: Location, context: ItemContext) {
    let { x = 0, y = 0, z = 0 } = playerDraftHandLocator.getCoordinates(location, context)

    x += 28
    if (this.isPlaying(location, context)) {
      x += 5
      z += 2
    }

    if (context.player !== location.player) {
      x -= 10
    } else {
      y += 3
    }

    return { x: x, y: y, z: z + 0.5 }
  }

  getItemIndex(item: MaterialItem, context: ItemContext): number {
    const cards = context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(context.player).getItems().map(item => item.id)
    cards.sort((a, b) => a - b)
    return cards.indexOf(item.id)
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    if (item.location.player !== context.player) return super.getHoverTransform(item, context)
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  private isPlaying(location: Location, context: MaterialContext) {
    return context.player
    && context.rules.game.rule?.id === RuleId.Build
    && location.player === context.player
    && context.rules.game.rule.players?.includes(context.player)
  }
}

export const playerBuildingHandLocator = new PlayerBuildingHandLocator()

