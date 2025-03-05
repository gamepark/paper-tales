import { ListLocator } from "@gamepark/react-game";
import { getRelativePlayerIndex, MaterialContext } from "@gamepark/react-game";
import { Coordinates, Location } from "@gamepark/rules-api";
import { playerPositions, Position } from "./TableauLocator";
import { buildingCardDescription } from "../material/BuildingCardDescription";



export class PlayerBuildingBoardLocator extends ListLocator {

    getGap(location: Location, context: MaterialContext): Partial<Coordinates> {
        const players = context.rules.players.length
        const playerIndex = getRelativePlayerIndex(context, location.player)
        const position = playerPositions[context.rules.players.length - 2][playerIndex]
        if (players === 2) {
            return { y: buildingCardDescription.height + 0.05 }
        } else {
            return position === Position.BottomLeft 
                ? { y: buildingCardDescription.height + 0.05 } 
                : { y: -buildingCardDescription.height + 0.05 }
        }
    }

    getMaxCount(location: Location<number, number>, context: MaterialContext): number | undefined {
        const players = context.rules.players.length
        const playerIndex = getRelativePlayerIndex(context, location.player)
        const position = playerPositions[context.rules.players.length - 2][playerIndex]
        if (players === 2) {
            return 4
        } else {
            return position === Position.BottomLeft ? 4 : 3
        }
    }    

    getCoordinates(location: Location, context: MaterialContext) {
        const playerIndex = getRelativePlayerIndex(context, location.player)
        const position = playerPositions[context.rules.players.length - 2][playerIndex]
        const players = context.rules.players.length
        switch (position) {
            case Position.TopLeft:
                return { x: -48, y: -40 }   // TDB
            case Position.TopCenter:
                return { x: -7, y: -40 }    // TDB 
            case Position.TopRight:
                return { x: -63, y: -7 }    // TDB
            case Position.BottomLeft:
                return players === 2 ? { x: -60, y: -38 } : players === 3 ? { x: -20, y: -6 } : { x: -48, y: -9 }    // TDB > 2
            case Position.BottomRight:
                return players === 2 ? { x: 60, y: -38 } : players === 3 ? { x: 63, y:-7 } : { x: 58, y: -9 }    // TD > 2
        }
    }

}

export const playerBuildingBoardLocator = new PlayerBuildingBoardLocator()








