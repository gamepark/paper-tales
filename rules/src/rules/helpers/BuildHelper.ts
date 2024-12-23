import { MaterialGame, MaterialMove, MaterialRulesPart } from "@gamepark/rules-api";
import { buildingCardCaracteristics } from "../../material/BuildingCaracteristics";
import { AddWarPower, isAddWarPower, isScoreAtWar, isWarType, ScoreAtWar, WarEffect } from "../../material/effects/3_WarEffects";
import { IncomeEffect, isIncomeType } from "../../material/effects/4_IncomeEffects";
import { BuildEffect, isBuildEffect, isIgnoreFieldCost, isReplaceResourceByGold, ReplaceResourceByGold } from "../../material/effects/5_Build";
import { Effect } from "../../material/effects/Effect";
import { goldMoney } from "../../material/Gold";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { Resources } from "../../material/Resources";
import { unitCardCaracteristics } from "../../material/UnitCaracteristics";
import { War } from "../3_War/War";
import { Income } from "../4_Income/Income";
import { ResourcesHelper } from "./ResourcesHelper";

export class BuildHelper extends MaterialRulesPart {

    constructor(game: MaterialGame, readonly player: number) {
      super(game)
    }

    getPlayerResources(playerId:number){
        const resourcesHelper =  new ResourcesHelper(this.game, playerId)
        return resourcesHelper.getPlayerResources(playerId)
    }

    getPlayerGold(playerId:number){
        return goldMoney.count(this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId))
    }

    getPlayerBuildingPlayed(playerId:number){
        return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId)
    }

    getPlayerBuildingPlayedLevel1(playerId:number){
        return this.getPlayerBuildingPlayed(playerId).filter(item => item.location.rotation === false)
    }

    getPlayerBuildingPlayedLevel2(playerId:number){
        return this.getPlayerBuildingPlayed(playerId).filter(item => item.location.rotation === true)
    }

    getPlayerBuildingUnplayed(playerId:number){
        return this.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(playerId)
    }

    getGoldInBuildingCost(cost:Resources[]):number{
        return cost.filter(res => res === Resources.Gold).length
    }

    hasAlternateCost(buildingId:number, level:number):boolean{
        return level === 1 
            ? buildingCardCaracteristics[buildingId].cost1Alternate !== undefined
            : buildingCardCaracteristics[buildingId].cost2Alternate !== undefined
    }

    /**
     * Retourne les moves de dépense de gold lors de la construction d'une étape de bâtiment
     * Attention, cette fonction peut renvoyer des résultats étranges si le bâtiment ne peut être construit. 
     * @see canBuildCost() pour vérifier si une étape est constructible.
     * @param playerId  - L'ID du joueur qui a joué le coup,
     * @param buildingId - Le bâtiment joué,
     * @param level - L'étape du bâtiment que l'on considère,
     * @returns - Un tableau contenant le move dépensant l'or.
     */
    getGoldToPayCostMove(playerId:number, buildingId:number, level:number):MaterialMove[]{
        console.log(buildingId)
        const moves : MaterialMove[] = []
        const cost = level === 1 ? buildingCardCaracteristics[buildingId].cost1 : buildingCardCaracteristics[buildingId].cost2
        const costAlternate = level === 1 ? buildingCardCaracteristics[buildingId].cost1Alternate : buildingCardCaracteristics[buildingId].cost2Alternate
        const goldToPay = this.canBuildCost(playerId,cost) ? this.getGoldInBuildingCost(cost) : this.getGoldInBuildingCost(costAlternate)
        
        goldToPay > 0 && moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player : playerId}, -goldToPay))

        return moves
    }

    canBuildCost(playerId:number, cost:Resources[]){
        const goldCost = cost.filter(resource => resource === Resources.Gold).length
        const woodCost = cost.filter(resource => resource === Resources.Wood).length
        const FoodCost = cost.filter(resource => resource === Resources.Food).length
        const DiamondCost = cost.filter(resource => resource === Resources.Diamond).length

        const playerResources = this.getPlayerResources(playerId)
        const playerGold = this.getPlayerGold(playerId)
        const playerWood = playerResources.filter(resources => resources === Resources.Wood).length
        const playerFood = playerResources.filter(resources => resources === Resources.Food).length
        const playerDiamond = playerResources.filter(resources => resources === Resources.Diamond).length

        // const canReplaceWoodByGold = this.getReplaceResourceByGoldEffects(playerId).some(eff => eff.resource.some(res => res === Resources.Wood))
        // const canReplaceFoodByGold = this.getReplaceResourceByGoldEffects(playerId).some(eff => eff.resource.some(res => res === Resources.Food))
        // const canReplaceDiamondByGold = this.getReplaceResourceByGoldEffects(playerId).some(eff => eff.resource.some(res => res === Resources.Diamond))

        return playerGold >= goldCost 
            && playerWood >=  woodCost  
            && playerFood >= FoodCost 
            && playerDiamond >= DiamondCost
    }

    getPlayerBuildingsDone(playerId:number){
        return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId)
    }

    getPlayerBuildingEffects(playerId:number):Effect[]{
        const effectsToReturn: Effect[] = []
        this.getPlayerBuildingsDone(playerId).getItems().forEach(item => {
            if (item.location.rotation === true){
                effectsToReturn.push(...buildingCardCaracteristics[item.id].effect2)
            } 
            effectsToReturn.push(...buildingCardCaracteristics[item.id].effect1)
        })
        return effectsToReturn
    }

    getPlayerIncomeBuildingEffects(playerId:number):IncomeEffect[]{
        return this.getPlayerBuildingEffects(playerId).filter(isIncomeType)
    }

    getPlayerWarBuildingEffects(playerId:number):WarEffect[]{
        return this.getPlayerBuildingEffects(playerId).filter(isWarType)
    }

    getPlayerAddPowerBuildingEffects(playerId:number):AddWarPower[]{
        return this.getPlayerWarBuildingEffects(playerId).filter(isAddWarPower)
    }

    getPlayerScoreAtWarBuildingEffects(playerId:number):ScoreAtWar[]{
        return this.getPlayerWarBuildingEffects(playerId).filter(isScoreAtWar)
    }

    getPowerAddedFromBuilding(playerId:number, buildEffect:AddWarPower):number{
        let add = 0
        if (buildEffect.perAgeToken){
            // No existing case, maybe for later
        } else if (buildEffect.perResource) {
            const resourcesHelper =  new ResourcesHelper(this.game, playerId)
            buildEffect.perResource.forEach(resource => {
                const ressources = resourcesHelper.getPlayerOneTypeResource(playerId, resource)
                add += ressources * buildEffect.powerAdded
            })
        } else if (buildEffect.perGoldOnIncomePhase){
            const incomeHelper = new Income(this.game)
            const income = incomeHelper.getPlayerIncome(playerId)
            add += income * buildEffect.powerAdded
        } else {
            add += buildEffect.powerAdded
        }

        return add
    }

    getScoreFromBuilding(playerId:number, buildEffect:ScoreAtWar):number{
        if (buildEffect.perResource){
            return buildEffect.amount * this.getPlayerResources(playerId).filter(res => res === buildEffect.perResource).length
        } else if (buildEffect.perUnitStrongerThan){
            const warHelper = new War(this.game)
            const matchingUnitsQuantity = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId).filter(item => warHelper.getUnitPower(playerId, item) >= buildEffect.perUnitStrongerThan!).getQuantity()
            return buildEffect.amount * matchingUnitsQuantity
        } else {
            return buildEffect.amount
        }
    }

    getPlayerBuildEffect(playerId:number):BuildEffect[]{
        const result:BuildEffect[] = []
        this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId).getItems().forEach(item => {
            unitCardCaracteristics[item.id].effect !== undefined && result.push(...unitCardCaracteristics[item.id].effect.filter(isBuildEffect)) 
        })
        return result
    }

    hasIgnoreFieldCostEffect(playerId:number):boolean{
        return this.getPlayerBuildEffect(playerId).find(isIgnoreFieldCost) !== undefined
    }

    getReplaceResourceByGoldEffects(playerId:number):ReplaceResourceByGold[]{
        return this.getPlayerBuildEffect(playerId).filter(isReplaceResourceByGold)
    }

}