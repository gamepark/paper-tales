import { CustomMove, MaterialMove, SimultaneousRule } from "@gamepark/rules-api"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { unitCardCaracteristics } from "../../material/UnitCaracteristics"
import { Memory } from "../Memory"
import { GainAgeTokenOnChosenUnit, isGainAgeTokenOnChosenUnit } from "../../material/effects/2_DeploymentEffects"
import { CustomMoveType } from "../CustomMoveType"
import { RuleId } from "../RuleId"
import { ResourcesHelper } from "../helpers/ResourcesHelper"

export class ChooseWherePlacingAgeToken extends SimultaneousRule {

    // Need to call this rule BEFORE age effect (conflict with palm reader for example)

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        players.forEach(player => {
            if(this.remind(Memory.PlacingAgeTokenUnitsIndexes, player) === undefined){
                moves.push(this.endPlayerTurn(player))
            }
        })

        return moves
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove<number, number, number>[] {

        const moves:MaterialMove[] = []

        const playerBoardUnit = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)

        playerBoardUnit.getIndexes().forEach(index => {
            moves.push(this.customMove(
                CustomMoveType.GainAgeTokenOnChosenUnitEffect,
                {unitIndex : index, player : playerId}))
        })


        //const ageHelper = new AgeHelper(this.game, playerId)
        
        return moves

    }

    onCustomMove(move: CustomMove): MaterialMove[] {

        const moves:MaterialMove[] = []
        if (move.type === CustomMoveType.GainAgeTokenOnChosenUnitEffect){
            const chosenUnitIndex = move.data.unitIndex
            const indexesFirstItem:number = this.remind(Memory.PlacingAgeTokenUnitsIndexes, move.data.player)[0]
            const unitIdWithAgingEffect:number = this.material(MaterialType.Unit).filter((_item, index) => index === indexesFirstItem).getItem()!.id
            console.log("rule : ", unitCardCaracteristics[unitIdWithAgingEffect].effect)
            const unitEffect:GainAgeTokenOnChosenUnit = unitCardCaracteristics[unitIdWithAgingEffect].effect.find(isGainAgeTokenOnChosenUnit)
            const resourcesHelper = new ResourcesHelper(this.game, move.data.player)

            const quantityOfAgeTokens:number = unitEffect.perResource === undefined ? unitEffect.amount : unitEffect.amount * resourcesHelper.getPlayerResources(move.data.player).filter(res => res === unitEffect.perResource!).length

            // Ajout des jetons
            moves.push(this.material(MaterialType.Age).createItem({
                location: { type: LocationType.OnCard, parent: chosenUnitIndex },
                quantity: quantityOfAgeTokens
            }))

            // MaJ des effets à traiter
            const chooseWherePlacingAgeTokensUnits:number[] = this.remind(Memory.PlacingAgeTokenUnitsIndexes, move.data.player)
            chooseWherePlacingAgeTokensUnits.shift()
            if (chooseWherePlacingAgeTokensUnits.length === 0){
                moves.push(this.endPlayerTurn(move.data.player))
            } else {
                this.memorize(Memory.PlacingAgeTokenUnitsIndexes,chooseWherePlacingAgeTokensUnits,move.data.player)
            }

        }

        return moves
        
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        this.game.players.forEach(player => this.forget(Memory.PlacingAgeTokenUnitsIndexes, player))
        return [this.startRule(RuleId.War)]
    }

}