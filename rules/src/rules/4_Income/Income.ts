import { MaterialMove, MaterialRulesPart } from "@gamepark/rules-api"
import { IncomeEffect, isIncomeType } from "../../material/effects/4_IncomeEffects"
import { Effect, EffectType } from "../../material/effects/Effect"
import { goldMoney } from "../../material/Gold"
import { LocationType } from "../../material/LocationType"
import { MaterialType } from "../../material/MaterialType"
import { unitCardCaracteristics } from "../../material/UnitCaracteristics"
import { BuildHelper } from "../helpers/BuildHelper"
import { ResourcesHelper } from "../helpers/ResourcesHelper"
import { RuleId } from "../RuleId"

export class Income extends MaterialRulesPart {

    onRuleStart(): MaterialMove[] {
        const moves:MaterialMove[] = []
        const players = this.game.players
        players.forEach(player => {
            moves.push(...goldMoney.createOrDelete(this.material(MaterialType.Gold), {type:LocationType.PlayerGoldStock, player}, this.getPlayerIncome(player)))
        })
        moves.push(this.startSimultaneousRule(RuleId.Build))

        return moves
    }

    getPlayerBoard(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

    getPlayerIncome(playerId:number){
        console.log("player : ", playerId, "get from buildings : ", this.getIncomeFromBuilding(playerId))
        return this.getIncomeUnits(playerId).getItems().reduce((acc, cur) => 
            acc + (unitCardCaracteristics[cur.id].effect as IncomeEffect[])
                .reduce((cardIncome, cardEff) => 
                cardIncome + this.getIncomeByEffect(playerId, cardEff, cur.location.x!, cur.location.y!),0)
        , 2) + this.getIncomeFromBuilding(playerId)
    }

    getIncomeUnits(playerId:number){
        return this.getPlayerBoard(playerId)
            .filter(item => unitCardCaracteristics[item.id].effect !== undefined 
                && (unitCardCaracteristics[item.id].effect as Effect[]).some(eff => isIncomeType(eff)))
    }

    getIncomeFromBuilding(playerId:number):number{
        const buildHelper =  new BuildHelper(this.game, playerId)
        const effects = buildHelper.getPlayerIncomeBuildingEffects(playerId)
        return effects.length === 0 
            ? 0
            : effects.reduce((acc, cur) => acc + this.getIncomeByEffect(playerId, cur, 0,0), 0)
    }

    getIncomeByEffect(playerId:number, effect:IncomeEffect, x:number, y:number){
        switch(effect.type){
            case EffectType.Income:
                return effect.amount
            case EffectType.IncomePerResource:
                const resourcesHelper =  new ResourcesHelper(this.game, playerId)
                return resourcesHelper.getPlayerOneTypeResource(playerId, effect.resource) * effect.amount
            case EffectType.IncomeIfAgeToken:
                return this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(playerId)
                    .filter(item => item.location.x! === x && item.location.y! === y).getQuantity() > 0
                    ? effect.amount
                    : 0
            default:
                return 0
        }
    }

}