import { getRelativePlayerIndex, Locator, MaterialContext } from "@gamepark/react-game";
import { Location } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";
import { unitCardDescription } from "../material/UnitCardDescription";

class PlayerUnitBoard extends Locator {

  getCoordinates(location: Location, context: MaterialContext) {
    const { x, y } = this.getBaseCoordinates(location, context)
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const signForMirror = context.rules.players.length === 3 
      ? (position === Position.BottomRight) ? -1 : 1
      : (position === Position.BottomRight || position === Position.TopRight) ? -1 : 1

    return {
      x: x + (signForMirror * location.x! * (unitCardDescription.width + 0.2)),
      y: y +  location.y! * (unitCardDescription.height + 0.2)
    }
  }


  getBaseCoordinates(location: Location, context: MaterialContext) {
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const players = context.rules.players.length
    switch (position) {
      case Position.TopLeft:
        return players === 4 ? { x: -48, y: -30 } : { x: -48, y: -40 }   // TDB
      case Position.TopCenter:
        return { x: -7, y: -40 }    // TDB 
      case Position.TopRight:
        return players === 3 ? { x: -50, y: -25 } : players === 4 ? { x: 48, y: -30 } : { x: -60, y: 15 }   // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -47, y:-36 } : players === 3 ? { x: -5, y: -4 } : players === 4 ? { x: -48, y: 15 } : { x: -48, y: -9 }    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 47, y: -36 } : players === 3 ? { x: 50, y: -25 } : players === 4 ? { x: 48, y: 15 } :{ x: 58, y: -9 }    // TD > 2
    }
  }

}

export const playerUnitBoard = new PlayerUnitBoard()