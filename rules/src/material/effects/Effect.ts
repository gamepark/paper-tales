import { Resources } from '../Resources'
import { DeploymentEffect } from './2_DeploymentEffects'
import { WarEffect } from './3_WarEffects'
import { IncomeEffect } from './4_IncomeEffects'
import { BuildEffect } from './5_Build'
import { AgeEffect } from './6_AgeEffects'
import { RelicEffect } from './7_EndGameEffects'

export enum EffectType {
  Shapeshifter = 1,
  GainTokenOnDeploy,
  ImproveBuilding,
  GainAgeToken,
  GainAgeTokenOnChosenUnit,
  MoveAgeToken,
  ReactivateRevealEffects,
  DrawArtifact,
  BuildRandomLevel2,
  GainTokenIfWinWar,
  ChangeWarPower,
  AddWarPower,
  WarFromBacklane,
  CantWar,
  ScoreAtWar,
  DoubleBuildingWarScore,
  Income,
  IncomePerResource,
  IncomeIfAgeToken,
  IgnoreFieldCost,
  IgnoreLevel2Cost,
  ReplaceResourceByGold,
  ReplaceResourceByResource,
  GainTokenIfDying,
  GainOnAge,
  MysticEffect,
  SpecialDyingCondition,
  RelicEffect
}

export enum AgeLocation {
  OnUnit = 1,
  InRealm
}

export enum WhichUnit {
  Myself = 1,
  Others,
  All,
  /** The other units deployed this turn (the Weapon Master) */
  OthersDeployedThisTurn,
  /** Any unit deployed this turn (the Cursed Crown) */
  DeployedThisTurn
}

export enum WhichBuilding {
  All = 1,
  Choice
}

/** What an effect multiplies its amount by, counted in the kingdom of the Monarch who has the card */
export enum CountKind {
  /** The resources produced, of the given types (all of them if none is given) */
  Resources = 1,
  /** The different types of resource produced (wood, food, crystal) */
  ResourceTypes,
  /** The Age tokens on the units of the kingdom */
  AgeTokensInKingdom,
  /** The Age tokens on the card itself */
  AgeTokensOnSelf,
  /** The Legendary Artifacts in play */
  Artifacts,
  /** The different costs of the units in play */
  UnitCosts,
  /** The units of a strength at least the minimum */
  UnitsWithPower,
  /** The units of a cost at least the minimum */
  UnitsWithCost,
  /** The gold the Monarch earns at the Income phase of the turn, base income included */
  IncomeGold,
  /** The level 2 buildings */
  Level2Buildings,
  /** The units that die at this Age phase */
  DyingUnits,
  /** The other units that survive this Age phase */
  OtherSurvivingUnits
}

export type ResourcesCount = { kind: CountKind.Resources; resources?: Resources[] }
export type MinimumCount = { kind: CountKind.UnitsWithPower | CountKind.UnitsWithCost; min: number }
export type SimpleCount = {
  kind: Exclude<CountKind, CountKind.Resources | CountKind.UnitsWithPower | CountKind.UnitsWithCost>
}
export type Count = ResourcesCount | MinimumCount | SimpleCount

/** A condition for an effect to apply */
export enum ConditionKind {
  /** At least one unit of a cost at least the minimum in the kingdom */
  UnitWithCost = 1,
  /** The card is in the Front */
  OnFrontLane
}

export type UnitWithCostCondition = { kind: ConditionKind.UnitWithCost; min: number }
export type OnFrontLaneCondition = { kind: ConditionKind.OnFrontLane }
export type Condition = UnitWithCostCondition | OnFrontLaneCondition

export type Effect = DeploymentEffect | WarEffect | IncomeEffect | BuildEffect | AgeEffect | RelicEffect
