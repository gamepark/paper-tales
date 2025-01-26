import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from "@gamepark/rules-api"
import { buildingCardCaracteristics } from "../../material/BuildingCaracteristics";
import { isMysticEffect } from "../../material/effects/6_AgeEffects";
import { goldMoney } from "../../material/Gold";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { AgeHelper } from "../helpers/AgeHelper";
import { BuildHelper } from "../helpers/BuildHelper";
import { RuleId } from "../RuleId";
import { BuildWithSubstitution } from "./BuildWithSubstitution";

export class Build extends SimultaneousRule {

    onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove<number, number, number>[] {
        return []
    }

    getActivePlayerLegalMoves(playerId: number): MaterialMove[] {

        const moves:MaterialMove[] = []
        const buildHelper =  new BuildHelper(this.game, playerId)
        const fieldCost = buildHelper.hasIgnoreFieldCostEffect(playerId) ? 0 : buildHelper.getFieldCost(playerId)
        const buildWithSubstitution = new BuildWithSubstitution(this.game)

        // Passages aux niveaux 2
        moves.push(...buildHelper.getPlayerBuildingPlayedLevel1(playerId).filter(item => 
               buildHelper.canBuildCost(playerId, buildingCardCaracteristics[item.id].cost2,0)
            || (buildHelper.hasAlternateCost(item.id, 2) && buildHelper.canBuildCost(playerId, buildingCardCaracteristics[item.id].cost2Alternate,0))
            ).moveItems({rotation:true}))

        moves.push(...buildHelper.getPlayerBuildingPlayedLevel1(playerId).filter(buildItem => 
            buildHelper.canBuildCost(playerId, buildingCardCaracteristics[buildItem.id].cost2,0)
            || (buildHelper.hasAlternateCost(buildItem.id, 2) && buildHelper.canBuildCost(playerId, buildingCardCaracteristics[buildItem.id].cost2Alternate,0))
            || buildWithSubstitution.canBuildWithSubstitution(playerId, buildingCardCaracteristics[buildItem.id].cost2, 0)
        ).moveItems({rotation:true}))
        
        // Achats à partir de rien
        
        if(buildHelper.getPlayerGold(playerId) >= fieldCost){
            // Achats au niveau 1 
            moves.push(
                ...buildHelper.getPlayerBuildingUnplayed(playerId).filter(item => 
                       buildHelper.canBuildCost(playerId, buildingCardCaracteristics[item.id].cost1, fieldCost)
                    || (buildHelper.hasAlternateCost(item.id, 1) && buildHelper.canBuildCost(playerId, buildingCardCaracteristics[item.id].cost1Alternate, fieldCost))
                    
                    || (buildWithSubstitution.canBuildWithSubstitution(playerId, buildingCardCaracteristics[item.id].cost1, fieldCost))
                    ).moveItems({
                        type:LocationType.PlayerBuildingBoard, 
                        player:playerId, 
                        y:buildHelper.getPlayerBuildingQuantity(playerId), 
                        rotation:false
                    })
            )
            // Achats au niveau 2
            moves.push(...buildHelper.getPlayerBuildingUnplayed(playerId).filter(item => 
                   buildHelper.canBuildCost(playerId, [...buildingCardCaracteristics[item.id].cost1, ...buildingCardCaracteristics[item.id].cost2], fieldCost)
                || (buildHelper.hasAlternateCost(item.id, 1) && buildHelper.canBuildCost(playerId, [...buildingCardCaracteristics[item.id].cost1Alternate, ...buildingCardCaracteristics[item.id].cost2], fieldCost))
                || (buildHelper.hasAlternateCost(item.id, 2) && buildHelper.canBuildCost(playerId, [...buildingCardCaracteristics[item.id].cost1, ...buildingCardCaracteristics[item.id].cost2Alternate], fieldCost))
                || (buildHelper.hasAlternateCost(item.id, 1) && buildHelper.hasAlternateCost(item.id, 2) && buildHelper.canBuildCost(playerId, [...buildingCardCaracteristics[item.id].cost1Alternate, ...buildingCardCaracteristics[item.id].cost2Alternate], fieldCost))
                
                || (buildWithSubstitution.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[item.id].cost1, ...buildingCardCaracteristics[item.id].cost2], fieldCost))
                || (buildHelper.hasAlternateCost(item.id, 1) && buildWithSubstitution.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[item.id].cost1Alternate, ...buildingCardCaracteristics[item.id].cost2], fieldCost))
                || (buildHelper.hasAlternateCost(item.id, 2) && buildWithSubstitution.canBuildWithSubstitution(playerId, [...buildingCardCaracteristics[item.id].cost1, ...buildingCardCaracteristics[item.id].cost2Alternate], fieldCost))

            ).moveItems({
                    type:LocationType.PlayerBuildingBoard, 
                    player:playerId, 
                    y:buildHelper.getPlayerBuildingQuantity(playerId), 
                    rotation:true
            }))
        }

        // Passer sans construire
        moves.push(this.endPlayerTurn(playerId))
   
        return moves
    }

    beforeItemMove(move: ItemMove<number, number, number>, _context?: PlayMoveContext | undefined): MaterialMove<number, number, number>[] {
        const moves:MaterialMove[] = []


        if (isMoveItemType(MaterialType.Building)(move)){
            const buildHelper =  new BuildHelper(this.game, move.location.player!)

            if (buildHelper.getFieldCost(move.location.player!) > 0 && buildHelper.hasIgnoreFieldCostEffect(move.location.player!) === false){
                moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player : move.location.player!}, -buildHelper.getFieldCost(move.location.player!)))
            }

            // Comment s'assurer que le joueur paye de l'or s'il le doit ?
            // Cas facile : niveau 1, ça vient forcément de sa main
            const buildingId = this.material(MaterialType.Building).index((index) => index === move.itemIndex).getItem()

            if (move.location.rotation === false){
                moves.push(...buildHelper.getGoldToPayCostMove(move.location.player!, buildingId!.id, 1, 0))
            } else {
                // Cas difficile : comment distinguer un build direct lvl 2 ou juste un passage lvl1 à lvl2 ?
                // On suppose qu'on peut le faire avant le material move, à vérifier en test
                const isComingFromHand = this.material(MaterialType.Building)
                                             .location(LocationType.PlayerBuildingHand)
                                             .player(move.location.player!)
                                             .getItem(item => item.id === buildingId!.id) !== undefined
                if (isComingFromHand){
                    // On doit checker les deux coûts
                    moves.push(...buildHelper.getGoldToPayCostMove(move.location.player!, buildingId!.id, 1, 0))
                    moves.push(...buildHelper.getGoldToPayCostMove(move.location.player!, buildingId!.id, 2, 0))

                } else {
                    // On en check que le cout lvl 2
                    moves.push(...buildHelper.getGoldToPayCostMove(move.location.player!, buildingId!.id, 2, 0))
                }
            }

        }

        return moves
    }

    afterItemMove(move: ItemMove): MaterialMove[] {

        const moves:MaterialMove[] = []
        if (isMoveItemType(MaterialType.Building)(move)){
            // moves.push(this.endPlayerTurn(move.location.player!))
        }
        return moves
        
    }

    getMovesAfterPlayersDone(): MaterialMove[] {

        const players = this.game.players
        let startMysticRule:boolean = false
        players.forEach(player => {
            const ageHelper = new AgeHelper(this.game, player)
            const unitswithAgeEffects = ageHelper.getUnitsWithAgeEffects(player)
            unitswithAgeEffects.getItems().forEach(unit => {
                ageHelper.getUnitAgeEffects(player, unit).forEach(eff => {
                    if (isMysticEffect(eff)){
                        startMysticRule = true
                    }
                })
            })
        })

        if (startMysticRule){
            return [this.startSimultaneousRule(RuleId.SaveUnitsWithMysticEffect)]
        } else {
            return [this.startRule(RuleId.AgeEffects)]
        }

    }

    getPlayerBoard(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

}