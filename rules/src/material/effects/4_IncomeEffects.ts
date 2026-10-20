import { Resources } from '../Resources'
import { Count, Effect, EffectType } from './Effect'

export type IncomeEffect = SimpleIncome | IncomeIfAgeToken | IncomePerResource
export type SimpleIncome = {
  type: EffectType.Income
  amount: number
  per?: Count
}
export type IncomePerResource = {
  type: EffectType.IncomePerResource
  resource: Resources
  amount: number
}
export type IncomeIfAgeToken = {
  type: EffectType.IncomeIfAgeToken
  amount: number
}

// Typechecks

export function isIncomeType(effect: Effect): effect is IncomeEffect {
  return effect.type === EffectType.Income || effect.type === EffectType.IncomeIfAgeToken || effect.type === EffectType.IncomePerResource
}
