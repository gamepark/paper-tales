import { MaterialMove, SimultaneousRule } from "@gamepark/rules-api"
import { MaterialType } from "../material/MaterialType";
import { LocationType } from "../material/LocationType";
import { RuleId } from "./RuleId";

export class PlaceUnitOnBoard extends SimultaneousRule {

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves = []

        const playerHand = this.getPlayerHand(playerId)
        const playerBoard = this.getplayerBoard(playerId)
        const remainingSpaces = this.getRemainingSpaces(playerId)

        moves.push(...remainingSpaces.flatMap((space) => {
            return [
                ...playerHand.moveItems({
                    type:LocationType.PlayerUnitBoard,
                    player:playerId,
                    x:space.x, y:space.y,
                    rotation:true
                })
            ]
        }))
        
        moves.push(...playerBoard.moveItems({type:LocationType.Discard}))
        moves.push(this.endPlayerTurn(playerId))

        return moves
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        return [this.startRule(RuleId.RevealBoards)]
    }

    getPlayerHand(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
    }

    getplayerBoard(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

    getPlayerGold(playerId:number){
        return this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId)
    }

    getBoardSpacesCoordinates(playerId:number){
        const hasLevel2Building = this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getItems().find(item => item.location.rotation.y !== 0) !== undefined
        return hasLevel2Building 
        ? [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}, {x:2, y:1}]
        : [{x:0, y:0}, {x:1, y:0}, {x:0, y:1}, {x:1, y:1}]
    }

    getRemainingSpaces(playerId:number){
        return this.getBoardSpacesCoordinates(playerId).filter(space => this.getplayerBoard(playerId).getItems().find(item => item.location.x === space.x && item.location.y === space.y) === undefined)
    }

}