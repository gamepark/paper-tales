import { CustomMove, MaterialMove, SimultaneousRule } from "@gamepark/rules-api"
import { CustomMoveType } from "./CustomMoveType"
import { AgeHelper } from "./helpers/AgeHelper"
import { Memory } from "./Memory"
import { RuleId } from "./RuleId"

export class SaveUnitsWithMysticEffect extends SimultaneousRule {

    // Need to call this rule BEFORE age effect (conflict with palm reader for example)

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        players.forEach(player => {
            const ageHelper = new AgeHelper(this.game, player)
            const alreadySavedUnits = this.remind(Memory.UnitSavedWithMystic, player)
            const saveableUnits = ageHelper.getPlayerUnits(player).filter(item => ageHelper.getAgeTokenOnUnit(player, item) === 1 
                && (alreadySavedUnits as number[]).find(unitId => unitId === item.id) === undefined)
            
            if (ageHelper.getMysticalEffects(player) === 0 || saveableUnits.length === 0 ){
                moves.push(this.endPlayerTurn(player))
            }
        })

        return moves
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove<number, number, number>[] {

        const moves:MaterialMove[] = []
        const ageHelper = new AgeHelper(this.game, playerId)

        const alreadySavedUnits = this.remind(Memory.UnitSavedWithMystic, playerId)

        const saveableUnits = ageHelper.getPlayerUnits(playerId).filter(item => ageHelper.getAgeTokenOnUnit(playerId, item) === 1 
            && (alreadySavedUnits as number[]).find(unitId => unitId === item.id) === undefined)
        
        // saveableUnits is different of 0 thanks to the pre work in onRuleStart

        saveableUnits.getItems().forEach(item => {
            moves.push(this.customMove(CustomMoveType.MysticEffect, {unitId : item.id, player : playerId}))
        })
        
        return moves

    }

    onCustomMove(move: CustomMove): MaterialMove[] {

        const moves:MaterialMove[] = []
        const ageHelper = new AgeHelper(this.game, move.data.player)

        if (move.type === CustomMoveType.MysticEffect){
            const unitsAlreadySaved = this.remind(Memory.UnitSavedWithMystic, move.data.player).push(move.data.unitId)
            this.memorize(Memory.UnitSavedWithMystic,unitsAlreadySaved,move.data.player)
            
            if (ageHelper.getMysticalEffects(move.data.player) === unitsAlreadySaved.length + 1){
                moves.push(this.endPlayerTurn(move.data.player))
            }

        }

        return moves
        
    }

    getMovesAfterPlayersDone(): MaterialMove<number, number, number>[] {
        return [this.startRule(RuleId.AgeUnitsDie)]
    }

}