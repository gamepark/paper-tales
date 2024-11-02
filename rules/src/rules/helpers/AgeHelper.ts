import { Material, MaterialGame, MaterialItem, MaterialRulesPart } from "@gamepark/rules-api";
import { AgeEffect, Effect, isAgeEffect, isSpecialDyingCondition } from "../../material/Effect";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { unitCardCaracteristics } from "../../material/UnitCaracteristics";

export class AgeHelper extends MaterialRulesPart {

    constructor(game: MaterialGame, readonly player: number) {
      super(game)
    }

    howManyAgeTokenOnCoord(playerId:number, x:number, y:number):number{
        return this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(playerId).filter(item => item.location.x === x && item.location.y === y).getQuantity()
    }

    getAgeTokenOnCoord(playerId:number, x:number, y:number):Material<number, number, number>{
        return this.material(MaterialType.Age)
            .location(loc => loc.type === LocationType.PlayerUnitBoard && loc.x === x && loc.y === y)
            .player(playerId)
    }

    getPlayerAgingUnits(playerId:number){
        return this.getPlayerUnits(playerId).filter(item => !this.getPlayerDyingUnits(playerId).getItems().includes(item) ) 
    }

    getAgeTokenOnUnit(player:number, unit:MaterialItem<number, number, any>):number{
        return this.material(MaterialType.Age).location(LocationType.PlayerUnitBoard).player(player).getItems(item => item.location.x === unit.location.x && item.location.y === unit.location.y).length
    }

    getAgeTokensOnDyingUnits(player:number):number{
        let ageTokenToReturn = 0
        this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getItems().forEach(unit => {
            if (this.isUnitDying(player, unit)){
                ageTokenToReturn += this.getAgeTokenOnUnit(player, unit)
            }
        })
        return ageTokenToReturn
    }

    isUnitDying(player:number, unit:MaterialItem<number, number, any>):boolean{
        const effects = this.getUnitAgeEffects(player, unit)
        const specialDyingEffect = effects.find(isSpecialDyingCondition)
        
        if (specialDyingEffect === undefined) {
            return this.getAgeTokenOnUnit(player, unit) >= 1
        } 

        if (specialDyingEffect.dyingFromAmount === false){
            return false
        } else {
            return this.getAgeTokenOnUnit(player, unit) >= specialDyingEffect.dyingFromAmount
        }
    }

    getPlayerDyingUnits(playerId:number){
        return this.getPlayerUnits(playerId).filter(item => this.howManyAgeTokenOnCoord(playerId, item.location.x!, item.location.y!) > 0)
    }

    // Effects

    getUnitsWithAgeEffects(player: number) {
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).filter(material => 
            unitCardCaracteristics[material.id].effect !== undefined && (unitCardCaracteristics[material.id].effect as Effect[]).some(eff => isAgeEffect(eff))
        )
    }

    getUnitAgeEffects(player:number, unit:MaterialItem<number, number, any>):AgeEffect[]{

        if (unit.id === undefined) {
            return []
        } 

        const ageEffectToReturn : AgeEffect[] = []
        if (unitCardCaracteristics[unit.id].effect !== undefined){
            (unitCardCaracteristics[unit.id].effect as Effect[]).forEach(eff => {
                isAgeEffect(eff) && ageEffectToReturn.push(eff)
            })
        }

        this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
        .getItems().forEach(item => {
            const effect:(Effect[] | undefined) = unitCardCaracteristics[item.id].effect
            if (effect !== undefined){
                effect.forEach(eff => {
                    isAgeEffect(eff) && ageEffectToReturn.push(eff)
                })
            }
        })

        return ageEffectToReturn

    }

    
    getPlayerUnits(playerId:number){
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
    }

}