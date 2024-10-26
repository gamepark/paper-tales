import { MaterialType } from "./MaterialType"
import { Resources } from "./Resources"

export enum EffectType {
    Deploymennt = 1,
    GainTokenIfWinWar,
    ChangeWarPower,
    AddWarPower,
    WarFromBacklane,
    CantWar,
    Income, 
    IncomePerResource,
    IncomeIfAgeToken,
    Build,
    Age
}

export enum AgeLocation {
    OnUnit = 1,
    InRealm
}

export type Effect = Deploymennt | WarEffect | IncomeEffect | Build | Age

export type Deploymennt = {
    type: EffectType.Deploymennt
    firstDeployOnly:boolean
}

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