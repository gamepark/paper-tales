import { MaterialType } from '../MaterialType'
import { Resources } from '../Resources'
import { Condition, Count, Effect, EffectType, WhichBuilding, WhichUnit } from './Effect'

export type DeploymentEffect =
  | Shapeshifter
  | GainTokenOnDeploy
  | ImproveBuilding
  | GainAgeToken
  | GainAgeTokenOnChosenUnit
  | MoveAgeToken
  | ReactivateRevealEffects
  | DrawArtifact
  | BuildRandomLevel2

/**
 * "onDeployment": only when this very card is revealed (the "when revealed" icon of the card). Without it, the effect
 * applies at every Deployment phase (a building, an artifact).
 */
export type Shapeshifter = {
  type: EffectType.Shapeshifter
  onDeployment: boolean
}

export type GainTokenOnDeploy = {
  type: EffectType.GainTokenOnDeploy
  onDeployment: boolean
  token: MaterialType.Gold | MaterialType.ScoreToken
  amount: number
  per?: Count
  condition?: Condition
}

export type ImproveBuilding = {
  type: EffectType.ImproveBuilding
  onDeployment: boolean
  whichBuilding: WhichBuilding
}

export type GainAgeToken = {
  type: EffectType.GainAgeToken
  onDeployment: boolean
  whichUnit: WhichUnit
  amount: number
}

export type GainAgeTokenOnChosenUnit = {
  type: EffectType.GainAgeTokenOnChosenUnit
  onDeployment: boolean
  amount: number
  perResource?: Resources
  /** The units that can be chosen: all the units of the kingdom by default */
  among?: WhichUnit.DeployedThisTurn
}

/** Move an Age token from one of your units to another of your units (the Wizard Apprentice) */
export type MoveAgeToken = {
  type: EffectType.MoveAgeToken
  onDeployment: boolean
}

/** Apply again all the "when revealed" effects of one of your units (the Shadow) */
export type ReactivateRevealEffects = {
  type: EffectType.ReactivateRevealEffects
  onDeployment: boolean
}

/** Draw and discard until a Legendary Artifact is revealed, put into play for free (the Court Jester) */
export type DrawArtifact = {
  type: EffectType.DrawArtifact
  onDeployment: boolean
}

/** Build for free at level 2 a building taken at random among the ones not built yet (the Titan) */
export type BuildRandomLevel2 = {
  type: EffectType.BuildRandomLevel2
  onDeployment: boolean
}

// Typechecks

export function isDeploymentType(effect: Effect): effect is DeploymentEffect {
  return (
    effect.type === EffectType.Shapeshifter ||
    effect.type === EffectType.GainTokenOnDeploy ||
    effect.type === EffectType.ImproveBuilding ||
    effect.type === EffectType.GainAgeToken ||
    effect.type === EffectType.GainAgeTokenOnChosenUnit ||
    effect.type === EffectType.MoveAgeToken ||
    effect.type === EffectType.ReactivateRevealEffects ||
    effect.type === EffectType.DrawArtifact ||
    effect.type === EffectType.BuildRandomLevel2
  )
}

export function isShapeshifter(effect: Effect): effect is Shapeshifter {
  return effect.type === EffectType.Shapeshifter
}

export function isGainTokenOnDeploy(effect: Effect): effect is GainTokenOnDeploy {
  return effect.type === EffectType.GainTokenOnDeploy
}

export function isImproveBuilding(effect: Effect): effect is ImproveBuilding {
  return effect.type === EffectType.ImproveBuilding
}

export function isGainAgeToken(effect: Effect): effect is GainAgeToken {
  return effect.type === EffectType.GainAgeToken
}

export function isGainAgeTokenOnChosenUnit(effect: Effect): effect is GainAgeTokenOnChosenUnit {
  return effect.type === EffectType.GainAgeTokenOnChosenUnit
}

export function isMoveAgeToken(effect: Effect): effect is MoveAgeToken {
  return effect.type === EffectType.MoveAgeToken
}

export function isReactivateRevealEffects(effect: Effect): effect is ReactivateRevealEffects {
  return effect.type === EffectType.ReactivateRevealEffects
}

export function isDrawArtifact(effect: Effect): effect is DrawArtifact {
  return effect.type === EffectType.DrawArtifact
}

export function isBuildRandomLevel2(effect: Effect): effect is BuildRandomLevel2 {
  return effect.type === EffectType.BuildRandomLevel2
}
