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
        return { x: -48, y: -40 }   // TDB
      case Position.TopCenter:
        return { x: -7, y: -40 }    // TDB 
      case Position.TopRight:
        return players === 3 ? { x: -44, y: 3 } : { x: -48, y: -15 }    // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -36, y: -7 } : players === 3 ? { x: 4, y: 22 } : { x: -48, y: -9 }    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 36, y: -7 } : players === 3 ? { x: 44, y: 3 } : { x: 58, y: -9 }    // TD > 2
    }
  }

  getRadius(location: Location, context: MaterialContext): number {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return 1000   // TDB
      case Position.TopCenter:
        return 1000    // TDB 
      case Position.TopRight:
        return players === 3 ? 500 : 1000    // TDB
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
      case Position.TopCenter:
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

