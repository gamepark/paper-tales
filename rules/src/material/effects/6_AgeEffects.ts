import { MaterialType } from "../MaterialType"
import { Effect, EffectType, WhichUnit } from "./Effect"

export type AgeEffect = GainTokenIfDying | MysticEffect | SpecialDyingCondition

export type EffectWithManualResolve = MysticEffect

export type GainTokenIfDying = {
    type: EffectType.GainTokenIfDying
    whoDies: WhichUnit
    tokenGain: MaterialType.ScoreToken | MaterialType.Gold
    amount:number
    ifAgeToken?:true
    perAgeToken?:true
}

export type MysticEffect = {
    type: EffectType.MysticEffect
}

export type SpecialDyingCondition = {
    type: EffectType.SpecialDyingCondition
    dyingFromAmount:number|false    
}

export function isAgeEffect(effect:Effect):effect is AgeEffect{
    return effect !== undefined && effect.type === EffectType.GainTokenIfDying 
        || effect.type === EffectType.SpecialDyingCondition 
        || effect.type === EffectType.MysticEffect
}

export function isGainTokenIfDying(effect:Effect):effect is GainTokenIfDying{
    return effect !== undefined && effect.type === EffectType.GainTokenIfDying
}

export function isMysticEffect(effect:Effect):effect is MysticEffect{
    return effect !== undefined && effect.type === EffectType.MysticEffect
}

export function isSpecialDyingCondition(effect:Effect):effect is SpecialDyingCondition{
    return effect !== undefined && effect.type === EffectType.SpecialDyingCondition
}