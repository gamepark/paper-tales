import { Resource } from "i18next"
import { MaterialType } from "../MaterialType"
import { Effect, EffectType, WhichBuilding, WhichUnit } from "./Effect"

export type DeploymentEffect = Shapeshifter | GainTokenOnDeploy | ImproveBuilding | GainAgeToken | GainAgeTokenOnChosenUnit

export type Deploymennt = {
    type: EffectType.Deploymennt
    firstDeployOnly:boolean
}

export type Shapeshifter = {
    type:EffectType.Shapeshifter,
    onDeployment:boolean
}

export type GainTokenOnDeploy = {
    type:EffectType.GainTokenOnDeploy,
    onDeployment:boolean,
    token:MaterialType.Gold | MaterialType.ScoreToken
    amount:number
    perLevel2Builds?:true

}

export type ImproveBuilding = {
    type:EffectType.ImproveBuilding,
    onDeployment:boolean,
    whichBuilding:WhichBuilding,
}

export type GainAgeToken = {
    type:EffectType.GainAgeToken,
    onDeployment:boolean,
    whichUnit:WhichUnit,
    amount:number
}

export type GainAgeTokenOnChosenUnit = {
    type:EffectType.GainAgeTokenOnChosenUnit,
    onDeployment:boolean,
    amount: number,
    perResource?:Resource
}

// Typechecks

export function isDeploymentType(effect:Effect):effect is DeploymentEffect{
    return isShapeshifter(effect) || isGainTokenOnDeploy(effect) || isImproveBuilding(effect) || isGainAgeToken(effect) || isGainAgeTokenOnChosenUnit(effect)
}

export function isShapeshifter(effect:Effect):effect is Shapeshifter{
    return effect.type === EffectType.Shapeshifter
}

export function isGainTokenOnDeploy(effect:Effect):effect is GainTokenOnDeploy{
    return effect.type === EffectType.GainTokenOnDeploy
}

export function isImproveBuilding(effect:Effect):effect is ImproveBuilding{
    return effect.type === EffectType.ImproveBuilding
}

export function isGainAgeToken(effect:Effect):effect is GainAgeToken{
    return effect.type === EffectType.GainAgeToken
}

export function isGainAgeTokenOnChosenUnit(effect:Effect):effect is GainAgeTokenOnChosenUnit{
    return effect.type === EffectType.GainAgeTokenOnChosenUnit
}

// Same than above, but can be modify to get all manual effects in the future with extends.
export function isManualDeploymentEffect(effect:Effect):effect is (GainAgeTokenOnChosenUnit){
    return effect.type === EffectType.GainAgeTokenOnChosenUnit
}