import { Resources } from "../rules/helpers/ResourcesHelper"

export enum EffectType {
    Deploymennt,
    War,
    Income, 
    IncomePerResource,
    IncomeIfAgeToken,
    Build,
    Age

}

export type Effect = Deploymennt | War | IncomeEffect | Build | Age

export type Deploymennt = {
    type: EffectType.Deploymennt
    firstDeployOnly:boolean
}

export type War = {
    type: EffectType.War
}

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

export type Build = {
    type: EffectType.Build
}

export type Age = {
    type: EffectType.Age
}

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
