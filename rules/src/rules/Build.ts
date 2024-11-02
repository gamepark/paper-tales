import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { buildingCardCaracteristics } from "../material/BuildingCaracteristics";
import { goldMoney } from "../material/Gold";
import { LocationType } from "../material/LocationType";
import { MaterialType } from "../material/MaterialType";
import { BuildHelper } from "./helpers/BuildHelper";
import { ResourcesHelper } from "./helpers/ResourcesHelper";
import { RuleId } from "./RuleId";

export class Build extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        return []
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves:MaterialMove[] = []
        const resourcesHelper =  new ResourcesHelper(this.game, playerId)
        const buildHelper =  new BuildHelper(this.game, playerId)

        // Passages aux niveaux 2
        moves.push(...buildHelper.getPlayerBuildingPlayedLevel1(playerId).filter(item => buildHelper
            .canBuildCost(playerId, buildingCardCaracteristics[item.id].cost2))
            .moveItems({rotation:true}))
        
        if(buildHelper.getPlayerGold(playerId) >= this.getFieldCost(playerId)){
            // Achats au niveau 1 
            moves.push(...buildHelper.getPlayerBuildingUnplayed(playerId).filter(item => buildHelper
                .canBuildCost(playerId, buildingCardCaracteristics[item.id].cost1))
                .moveItems({type:LocationType.PlayerBuildingBoard, player:playerId, y:this.getPlayerBuildingQuantity(playerId), rotation:false}))
            // Achats au niveau 2
            moves.push(...buildHelper.getPlayerBuildingUnplayed(playerId).filter(item => buildHelper
                .canBuildCost(playerId, [...buildingCardCaracteristics[item.id].cost1, ...buildingCardCaracteristics[item.id].cost2]))
                .moveItems({type:LocationType.PlayerBuildingBoard, player:playerId, y:this.getPlayerBuildingQuantity(playerId), rotation:true}))
        }
        // Passer sans construire
        moves.push(this.endPlayerTurn(playerId))
   
        const playerResources = resourcesHelper.getPlayerResources(playerId)
        console.log("player : ", playerId, ", resources : ", playerResources)

        return moves
    }

    beforeItemMove(move: ItemMove<number, number, number>, _context?: PlayMoveContext | undefined): MaterialMove<number, number, number>[] {
        const moves:MaterialMove[] = []

        if (isMoveItemType(MaterialType.Building)(move)){
            if (this.getFieldCost(move.location.player!) > 0){
                moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player : move.location.player!}, -this.getFieldCost(move.location.player!)))
            }
        }

        return moves
    }

    afterItemMove(move: ItemMove): MaterialMove[] {

        const moves:MaterialMove[] = []
        if (isMoveItemType(MaterialType.Building)(move)){
            moves.push(this.endPlayerTurn(move.location.player!))
        }
        return moves
        
    }

    getMovesAfterPlayersDone(): MaterialMove[] {
        return [this.startRule(RuleId.AgeEffects)]
    }

    getFieldCost(playerId:number){
        return this.getPlayerBuildingQuantity(playerId) * 2
    }

    getPlayerBuildingQuantity(playerId:number){
        return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).getQuantity()
    }

    getPlayerBoard(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

}