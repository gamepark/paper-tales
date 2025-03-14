import { LocationType } from "@gamepark/paper-tales/material/LocationType";
import { MaterialType } from "@gamepark/paper-tales/material/MaterialType";
import { DropAreaDescription, getRelativePlayerIndex, HandLocator, ItemContext, MaterialContext } from "@gamepark/react-game";
import { Location, MaterialItem } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";


export class PlayerBuildingHandLocator extends HandLocator {

  getCoordinates(location: Location, context: ItemContext) {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return players === 4 ? { x: -16, y: -15 } : { x: -12, y: -22 }   // TDB
      case Position.BottomCenter:
        return { x: 4, y: 42 }    // TDB 
      case Position.TopRight:
        return players === 3 ? { x: -44, y: 3 } : players === 4 ? { x: 16, y: -15 } : { x: 12, y: -22 }   // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -36, y: -7 } : players === 3 ? { x: 4, y: 24 } : players === 4 ? { x: -37, y: 2 } : { x: -65, y: -8 }  // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 36, y: -7 } : players === 3 ? { x: 44, y: 3 } : players === 4 ? { x: 37, y: 2 } : { x: 65, y: -8 }    // TD > 2
    }
  }

  getRadius(location: Location, context: MaterialContext): number {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return players === 5 ? 500 : 1000   // TDB
      case Position.BottomCenter:
        return 1000    // TDB 
      case Position.TopRight:
        return (players === 3 || players === 5) ? 500 : 1000    // TDB
      case Position.BottomLeft:
        return players === 2 ? 1000 : players === 3 ? 1000 : 1000    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? 1000 : players === 3 ? 500 : 1000    // TD > 2
    }
  }

  getBaseAngle(location: Location, context: MaterialContext): number {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return 0
      case Position.BottomCenter:
        return 0
      case Position.TopRight:
        return players === 3 ? 0 : 0
      case Position.BottomLeft:
        return players === 2 ? 0 : players === 3 ? 0 : 0
      case Position.BottomRight:
        return players === 2 ? 0 : players === 3 ? 0 : 0
    }
  }

  locationDescription = new DropAreaDescription({ width: 20, height: 8, borderRadius: 0.4 })
  maxAngle: number=1
  

  getItemIndex(item: MaterialItem, context: ItemContext): number {
    const cards = context.rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(context.player).getItems().map(item => item.id)
    cards.sort((a, b) => a - b)
    return cards.indexOf(item.id)
  }
}

export const playerBuildingHandLocator = new PlayerBuildingHandLocator()

