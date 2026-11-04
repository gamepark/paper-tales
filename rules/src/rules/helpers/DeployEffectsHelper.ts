import { MaterialRulesPart } from '@gamepark/rules-api'
import { DeploymentEffect, GainAgeTokenOnChosenUnit, isGainAgeTokenOnChosenUnit, isImproveBuilding, isMoveAgeToken, isReactivateRevealEffects } from '../../material/effects/2_DeploymentEffects'
import { WhichBuilding } from '../../material/effects/Effect'
import { PlayerColor } from '../../PlayerColor'
import { Memory, PendingDeployEffect } from '../Memory'
import { ResourcesHelper } from './ResourcesHelper'

/** The effects a Monarch chooses how to apply */
export const isChoice = (effect: DeploymentEffect) =>
  isGainAgeTokenOnChosenUnit(effect) ||
  isMoveAgeToken(effect) ||
  isReactivateRevealEffects(effect) ||
  (isImproveBuilding(effect) && effect.whichBuilding === WhichBuilding.Choice)

/** The deployment effects a Monarch still has to resolve (see DeployEffects) */
export class DeployEffectsHelper extends MaterialRulesPart {
  getQueue(player: PlayerColor): PendingDeployEffect[] {
    return this.remind<PendingDeployEffect[] | undefined>(Memory.DeployEffects, player) ?? []
  }

  /** The effect a Monarch is resolving, or has to choose how to apply */
  getCurrentEffect(player: PlayerColor): PendingDeployEffect | undefined {
    return this.getQueue(player)[0]
  }

  /** The Age tokens a Monarch places on the unit of their choice (the Master Alchemist: one for each food) */
  getChosenAgeTokens(player: PlayerColor, effect: GainAgeTokenOnChosenUnit) {
    if (effect.perResource === undefined) return effect.amount
    return effect.amount * new ResourcesHelper(this.game, player).getResource(effect.perResource)
  }
}
