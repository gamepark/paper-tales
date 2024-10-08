import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { MaterialType } from "../material/MaterialType";
import { LocationType } from "../material/LocationType";
import { RuleId } from "./RuleId";
import { Memory } from "./Memory";
import { DiscardRemainingUnits } from "./DiscardRemainingUnits";

export class PlaceUnitOnBoard extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        this.game.players.forEach(player => {
            this.memorize(Memory.PlayedCardsDuringDeployment, [], player)
        })
        return []
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves = []

        const placedIndexes:number[] = this.remind(Memory.PlayedCardsDuringDeployment, playerId)
        const playerHand = this.getPlayerHand(playerId)
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

        moves.push(...this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId).index((index) => !placedIndexes.includes(index)).moveItems({
             type: LocationType.Discard 
        }))

        const discardAndEndMoves = new DiscardRemainingUnits(this.game).getActivePlayerLegalMoves(playerId)
        moves.push(...discardAndEndMoves)

        return moves
    }

    afterItemMove(move: ItemMove): MaterialMove<number, number, number>[] {

        if (isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitBoard) {
            const cardsPlayedIndexes:number[] = this.remind(Memory.PlayedCardsDuringDeployment, move.location.player)
            cardsPlayedIndexes.push(move.itemIndex)
            this.memorize(Memory.PlayedCardsDuringDeployment, cardsPlayedIndexes ,move.location.player)
            
            //const testPlacedCards = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(move.location.player).getItems()
            //for (const item of testPlacedCards){
                //console.log(unitCardCaracteristics[item.id! as number].cost)
            //}

        }

        return []
        
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        return [this.startRule(RuleId.RevealBoards)]
    }

    getPlayerHand(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
    }

    getPlayerBoard(playerId:number){
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
        return this.getBoardSpacesCoordinates(playerId).filter(space => this.getPlayerBoard(playerId).getItems().find(item => item.location.x === space.x && item.location.y === space.y) === undefined)
    }

}