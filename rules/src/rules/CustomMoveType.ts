import { PlayerColor } from '../PlayerColor'

export enum CustomMoveType {
  FinishDeployment = 1,
  MysticEffect,
  GainAgeTokenOnChosenUnitEffect
}

export type GainAgeTokenOnChosenUnitEffect = {
  unitIndex: number
  player: PlayerColor
}

export type MysticEffectType = {
  unitIndex: number
  player: PlayerColor
}
