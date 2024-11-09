import { MaterialItem, MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { ageMoney } from "../material/Age"
import { isDeploymentType, isGainAgeToken, isGainTokenOnDeploy, isImproveBuilding, isShapeshifter } from "../material/effects/2_DeploymentEffects"
import { Effect, WhichBuilding, WhichUnit } from "../material/effects/Effect"
import { LocationType } from "../material/LocationType"
import { MaterialType } from "../material/MaterialType"
import { unitCardCaracteristics, UnitPattern } from "../material/UnitCaracteristics"
import { BuildHelper } from "./helpers/BuildHelper"
import { ScoreHelper } from "./helpers/ScoreHelper"
import { Memory } from "./Memory"

import { RuleId } from "./RuleId"


export class DeployEffects extends MaterialRulesPart {

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

            playerUnitBoard.forEach(unit => {
                const unitCaracs:UnitPattern = unitCardCaracteristics[unit.id]
                if (unitCaracs.effect !== undefined){
                    const unitEffects:Effect[] = unitCardCaracteristics[unit.id].effect
                    unitEffects.forEach(eff => {
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
                                    // TODO : How to manage this fucking unit
                                } else if (isGainAgeToken(eff)){
                                    if (eff.whichUnit === WhichUnit.Myself){
                                        moves.push(...ageMoney.createOrDelete(this.material(MaterialType.Age), {type:LocationType.PlayerUnitBoard, x:unit.location.x!, y:unit.location.y!, player}, eff.amount))
                                    } else if (eff.whichUnit === WhichUnit.All){
                                        // No case in whole game
                                    } else if (eff.whichUnit === WhichUnit.Others){
                                        const spaceToFill = this.getBoardSpacesCoordinates(player).filter(space => space.x !== unit.location.x || space.y !== unit.location.y)
                                        spaceToFill.forEach(space => {
                                            moves.push(...ageMoney.createOrDelete(this.material(MaterialType.Age), {type:LocationType.PlayerUnitBoard, x:space.x, y:space.y, player}, eff.amount))
                                        })
                                    }

                                } else if (isGainTokenOnDeploy(eff)){
                                    if (eff.token === MaterialType.Gold){
                                        // No case in base game
                                    } else if (eff.token === MaterialType.ScoreToken){
                                        let coeff = 1
                                        if (eff.perLevel2Builds){
                                            coeff = buildHelper.getPlayerBuildingPlayedLevel2(player).getQuantity()
                                        }
                                        scoreToAdd = eff.amount * coeff 
                                    }

                                }



                            }
                        }
                    })
                }
            })

            scoreToAdd !== 0 && moves.push(scoreHelper.gainOrLoseScore(player, scoreToAdd))
            this.forget(Memory.PlayedCardsDuringDeployment, player)


        })


        moves.push(this.startRule(RuleId.War))

        return moves

    }

    getPlayerUnits(player:number):MaterialItem<number, number, any>[]{
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getItems()
    }

    getBoardSpacesCoordinates(player: number) {
        const buildHelper =  new BuildHelper(this.game, player)
        const buildingLevel2 = buildHelper.getPlayerBuildingPlayedLevel2(player)
        return buildingLevel2.length > 0
            ? [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 0 }]
            : [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }]
    }

}