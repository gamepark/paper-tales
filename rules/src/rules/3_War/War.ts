import { MaterialItem, MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { isAddWarPower, isCantWar, isChangeWarPower, isGainTokenIfWinWar, isWarFromBacklane } from "../../material/effects/3_WarEffects"
import { AgeLocation, Effect } from "../../material/effects/Effect"
import { goldMoney } from "../../material/Gold"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { unitCardCaracteristics } from "../../material/UnitCaracteristics"
import { ResourcesHelper } from "../helpers/ResourcesHelper"
import { ScoreHelper } from "../helpers/ScoreHelper"
import { Income } from "../4_Income/Income"
import { RuleId } from "../RuleId"
import { BuildHelper } from "../helpers/BuildHelper"
import { Memory } from "../Memory"

export class War extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        const playerPower = players.map(player => this.getPlayerPower(player))

        players.forEach((player, index) => {
            this.forget(Memory.PlayedCardsDuringDeployment, player)
            this.logAllPlayerUnitPower(player)
            const buildHelper = new BuildHelper(this.game, player)
            const scoreHelper =  new ScoreHelper(this.game, player)
            const myPower = playerPower[index]

            console.log("Puissance du joueur ",player, " : ", myPower)

            const leftPower = playerPower[this.getNeighbor(players, index, "left")]
            const rightPower = playerPower[this.getNeighbor(players, index, "right")]

            let warScoring = 0
            
            if (players.length === 2){
                if (myPower > 0 && myPower >= leftPower){
                    warScoring += myPower >= leftPower*2 ? 6 : 3
                    moves.push(...this.getGainGoldIfWinWarMoves(player))
                    warScoring += this.getGainScoreIfWinWarAmount(player)
                } 
            } else {
                if (myPower >= leftPower){
                    warScoring+=3
                    moves.push(...this.getGainGoldIfWinWarMoves(player))
                    warScoring += this.getGainScoreIfWinWarAmount(player)
                }
                if (myPower>= rightPower){
                    warScoring+=3
                    moves.push(...this.getGainGoldIfWinWarMoves(player))
                    warScoring += this.getGainScoreIfWinWarAmount(player)
                }
            }

            console.log("Score gagné par le joueur ",player, " par les guerres gagnées : ", warScoring)

            // Effets scoring peu importe la victoire
            warScoring += buildHelper.getPlayerScoreAtWarBuildingEffects(player).reduce((acc, cur) => 
                acc + buildHelper.getScoreFromBuilding(player, cur), 0
            )

            console.log("Score gagné par le joueur ",player, " Après application des bâtiments : ", warScoring)
            warScoring !==0 && moves.push(scoreHelper.gainOrLoseScore(player, warScoring))

        })

        moves.push(this.startRule(RuleId.Income))
        return moves
    }

    getGainScoreIfWinWarAmount(player:number):number{
        let score = 0
        this.getPlayerBoard(player).getItems(item => unitCardCaracteristics[item.id].effect !== undefined).forEach(item => {
            const effects: Effect[] = unitCardCaracteristics[item.id].effect
            effects.forEach(eff => {
                if (isGainTokenIfWinWar(eff) && eff.token === MaterialType.ScoreToken){
                    if (eff.perResource !== undefined){
                        const resourcesHelper =  new ResourcesHelper(this.game, player)
                        const resourceAmount = eff.perResource.reduce((acc, cur) => acc + resourcesHelper.getPlayerOneTypeResource(player, cur), 0)
                        score += eff.amount * resourceAmount
                    } else {
                        score += eff.amount
                    }
                }
            })

        })
        return score    
    }

    getGainGoldIfWinWarMoves(player:number):MaterialMove[]{
        const moves:MaterialMove[] = []
        this.getPlayerBoard(player).getItems(item => unitCardCaracteristics[item.id].effect !== undefined).forEach(item => {
            const effects: Effect[] = unitCardCaracteristics[item.id].effect
            effects.forEach(eff => {
                if (isGainTokenIfWinWar(eff) && eff.token === MaterialType.Gold){
                    if (eff.perResource !== undefined){
                        const resourcesHelper =  new ResourcesHelper(this.game, player)
                        const amount = eff.perResource.reduce((acc, cur) => acc + resourcesHelper.getPlayerOneTypeResource(player, cur), 0)
                        moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player : player}, amount * eff.amount))
                    } else {
                        moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player : player}, eff.amount))
                    }
                }
            })

        })

        return moves
    }

    getPlayerBoard(player:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
    }

    getPlayerFrontLane(player:number){
        return this.getPlayerBoard(player).filter(item => this.isAtFrontLane(item))
    }

    isAtFrontLane(unit:MaterialItem<number, number, any>){
        return unit.location.y === 0
    }

    getUnitPower(player:number, unitMaterial:MaterialItem<number, number, any>){
        if (unitMaterial.id === undefined){
            return 0
        }
        
        const unit = unitCardCaracteristics[unitMaterial.id]

        const effects:Effect[] = unit.effect
        if (effects !== undefined){
            const cantWarEffect = effects.find(isCantWar)
            const changeWarPowerEffect = effects.find(isChangeWarPower)
            const addWarPowerEffect = effects.find(isAddWarPower)

            // On applique la premiere condition exclusive
            if (cantWarEffect !== undefined){
                if (cantWarEffect.ifAgeToken){
                    const ageOnUnit = this.getAgeOnUnit(player, unitMaterial)
                    if (ageOnUnit > 0) {
                        return 0
                    }
                } 
            }

            // Ensuite, on applique la seconde condition exclusive
            if (changeWarPowerEffect !== undefined){
                if (changeWarPowerEffect.ifAgeToken){
                    const ageOnUnit = this.getAgeOnUnit(player, unitMaterial)
                    return ageOnUnit > 0 ? changeWarPowerEffect.alternativePower : unit.power
                } else if (changeWarPowerEffect.ifResource){
                    const resourcesHelper =  new ResourcesHelper(this.game, player)
                    const playerResources = resourcesHelper.getPlayerResources(player)
                    return changeWarPowerEffect.ifResource.some(resource => playerResources.some(r => r === resource))
                        ? changeWarPowerEffect.alternativePower
                        : unit.power
                }
            }

            // Enfin, on calcule le surplus de puissance qu'on peut ajouter. Pas de return ici
            let add = 0
            if (addWarPowerEffect){
                if (addWarPowerEffect.perAgeToken !== undefined){
                    const ageFactor = addWarPowerEffect.perAgeToken === AgeLocation.OnUnit
                        ? this.getAgeOnUnit(player, unitMaterial)
                        : this.getAgeInPlayerRealm(player)
                    add += ageFactor * addWarPowerEffect.powerAdded
                } else if (addWarPowerEffect.perResource) {
                    const resourcesHelper =  new ResourcesHelper(this.game, player)
                    addWarPowerEffect.perResource.forEach(resource => {
                        const ressources = resourcesHelper.getPlayerOneTypeResource(player, resource)
                        add += ressources * addWarPowerEffect.powerAdded
                    })
                } else if (addWarPowerEffect.perGoldOnIncomePhase){
                    const incomeHelper = new Income(this.game)
                    const income = incomeHelper.getPlayerIncome(player)
                    add += income * addWarPowerEffect.powerAdded
                }
            }

            return unit.power + add

        }

        // Si pas d'effet, on retourne juste la puissance.
        return unit.power

    }

    getAgeOnUnit(player:number, unit:MaterialItem){
        const index = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
            .filter(item => item.location.x === unit.location.x && item.location.y === unit.location.y)
            .getIndex()
        return this.material(MaterialType.Age).location(LocationType.OnCard).parent(index).length
    }

    getAgeInPlayerRealm(player:number){
        const indexes = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getIndexes()
        return this.material(MaterialType.Age).location(LocationType.OnCard).parent(item => indexes.includes(item!)).length
    }

    getFrontLanePower(player:number){
        return this.getPlayerFrontLane(player).getItems().reduce((acc, cur) => acc + this.getUnitPower(player, cur.id), 0)
    }

    getPlayerPower(player:number){
        const buildHelper = new BuildHelper(this.game, player)
        return this.getPlayerBoard(player).getItems()
            .reduce((acc, cur) => acc 
                + (
                    (
                        (cur.id !== undefined && this.isAtFrontLane(cur)) 
                        || 
                        ( cur.id !== undefined && unitCardCaracteristics[cur.id].effect !== undefined 
                            && (unitCardCaracteristics[cur.id].effect as Effect[]).some(eff => isWarFromBacklane(eff))
                        )
                    ) 
                    ? this.getUnitPower(player, cur) 
                    : 0
                )
            ,0) + buildHelper.getPlayerAddPowerBuildingEffects(player).reduce((acc, cur) => acc + buildHelper.getPowerAddedFromBuilding(player, cur), 0)
    }

    logAllPlayerUnitPower(player:number){
        return this.getPlayerBoard(player).getItems()
        .forEach(item => {
            (
                this.isAtFrontLane(item) 
                || 
                ( unitCardCaracteristics[item.id].effect !== undefined && (unitCardCaracteristics[item.id].effect as Effect[]).some(eff => isWarFromBacklane(eff)))
            ) && console.log("Puissance de l'unité n° ", item.id, " : ", this.getUnitPower(player, item))
        })    
    }

    getNeighbor(players:number[], playerIndex:number, side:"left"|"right"){
        if (side==="left"){
            return playerIndex -1 < 0 ? players.length-1 : playerIndex - 1
        } else {
            return playerIndex +1 > players.length-1 ? 0 : playerIndex + 1
        }
    }

    getPlayerUnitsWithGainTokenWarEffect(player:number){
        return this.getPlayerBoard(player).filter(item => unitCardCaracteristics[item.id].effect !== undefined && (unitCardCaracteristics[item.id].effect as Effect[]).some(eff => isGainTokenIfWinWar(eff)))
    }





}