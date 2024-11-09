import { Resources } from "../Resources"
import { Effect, EffectType } from "./Effect"

export type IncomeEffect = SimpleIncome | IncomeIfAgeToken | IncomePerResource
export type SimpleIncome = {
    type: EffectType.Income
    amount:number
}
export type IncomePerResource = {
    type: EffectType.IncomePerResource
    resource: Resources
    amount:number
}
export type IncomeIfAgeToken = {
    type:EffectType.IncomeIfAgeToken
    amount:number
}

// Typechecks

export function isIncomeType(effect:Effect):effect is IncomeEffect{
    return effect.type === EffectType.Income 
        || effect.type === EffectType.IncomeIfAgeToken 
        || effect.type === EffectType.IncomePerResource
}

export function isSimpleIncomeType(effect:Effect):effect is SimpleIncome{
    return effect.type === EffectType.Income 
}

export function isIncomeIfAgeTokenType(effect:Effect):effect is IncomeIfAgeToken{
    return effect.type === EffectType.IncomeIfAgeToken 
}

export function isIncomePerResourceType(effect:Effect):effect is IncomePerResource{
    return effect.type === EffectType.IncomePerResource 
}