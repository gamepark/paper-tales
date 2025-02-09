import { isMoveItemType, ItemMove, Material, MaterialItem, MaterialMove, SimultaneousRule } from "@gamepark/rules-api"
import { isDeploymentType, isGainAgeToken, isGainAgeTokenOnChosenUnit, isGainTokenOnDeploy, isImproveBuilding, isManualDeploymentEffect, isShapeshifter } from "../../material/effects/2_DeploymentEffects"
import { Effect, WhichBuilding, WhichUnit } from "../../material/effects/Effect"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { Unit } from "../../material/Unit"
import { unitCardCaracteristics, UnitPattern } from "../../material/UnitCaracteristics"
import { BuildHelper } from "../helpers/BuildHelper"
import { ScoreHelper } from "../helpers/ScoreHelper"
import { Memory } from "../Memory"

import { RuleId } from "../RuleId"


export class DeployEffects extends SimultaneousRule {


    onRuleStart(): MaterialMove[] {

        const moves:MaterialMove[] = []
        const players = this.game.players

        players.forEach(player => {
            const deployedUnitsIndexes = this.remind(Memory.PlayedCardsDuringDeployment, player)
            const deployedUnits = this.material(MaterialType.Unit).index((index) => deployedUnitsIndexes.includes(index)).getItems()
            const playerUnitBoard = this.getPlayerUnits(player)
            const buildHelper =  new BuildHelper(this.game, player)
            const scoreHelper = new ScoreHelper(this.game, player)
            let scoreToAdd = 0
            let manuelEffectToDo = false

            for (const [index, unit] of playerUnitBoard.entries){
                const unitCaracs:UnitPattern = unitCardCaracteristics[unit.id]
                if (unitCaracs.effect !== undefined){
                    const unitEffects:Effect[] = unitCaracs.effect
                    unitEffects.forEach(eff => {

                        if (isGainTokenOnDeploy(eff) && eff.token === MaterialType.ScoreToken){
                            if (eff.onDeployment === false || deployedUnits.find(deployedUnit => deployedUnit.id === unit.id)){
                                const coeff = eff.perLevel2Builds 
                                    ? buildHelper.getPlayerBuildingPlayedLevel2(player).getQuantity() 
                                    : 1
                                scoreToAdd = eff.amount * coeff 
                            }

                        } else {
                            moves.push(...this.getUnitDeployEffectMoves(unit, player, index, eff))
                        }

                    })
                }
            }

            if (manuelEffectToDo === false){
                moves.push(this.endPlayerTurn(player))
            } else {

            }
            scoreToAdd !== 0 && moves.push(scoreHelper.gainOrLoseScore(player, scoreToAdd))

        })

        return moves

    }

    afterItemMove(move: ItemMove): MaterialMove<number, number, number>[] {
        const moves: MaterialMove[] = []
        
        if (isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitBoard){
            let scoreToAdd = 0
            const unitCard = this.material(MaterialType.Unit).index((index) => index === move.itemIndex)
            const unitCardItem = unitCard.getItem()
            const playerMove = unitCardItem!.location.player!

            const shapeShifterCard = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerMove)
                .filter(item => item.id === Unit.Shapeshifter)
            if (unitCardCaracteristics[unitCardItem!.id].cost < 1){
                moves.push(unitCard.moveItem({type:LocationType.Discard}))
                moves.push(this.material(MaterialType.Unit).location(LocationType.Deck).deck().dealOne(
                    {type:LocationType.PlayerUnitBoard,
                         player:unitCardItem?.location.player ,
                         x:unitCardItem?.location.x, y:unitCardItem?.location.y
                    }
                ))
            } else {
                const effects:Effect[]|undefined = unitCardCaracteristics[unitCardItem!.id].effect
                const deployedUnitsIndexes = this.remind(Memory.PlayedCardsDuringDeployment, playerMove)
                const deployedUnits = this.material(MaterialType.Unit).index((index) => deployedUnitsIndexes.includes(index)).getItems()
                const buildHelper =  new BuildHelper(this.game, playerMove)
                const scoreHelper = new ScoreHelper(this.game, playerMove)

                const cardsPlayedIndexes: number[] = this.remind(Memory.PlayedCardsDuringDeployment, move.location.player)
                cardsPlayedIndexes.push(move.itemIndex)
                this.memorize(Memory.PlayedCardsDuringDeployment, cardsPlayedIndexes, move.location.player)


                if (effects !== undefined){
                    effects.forEach(eff => {

                        if (isGainTokenOnDeploy(eff) && eff.token === MaterialType.ScoreToken){
                            if (eff.onDeployment === false || deployedUnits.find(deployedUnit => deployedUnit.id === unitCardItem!.id)){
                                const coeff = eff.perLevel2Builds 
                                    ? buildHelper.getPlayerBuildingPlayedLevel2(playerMove).getQuantity() 
                                    : 1
                                scoreToAdd = eff.amount * coeff 
                            }
    
                        } else {
                            moves.push(...this.getUnitDeployEffectMoves(unitCardItem!,unitCardItem!.location.player! , move.itemIndex, eff))
                        }
    
                        scoreToAdd !== 0 && moves.push(scoreHelper.gainOrLoseScore(playerMove, scoreToAdd))
                    })
                }

                moves.push(shapeShifterCard.moveItem({type:LocationType.Discard}))
                moves.push(this.material(MaterialType.Age).createItem({
                    location: { type: LocationType.OnCard, parent: move.itemIndex },
                    quantity: 1
                }))
            }
        }
        return moves
    }

    getActivePlayerLegalMoves(_playerId: number): MaterialMove<number, number, number>[] {
        const moves:MaterialMove[] = []
        return moves
    }
    getMovesAfterPlayersDone(): MaterialMove<number, number, number>[] {

        let goToChooseRule = false

        this.game.players.forEach(player => {
            const deployedUnits:number[] = this.remind(Memory.PlayedCardsDuringDeployment, player)
            const unitPlayed = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player) 

            const chooseWherePlacingAgeTokenIndexes:number[] = unitPlayed.filter((item, index) => unitCardCaracteristics[item.id].effect !== undefined 
                && (unitCardCaracteristics[item.id].effect as Effect[]).find(isGainAgeTokenOnChosenUnit) !== undefined
                && ((unitCardCaracteristics[item.id].effect as Effect[]).find(isGainAgeTokenOnChosenUnit)!.onDeployment === false || deployedUnits.includes(index)))
                .getIndexes()

            if (chooseWherePlacingAgeTokenIndexes.length > 0){
                this.memorize(Memory.PlacingAgeTokenUnitsIndexes, chooseWherePlacingAgeTokenIndexes, player)
                goToChooseRule = true
            }

        })
        
        if (goToChooseRule){
            return [this.startSimultaneousRule(RuleId.ChooseWherePlacingAgeToken)]
        } 
        
        return [this.startRule(RuleId.War)]
    }

    getPlayerUnits(player:number):Material<number, number, number>{
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
    }

    getBoardSpacesCoordinates(player: number) {
        const buildHelper =  new BuildHelper(this.game, player)
        const buildingLevel2 = buildHelper.getPlayerBuildingPlayedLevel2(player)
        return buildingLevel2.length > 0
            ? [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }]
            : [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    }

    getManuelDeploymentEffects(player:number){
        return this.getPlayerUnits(player).getItems().filter(item => item.id !== undefined && isManualDeploymentEffect(unitCardCaracteristics[item.id].effect))
    }

    getUnitDeployEffectMoves(unit:MaterialItem, player:number, unitIndex:number, eff:Effect):MaterialMove[]{
        const moves:MaterialMove[] = []
        const deployedUnitsIndexes = this.remind(Memory.PlayedCardsDuringDeployment, player)
        const deployedUnits = this.material(MaterialType.Unit).index((index) => deployedUnitsIndexes.includes(index)).getItems()
        const buildHelper =  new BuildHelper(this.game, player)
        const playerUnitBoard = this.getPlayerUnits(player)

                if (isDeploymentType(eff)){
                    if(eff.onDeployment === false || deployedUnits.find(deployedUnit => deployedUnit.id === unit.id)){
                        if (isImproveBuilding(eff)){
                            if (eff.whichBuilding === WhichBuilding.All){
                                const buildingLevel1 = buildHelper.getPlayerBuildingPlayedLevel1(player)
                                moves.push(...buildingLevel1.moveItems({rotation:true}))

                            } else if (eff.whichBuilding === WhichBuilding.Choice){
                                // No case in base game, but should consider Djinn for later
                            }

                        } else if (isShapeshifter(eff)){
                            moves.push(this.material(MaterialType.Unit).location(LocationType.Deck).deck().dealOne(
                                    {type:LocationType.PlayerUnitBoard,
                                         player, 
                                         x:unit.location.x, y:unit.location.y
                                    }))

                        } else if (isGainAgeToken(eff)){
                            if (eff.whichUnit === WhichUnit.Myself){
                                moves.push(this.material(MaterialType.Age).createItem({
                                        location: { type: LocationType.OnCard, parent: unitIndex },
                                        quantity: eff.amount
                                    }))
                            } else if (eff.whichUnit === WhichUnit.All){
                                // No case in whole game
                            } else if (eff.whichUnit === WhichUnit.Others){
                                for (const entry of playerUnitBoard.entries){
                                    const spaceIndex = entry[0]
                                    if (spaceIndex !== unitIndex){
                                        moves.push(this.material(MaterialType.Age).createItem({
                                            location: { type: LocationType.OnCard, parent: spaceIndex },
                                            quantity: eff.amount
                                        }))
                                    }
                                }

                            }

                        } else if (isGainTokenOnDeploy(eff)){
                            if (eff.token === MaterialType.Gold){
                                // No case in base game
                            }
                        } 

                    }
                }

        return moves
    }

}