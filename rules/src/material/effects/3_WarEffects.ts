import { MaterialType } from "../MaterialType"
import { Resources } from "../Resources"
import { AgeLocation, Effect, EffectType } from "./Effect"

export type WarEffect = GainTokenIfWinWar | ChangeWarPower | AddWarPower | WarFromBacklane | CantWar
export type GainTokenIfWinWar = {
    type:EffectType.GainTokenIfWinWar
    token:MaterialType.Gold | MaterialType.ScoreToken
    amount:number
    perResource?:Resources[]
}
export type ChangeWarPower = {
    type:EffectType.ChangeWarPower
    ifAgeToken?:true
    ifResource?:Resources[]
    alternativePower:number
}
export type AddWarPower = {
    type:EffectType.AddWarPower
    perResource?:Resources[]
    perAgeToken?:AgeLocation
    perGoldOnIncomePhase?:true
    powerAdded:number
}
export type WarFromBacklane = {
    type:EffectType.WarFromBacklane

}
export type CantWar = {
    type:EffectType.CantWar
    ifAgeToken?:true
    ifResource?:true
}

// Typechecks

export function isWarType(effect:Effect):effect is WarEffect{
    return effect !== undefined && effect.type === EffectType.WarFromBacklane 
        || effect.type === EffectType.AddWarPower 
        || effect.type === EffectType.CantWar
        || effect.type === EffectType.ChangeWarPower
        || effect.type === EffectType.GainTokenIfWinWar
}

export function isGainTokenIfWinWar(effect:Effect):effect is GainTokenIfWinWar{
    return effect !== undefined && effect.type === EffectType.GainTokenIfWinWar 
}

export function isCantWar(effect:Effect):effect is CantWar{
    return effect !== undefined && effect.type === EffectType.CantWar 
}

export function isWarFromBacklane(effect:Effect):effect is WarFromBacklane{
    return effect !== undefined && effect.type === EffectType.WarFromBacklane 
}

export function isAddWarPower(effect:Effect):effect is AddWarPower{
    return effect !== undefined && effect.type === EffectType.AddWarPower 
}

export function isChangeWarPower(effect:Effect):effect is ChangeWarPower{
    return effect !== undefined && effect.type === EffectType.ChangeWarPower 
}