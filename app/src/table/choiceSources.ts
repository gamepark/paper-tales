import { Card } from '@gamepark/paper-tales/material/Artifact'
import { cardEffects } from '@gamepark/paper-tales/material/CardCaracteristics'
import { isMysticEffect } from '@gamepark/paper-tales/material/effects/6_AgeEffects'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffects, isChoice } from '@gamepark/paper-tales/rules/2_Deployment/DeployEffects'
import { KingdomHelper } from '@gamepark/paper-tales/rules/helpers/KingdomHelper'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialRules } from '@gamepark/rules-api'

/**
 * The cards in play whose effect a Monarch is choosing how to apply, as indexes of units: named in the header, outlined
 * on the table, so that the choice is read with the card that asks for it. None when the Monarch has no choice to make.
 */
export const getChoiceSources = (rules: MaterialRules, player?: PlayerColor): number[] => {
  if (player === undefined || !rules.isTurnToPlay(player)) return []
  switch (rules.game.rule?.id) {
    case RuleId.DeployEffects: {
      const pending = new DeployEffects(rules.game).getCurrentEffect(player)
      return pending?.source !== undefined && isChoice(pending.effect) ? [pending.source] : []
    }
    case RuleId.SaveUnitsWithMysticEffect: {
      // One card after the other: each one saves a unit, the next one is named once the unit of the previous one is saved
      const mystics = new KingdomHelper(rules.game, player).cards.filter<Card>((item) => cardEffects(item.id).some(isMysticEffect)).getIndexes()
      const saved = rules.remind<number[] | undefined>(Memory.UnitSavedWithMystic, player)?.length ?? 0
      return mystics.slice(saved, saved + 1)
    }
    default:
      return []
  }
}

/** The cards themselves, for their names */
export const getChoiceSourceCards = (rules: PaperTalesRules, player?: PlayerColor): Card[] =>
  getChoiceSources(rules, player).map((index) => rules.material(MaterialType.Unit).getItem<Card>(index).id)
