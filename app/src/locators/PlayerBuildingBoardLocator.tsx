import { Locator } from "@gamepark/react-game";
import { getRelativePlayerIndex, MaterialContext } from "@gamepark/react-game";
import { Location } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";
import { buildingCardDescription } from "../material/BuildingCardDescription";



export class PlayerBuildingBoardLocator extends Locator {



    getCoordinates(location: Location, context: MaterialContext) {
        const { x, y } = this.getBaseCoordinates(location, context)
        return {
            x: x,
            y: y + location.y! * (buildingCardDescription.height + 0.2)
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
                return { x: 58, y: -40 }    // TDB
            case Position.BottomLeft:
                return players === 2 ? { x: -50, y: -20 } : players === 3 ? { x: -30, y: -9 } : { x: -48, y: -9 }    // TDB > 2
            case Position.BottomRight:
                return players === 2 ? { x: 50, y: -20 } : players === 3 ? { x: 40, y: -9 } : { x: 58, y: -9 }    // TD > 2
        }
    }

}


export const playerBuldingBoard = new PlayerBuildingBoardLocator()








