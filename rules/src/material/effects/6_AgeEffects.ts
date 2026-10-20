import { MaterialType } from '../MaterialType'
import { Count, Effect, EffectType, WhichUnit } from './Effect'

export type AgeEffect = GainTokenIfDying | GainOnAge | MysticEffect | SpecialDyingCondition

export type GainTokenIfDying = {
  type: EffectType.GainTokenIfDying
  whoDies: WhichUnit
  tokenGain: MaterialType.ScoreToken | MaterialType.Gold
  amount: number
  ifAgeToken?: true
  /** Only when the unit dies with exactly one Age token (the Demon) */
  ifSingleAgeToken?: true
  perAgeToken?: true
  per?: Count
}

/** Gold or Legend points at the Age phase, whether the card dies or not (the Library, the Relic of Light) */
export type GainOnAge = {
  type: EffectType.GainOnAge
  token: MaterialType.ScoreToken | MaterialType.Gold
  amount: number
  per: Count
}

export type MysticEffect = {
  type: EffectType.MysticEffect
}

export type SpecialDyingCondition = {
  type: EffectType.SpecialDyingCondition
  dyingFromAmount: number
}

export function isAgeEffect(effect: Effect): effect is AgeEffect {
  return (
    effect.type === EffectType.GainTokenIfDying ||
    effect.type === EffectType.GainOnAge ||
    effect.type === EffectType.SpecialDyingCondition ||
    effect.type === EffectType.MysticEffect
  )
}

export function isGainTokenIfDying(effect: Effect): effect is GainTokenIfDying {
  return effect.type === EffectType.GainTokenIfDying
}

export function isGainOnAge(effect: Effect): effect is GainOnAge {
  return effect.type === EffectType.GainOnAge
}

export function isMysticEffect(effect: Effect): effect is MysticEffect {
  return effect.type === EffectType.MysticEffect
}

export function isSpecialDyingCondition(effect: Effect): effect is SpecialDyingCondition {
  return effect.type === EffectType.SpecialDyingCondition
}
