import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { DropAreaDescription, ItemContext, ListLocator, MaterialContext } from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { buildingCardDescription } from '../material/BuildingCardDescription'
import { isNotViewedPlayerItem } from '../view/viewHelpers'

export class PlayerBuildingHandLocator extends ListLocator {
  hide(item: MaterialItem, context: ItemContext): boolean {
    return isNotViewedPlayerItem(item, context)
  }

  locationDescription = new DropAreaDescription({
    width: 20,
    height: 8,
    borderRadius: 0.4
  })

  getGap(location: Location, context: MaterialContext) {
    if (location.player === context.player)
      return {
        y: this.isPlaying(location, context) ? -(buildingCardDescription.height + 0.5) : -1.2,
        z: -0.05
      }

    return { y: 0.5 }
  }

  // Colonne gauche, sous la building board. Card 14×10, base (-23, 22) :
  // spans x:[-30, -16], y:[17, 27]. Au-dessus du yMax=28, sous building board (qui finit à y=10).
  getCoordinates(_location: Location, _context: ItemContext) {
    return { x: -23, y: 22, z: 0.5 }
  }

  getItemIndex(building: MaterialItem<PlayerColor, LocationType>, context: ItemContext): number {
    return context.rules
      .material(MaterialType.Building)
      .location(LocationType.PlayerBuildingHand)
      .player(context.player)
      .getItems<Building>()
      .findIndex((item) => item.id === building.id)
  }

  getHoverTransform(item: MaterialItem, context: ItemContext) {
    if (item.location.player !== context.player) return super.getHoverTransform(item, context)
    return ['translateZ(10em)', `rotateZ(${-this.getItemRotateZ(item, context)}${this.rotationUnit})`, 'scale(2)', 'translateY(-25%)']
  }

  private isPlaying(location: Location, context: MaterialContext) {
    return (
      context.player &&
      context.rules.game.rule?.id === RuleId.Build &&
      location.player === context.player &&
      context.rules.game.rule.players?.includes(context.player)
    )
  }
}

export const playerBuildingHandLocator = new PlayerBuildingHandLocator()
