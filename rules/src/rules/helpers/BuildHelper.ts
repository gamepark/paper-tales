import { MaterialGame, MaterialMove, MaterialRulesPart } from "@gamepark/rules-api";
import { buildingCardCaracteristics } from "../../material/BuildingCaracteristics";
import { goldMoney } from "../../material/Gold";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { Resources } from "../../material/Resources";
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
        return this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId).getQuantity()
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

        return playerGold >= goldCost 
            && playerWood >= woodCost 
            && playerFood >= FoodCost 
            && playerDiamond >= DiamondCost
    }





}