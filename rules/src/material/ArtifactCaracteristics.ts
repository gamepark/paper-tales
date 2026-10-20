import { Artifact } from './Artifact'
import { Effect, EffectType, WhichUnit } from './effects/Effect'
import { MaterialType } from './MaterialType'
import { Resources } from './Resources'
import { ResourceProduction } from './UnitCaracteristics'

export type ArtifactPattern = {
  /** The Legend points at the end of the game (rulebook p.11) */
  points: number
  resources?: ResourceProduction[]
  /** An effect of an artifact acts at every turn: an artifact is never "revealed" again */
  effect?: Effect[]
}

export const artifactCaracteristics: Record<Artifact, ArtifactPattern> = {
  [Artifact.LuxuriantGrove]: { points: 2, resources: [{ type: [Resources.Wood] }] },
  [Artifact.HornOfPlenty]: { points: 1, resources: [{ type: [Resources.Food] }] },
  [Artifact.ElementalScepter]: { points: 1, resources: [{ type: [Resources.Diamond] }] },
  [Artifact.CursedCrown]: {
    points: 2,
    effect: [{ type: EffectType.GainAgeTokenOnChosenUnit, onDeployment: false, amount: 1, among: WhichUnit.DeployedThisTurn }]
  },
  [Artifact.ShieldOfPower]: { points: 1, effect: [{ type: EffectType.AddWarPower, powerAdded: 2 }] },
  [Artifact.SwordOfGlory]: { points: 2, effect: [{ type: EffectType.GainTokenIfWinWar, token: MaterialType.ScoreToken, amount: 1 }] },
  [Artifact.WarChest]: { points: 1, effect: [{ type: EffectType.GainTokenIfWinWar, token: MaterialType.Gold, amount: 1 }] },
  [Artifact.BottomlessPurse]: { points: 2, effect: [{ type: EffectType.Income, amount: 1 }] },
  [Artifact.MedallionOfLife]: { points: 2, effect: [{ type: EffectType.MysticEffect }] }
}
