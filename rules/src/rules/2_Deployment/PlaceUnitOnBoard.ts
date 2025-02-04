import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { MaterialType } from "../../material/MaterialType";
import { LocationType } from "../../material/LocationType";
import { RuleId } from "../RuleId";
import { Memory } from "../Memory";
import { DiscardRemainingUnits } from "./DiscardRemainingUnits";
import { unitCardCaracteristics } from "../../material/UnitCaracteristics";

export class PlaceUnitOnBoard extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        this.game.players.forEach(player => {
            this.memorize(Memory.PlayedCardsDuringDeployment, [], player)
        })
        return []
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves = []

        const placedIndexes: number[] = this.remind(Memory.PlayedCardsDuringDeployment, playerId)
        const remainingSpaces = this.getRemainingSpaces(playerId)
        const playerGold = this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId).getQuantity()
        const goldAlreadyToSpend = this.material(MaterialType.Unit).index((index) => placedIndexes.includes(index)).getItems().reduce((acc, cur) => acc + unitCardCaracteristics[cur.id].cost, 0)
        const goldRemainingToSpend = playerGold - goldAlreadyToSpend
        const playerHand = this.getPlayerHand(playerId)
        const playerHandPlayable = playerHand.filter(item => unitCardCaracteristics[item.id].cost <= goldRemainingToSpend)
        const playerUnitsAlreadyPlayed = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId).index((index) => !placedIndexes.includes(index))

        moves.push(...remainingSpaces.flatMap((space) => {
            return [
                ...playerHandPlayable.moveItems({
                    type: LocationType.PlayerUnitBoard,
                    player: playerId,
                    x: space.x, y: space.y,
                    rotation: true
                })
            ]
        }))


        moves.push(...remainingSpaces.flatMap((space) => {
            return[
                ...playerUnitsAlreadyPlayed.moveItems({
                    type: LocationType.PlayerUnitBoard,
                    player: playerId,
                    x: space.x, y: space.y,
                    rotation: false
                })
            ]
        }))

        moves.push(...playerUnitsAlreadyPlayed.moveItems({
            type: LocationType.Discard
        }))

        const discardAndEndMoves = new DiscardRemainingUnits(this.game).getActivePlayerLegalMoves(playerId)
        moves.push(...discardAndEndMoves)

        return moves
    }

    beforeItemMove(move: ItemMove): MaterialMove<number, number, number>[] {
        const moves: MaterialMove[] = []

        if (isMoveItemType(MaterialType.Unit)(move)){
            if (move.location.type === LocationType.Discard){    
                const ageTokens = this.material(MaterialType.Age).location(LocationType.OnCard).parent(move.itemIndex)
                ageTokens.getQuantity() > 0 && moves.push(ageTokens.deleteItem(
                    ageTokens.getQuantity()
                ))
            } 
        }

        return moves
    }

    afterItemMove(move: ItemMove): MaterialMove<number, number, number>[] {

        const moves: MaterialMove[] = []

        if (isMoveItemType(MaterialType.Unit)(move)){
            if (move.location.type === LocationType.PlayerUnitBoard && move.location.rotation === true){
                const cardsPlayedIndexes: number[] = this.remind(Memory.PlayedCardsDuringDeployment, move.location.player)
                cardsPlayedIndexes.push(move.itemIndex)
                this.memorize(Memory.PlayedCardsDuringDeployment, cardsPlayedIndexes, move.location.player)
            } 
        } 

        return moves

    }

    getMovesAfterPlayersDone(): MaterialMove[] {  
        return [this.startRule(RuleId.RevealBoards)]
    }

    getPlayerHand(playerId: number) {
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
    }

    getPlayerBoard(playerId: number) {
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

    getPlayerGold(playerId: number) {
        return this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId)
    }

    getBoardSpacesCoordinates(playerId: number) {
        const hasLevel2Building = this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getItems().find(item => item.location.rotation === true) !== undefined
        return hasLevel2Building
            ? [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }]
            : [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    }

    getRemainingSpaces(playerId: number) {
        return this.getBoardSpacesCoordinates(playerId).filter(space => this.getPlayerBoard(playerId).getItems().find(item => item.location.x === space.x && item.location.y === space.y) === undefined)
    }

    getAgeTokensOnSpot(playerId:number, x:number, y:number){
        return this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(playerId)
            .filter(item => item.location.x === x && item.location.y === y)
    }

}