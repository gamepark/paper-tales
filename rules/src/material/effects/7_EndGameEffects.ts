import { Effect, EffectType } from "./Effect"

export type RelicEffect = {
    type:EffectType.RelicEffect,
    amount:number,
}

// Typechecks

export function isRelicEffect(effect:Effect):effect is RelicEffect{
    return effect.type === EffectType.RelicEffect 
}