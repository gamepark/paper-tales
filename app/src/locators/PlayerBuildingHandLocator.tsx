import { LocationType } from "@gamepark/paper-tales/material/LocationType";
import { MaterialType } from "@gamepark/paper-tales/material/MaterialType";
import { DropAreaDescription, getRelativePlayerIndex, HandLocator, ItemContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";





export class PlayerBuildingHandLocator extends HandLocator {



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
        return players === 2 ? { x: -40, y: 15, z: 0 } : players === 3 ? { x: -30, y: -9 } : { x: -48, y: -9 }    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 40, y: 15, z: 0 } : players === 3 ? { x: 40, y: -9 } : { x: 58, y: -9 }    // TD > 2
    }
  }


  locationDescription = new DropAreaDescription({ width: 20, height: 8, borderRadius: 0.4 })
  radius = 80

  getItemIndex(item: MaterialItem, context: ItemContext): number {

    const cards = context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(context.player).getItems().map(item => item.id)
    cards.sort((a, b) => a - b)
    return cards.indexOf(item.id)

  }





}




export const playerBuildingHandLocator = new PlayerBuildingHandLocator()

