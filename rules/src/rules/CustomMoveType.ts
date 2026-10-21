import { PlayerColor } from '../PlayerColor'

export enum CustomMoveType {
  MysticEffect = 1,
  GainAgeTokenOnChosenUnitEffect,
  /** The mystic effect is optional ("you may save"): save nobody */
  SaveNobody,
  /** Internal: the deployment effect just played is done, the next one of this Monarch is resolved (see DeployEffects) */
  ResolveNextDeployEffect,
  /** The unit whose "when revealed" effects the Shadow applies again */
  ReactivateUnit,
  /** The Titan builds a building drawn at random (randomized by the server, see PaperTalesRules.randomize) */
  BuildRandomBuilding,
  /**
   * The outcome of the wars of a Monarch, before what they earn: changes nothing, it gives every Monarch, even one who
   * earns nothing, a line of the journal (see War)
   */
  WarOutcome
}

export type GainAgeTokenOnChosenUnitEffect = {
  unitIndex: number
  player: PlayerColor
}

export type MysticEffectType = {
  unitIndex: number
  player: PlayerColor
}

export type ReactivateUnitData = {
  unitIndex: number
  player: PlayerColor
}

/** The building drawn is added by the server */
export type BuildRandomBuildingData = {
  player: PlayerColor
  building?: number
}
