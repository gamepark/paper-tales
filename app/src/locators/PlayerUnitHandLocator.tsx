import { LocationType } from "@gamepark/paper-tales/material/LocationType";
import { MaterialType } from "@gamepark/paper-tales/material/MaterialType";
import { DropAreaDescription, getRelativePlayerIndex, HandLocator, ItemContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";

export class PlayerUnitHandLocator extends HandLocator {

  locationDescription = new PlayerUnitHandDescription()

  getCoordinates(location: Location, context: ItemContext) {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return { x: -48, y: -40 }   // TDB
      case Position.TopCenter:
        return { x: -7, y: -40 }    // TDB 
      case Position.TopRight:
        return { x: 58, y: -40 }    // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -20, y: 20 } : players === 3 ? { x: -30, y: -9 } : { x: -48, y: -9 }    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 40, y: 20 } : players === 3 ? { x: 40, y: -9 } : { x: 58, y: -9 }    // TD > 2
    }
  }

    getItemIndex(item: MaterialItem, context: ItemContext): number {
        if (item.location.player === context.player) {
          const cards = context.rules.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(context.player).getItems().map(item => item.id)
          cards.sort((a, b) => a - b)
          return cards.indexOf(item.id)
        } else {
          return super.getItemIndex(item, context)
        }
      }

}

class PlayerUnitHandDescription extends DropAreaDescription {
  
}

export const playerUnitHandLocator = new PlayerUnitHandLocator()