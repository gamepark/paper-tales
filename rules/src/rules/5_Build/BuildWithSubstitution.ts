import { MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { buildingCardCaracteristics } from "../../material/BuildingCaracteristics";
import { LocationType } from "../../material/LocationType";
import { Resources } from "../../material/Resources";
import { BuildHelper } from "../helpers/BuildHelper";
import { RuleId } from "../RuleId";

export class BuildWithSubstitution extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        return []
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves:MaterialMove[] = []
        const buildHelper =  new BuildHelper(this.game, playerId)
        const fieldCost = buildHelper.hasIgnoreFieldCostEffect(playerId) ? 0 : buildHelper.getFieldCost(playerId)
        const playerGold = buildHelper.getPlayerGold(playerId)

            // Passages aux niveaux 2
            // Pas de calcul sur le cout alternatif ici, pas relevant
            buildHelper.getPlayerBuildingUnplayed(playerId).filter(buildItem =>
                this.canBuildWithSubstitution(playerId, buildingCardCaracteristics[buildItem.id].cost2, 0) === true 
            ).moveItems({
                type:LocationType.PlayerBuildingBoard, 
                player:playerId, 
                y:buildHelper.getPlayerBuildingQuantity(playerId), 
                rotation:true
            })
   
             // Achats à partir de rien
             if(playerGold >= fieldCost){
                // Niveau 1
                buildHelper.getPlayerBuildingUnplayed(playerId).filter(buildItem =>
                    this.canBuildWithSubstitution(playerId, buildingCardCaracteristics[buildItem.id].cost1, fieldCost) === true 
                    || this.canBuildWithSubstitution(playerId, buildingCardCaracteristics[buildItem.id].cost1Alternate, fieldCost) === true
                ).moveItems({
                    type:LocationType.PlayerBuildingBoard, 
                    player:playerId, 
                    y:buildHelper.getPlayerBuildingQuantity(playerId), 
                    rotation:false
                })

                // Niveau 2
                buildHelper.getPlayerBuildingUnplayed(playerId).filter(buildItem =>
                    this.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[buildItem.id].cost1, ...buildingCardCaracteristics[buildItem.id].cost2], fieldCost) === true 
                    || this.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[buildItem.id].cost1Alternate, ...buildingCardCaracteristics[buildItem.id].cost2], fieldCost) === true
                    || this.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[buildItem.id].cost1, ...buildingCardCaracteristics[buildItem.id].cost2Alternate], fieldCost) === true
                    || this.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[buildItem.id].cost1Alternate, ...buildingCardCaracteristics[buildItem.id].cost2Alternate], fieldCost) === true
                ).moveItems({
                    type:LocationType.PlayerBuildingBoard, 
                    player:playerId, 
                    y:buildHelper.getPlayerBuildingQuantity(playerId), 
                    rotation:false
                })

             }
   
        return moves
    }

    getMovesAfterPlayersDone(): MaterialMove<number, number, number>[] {
        throw new Error("Method not implemented.");
    }

    getMissingResourcesForBuilding(buildCost:Resources[], playerId:number):Resources[]{
        const buildHelper =  new BuildHelper(this.game, playerId)
        const woodCost = buildCost.filter(resource => resource === Resources.Wood).length
        const foodCost = buildCost.filter(resource => resource === Resources.Food).length
        const diamondCost = buildCost.filter(resource => resource === Resources.Diamond).length

        const playerResources = buildHelper.getPlayerResources(playerId)
        const playerWood = playerResources.filter(resources => resources === Resources.Wood).length
        const playerFood = playerResources.filter(resources => resources === Resources.Food).length
        const playerDiamond = playerResources.filter(resources => resources === Resources.Diamond).length
    
        const deltaWood = woodCost - playerWood
        const deltaFood = foodCost - playerFood
        const deltaDiamond = diamondCost - playerDiamond

        const missingWood = deltaWood > 0 ? [...Array(deltaWood).fill(Resources.Wood)] : []
        const missingFood = deltaFood> 0 ? [...Array(deltaFood).fill(Resources.Food)] : []
        const missingDiamond = deltaDiamond > 0 ? [...Array(deltaDiamond).fill(Resources.Diamond)] : []

        return [...missingWood, ...missingFood, ...missingDiamond]
    }

    canBuildWithSubstitution(playerId:number, cost:Resources[], fieldCost:number):boolean{
        const buildHelper =  new BuildHelper(this.game, playerId)
        const playerGold = buildHelper.getPlayerGold(playerId)
        let additionnalGold = 0

        const missingResources = this.getMissingResourcesForBuilding(cost, playerId)
        const canReplaceWoodByGold = buildHelper.getReplaceResourceByGoldEffects(playerId).some(eff => eff.resource.some(res => res === Resources.Wood))
        const canReplaceFoodByGold = buildHelper.getReplaceResourceByGoldEffects(playerId).some(eff => eff.resource.some(res => res === Resources.Food))
        const canReplaceDiamondByGold = buildHelper.getReplaceResourceByGoldEffects(playerId).some(eff => eff.resource.some(res => res === Resources.Diamond))

        if ((missingResources.some(res => res === Resources.Wood) === true && canReplaceWoodByGold === false)
        || (missingResources.some(res => res === Resources.Food) === true && canReplaceFoodByGold === false)
        || (missingResources.some(res => res === Resources.Diamond) === true && canReplaceDiamondByGold === false)){
            return false
        } else {
            if (canReplaceWoodByGold === true){
                additionnalGold += missingResources.filter(res => res === Resources.Wood).length
            }
            if (canReplaceFoodByGold === true){
                additionnalGold += missingResources.filter(res => res === Resources.Food).length
            }
            if (canReplaceDiamondByGold === true){
                additionnalGold += missingResources.filter(res => res === Resources.Diamond).length
            }

            if (playerGold >= fieldCost + additionnalGold){
                return true
            } else {
                return false
            }

        }

    }



}

