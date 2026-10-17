import { PlayerColor } from '../PlayerColor'

export enum CustomMoveType {
  FinishDeployment = 1,
  MysticEffect,
  GainAgeTokenOnChosenUnitEffect,
  /** The mystic effect is optional ("you may save"): save nobody */
  SaveNobody
}

export type GainAgeTokenOnChosenUnitEffect = {
  unitIndex: number
  player: PlayerColor
}

export type MysticEffectType = {
  unitIndex: number
  player: PlayerColor
}
