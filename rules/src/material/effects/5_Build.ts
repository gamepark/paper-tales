import { Resources } from "../Resources";
import { Effect, EffectType } from "./Effect"

export type Build = {
    type: EffectType.Build
}

export type BuildEffect = IgnoreFieldCost | ReplaceResourceByGold;

export type IgnoreFieldCost = {
    type: EffectType.IgnoreFieldCost
}

export type ReplaceResourceByGold = {
    type:EffectType.ReplaceResourceByGold
    resource:Resources[]
}

export function isBuildEffect(effect:Effect):effect is BuildEffect{
    return effect.type === EffectType.IgnoreFieldCost 
        || effect.type === EffectType.ReplaceResourceByGold 
}

export function isIgnoreFieldCost(effect:Effect):effect is IgnoreFieldCost{
    return effect.type === EffectType.IgnoreFieldCost 
}

export function isReplaceResourceByGold(effect:Effect):effect is ReplaceResourceByGold{
    return effect.type === EffectType.ReplaceResourceByGold
}