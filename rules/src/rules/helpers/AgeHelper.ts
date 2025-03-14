import { Material, MaterialGame, MaterialItem, MaterialRulesPart } from "@gamepark/rules-api";
import { AgeEffect, isAgeEffect, isMysticEffect, isSpecialDyingCondition } from "../../material/effects/6_AgeEffects";
import { Effect } from "../../material/effects/Effect";
import { LocationType } from "../../material/LocationType";
import { MaterialType } from "../../material/MaterialType";
import { unitCardCaracteristics } from "../../material/UnitCaracteristics";
import { Memory } from "../Memory";

export class AgeHelper extends MaterialRulesPart {

    constructor(game: MaterialGame, readonly player: number) {
      super(game)
    }

    howManyAgeTokenOnIndex(targetIndex:number):number{
        return this.material(MaterialType.Age).location(LocationType.OnCard).parent(targetIndex).getQuantity()
    }

    getAgeTokenOnIndex(targetIndex:number):Material<number, number, number>{
        return this.material(MaterialType.Age)
            .location(LocationType.OnCard)
            .parent(targetIndex)
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
        const unitsSavedByMysticEffect:number[] = this.remind(Memory.UnitSavedWithMystic, player)

        if (unitsSavedByMysticEffect !== undefined && unitsSavedByMysticEffect.includes(unit.id)){
            return false
        }
        
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
        return this.getPlayerUnits(playerId).filter((_item, index) => this.howManyAgeTokenOnIndex(index) > 0)
    }

    // Effects

    getUnitsWithAgeEffects(player: number):Material<number, number, number> {
        return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).filter(material => 
            unitCardCaracteristics[material.id].effect !== undefined && (unitCardCaracteristics[material.id].effect as Effect[]).some(eff => isAgeEffect(eff))
        )
    }

    getMysticalEffects(player:number):number{
        return this.getUnitsWithAgeEffects(player).filter(item => item.id !== undefined && isMysticEffect(unitCardCaracteristics[item.id].effect)).length
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