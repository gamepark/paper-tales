import { getRelativePlayerIndex, Locator, MaterialContext } from "@gamepark/react-game";
import { Location } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";
import { unitCardDescription } from "../material/UnitCardDescription";

class PlayerUnitBoard extends Locator {

  getCoordinates(location: Location, context: MaterialContext) {
    const { x, y } = this.getBaseCoordinates(location, context)
    const playerIndex = getRelativePlayerIndex(context, location.player)
    const position = playerPositions[context.rules.players.length - 2][playerIndex]
    const signForMirror = (position === Position.BottomRight) ? -1 : 1

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
        return { x: -48, y: -40 }   // TDB
      case Position.TopCenter:
        return { x: -7, y: -40 }    // TDB 
      case Position.TopRight:
        return { x: -50, y: -25 }    // TDB
      case Position.BottomLeft:
        return players === 2 ? { x: -47, y:-36 } : players === 3 ? { x: -5, y: -4 } : { x: -48, y: -9 }    // TDB > 2
      case Position.BottomRight:
        return players === 2 ? { x: 47, y: -36 } : players === 3 ? { x: 50, y: -25 } : { x: 58, y: -9 }    // TD > 2
    }
  }

}

export const playerUnitBoard = new PlayerUnitBoard()