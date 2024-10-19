import { MaterialGame, MaterialRulesPart } from "@gamepark/rules-api";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { Resources, ResourcesHelper } from "./ResourcesHelper";

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

    getPlayerBuildingUnplayed(playerId:number){
        return this.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(playerId)
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