import { Resources } from '../Resources'
import { Effect, EffectType } from './Effect'

export type BuildEffect = IgnoreFieldCost | IgnoreLevel2Cost | ReplaceResourceByGold | ReplaceResourceByResource

export type IgnoreFieldCost = {
  type: EffectType.IgnoreFieldCost
}

/** The level 2 cost is ignored when building directly at level 2 or upgrading (the Back Room) */
export type IgnoreLevel2Cost = {
  type: EffectType.IgnoreLevel2Cost
}

export type ReplaceResourceByGold = {
  type: EffectType.ReplaceResourceByGold
  resource: Resources[]
}

/** A resource produced can be paid instead of other ones, as many times as wished (the Dryad: wood instead of food or crystal) */
export type ReplaceResourceByResource = {
  type: EffectType.ReplaceResourceByResource
  by: Resources
  resource: Resources[]
}

export function isBuildEffect(effect: Effect): effect is BuildEffect {
  return (
    effect.type === EffectType.IgnoreFieldCost ||
    effect.type === EffectType.IgnoreLevel2Cost ||
    effect.type === EffectType.ReplaceResourceByGold ||
    effect.type === EffectType.ReplaceResourceByResource
  )
}

export function isIgnoreFieldCost(effect: Effect): effect is IgnoreFieldCost {
  return effect.type === EffectType.IgnoreFieldCost
}

export function isIgnoreLevel2Cost(effect: Effect): effect is IgnoreLevel2Cost {
  return effect.type === EffectType.IgnoreLevel2Cost
}

export function isReplaceResourceByGold(effect: Effect): effect is ReplaceResourceByGold {
  return effect.type === EffectType.ReplaceResourceByGold
}

export function isReplaceResourceByResource(effect: Effect): effect is ReplaceResourceByResource {
  return effect.type === EffectType.ReplaceResourceByResource
}
