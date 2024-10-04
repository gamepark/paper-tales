import { CustomMove, MaterialMove, SimultaneousRule, XYCoordinates } from "@gamepark/rules-api"
import { MaterialType } from "../material/MaterialType";
import { LocationType } from "../material/LocationType";
import { CustomMoveType } from "./CustomMoveType";

export class PlaceUnitOnBoard extends SimultaneousRule {

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves = []
        const playerHand = this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
        // const goldRemaining = this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId)
        const playerBoard = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
        const hasLevel2Building = this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getItems().find(item => item.location.rotation.y !== 0) !== undefined
        const remainingSpaces = getBoardSpacesCoordinates(hasLevel2Building).filter(space => playerBoard.getItems().find(item => item.location.x === space.x && item.location.y === space.y) === undefined)

        moves.push(...remainingSpaces.flatMap((space) => {
        return [
            ...playerHand.moveItems({type:LocationType.PlayerUnitBoard, player:playerId, x:space.x, y:space.y})
        ]}))
        moves.push(...playerBoard.moveItems({type:LocationType.Discard}))

        moves.push(this.customMove(CustomMoveType.FinishDeployment, playerId))

        return moves
    }


    onCustomMove(move: CustomMove) {
        if (move.type === CustomMoveType.FinishDeployment){
            return [this.endPlayerTurn(move.data.player!)]
        }
        return []
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        throw new Error("Method not implemented.");
    }

}

function getBoardSpacesCoordinates(hasLevel2Building:boolean):XYCoordinates[]{
    return hasLevel2Building 
        ? [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}]
        : [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}]
}