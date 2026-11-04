import { isDeploymentType } from '@gamepark/paper-tales/material/effects/2_DeploymentEffects'
import { isMysticEffect } from '@gamepark/paper-tales/material/effects/6_AgeEffects'
import { cardEffects } from '@gamepark/paper-tales/material/CardCharacteristics'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesOptions } from '@gamepark/paper-tales/PaperTalesOptions'
import { PaperTalesSetup } from '@gamepark/paper-tales/PaperTalesSetup'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { isChoice } from '@gamepark/paper-tales/rules/helpers/DeployEffectsHelper'

export const me = PlayerColor.Blue
// The hands go to the next Monarch at the first turn: he is my left neighbour, and I receive the hands of my right one
export const leftNeighbour = PlayerColor.Red
export const rightNeighbour = PlayerColor.Green
export const opponents = [leftNeighbour, rightNeighbour]

/** The units the scenario of the first turn needs: the opponents never keep them during its recruitment */
export const scenarioUnits = [Unit.ForestSpirit, Unit.Farmer, Unit.Hunter, Unit.Blacksmith]

/**
 * With 3 Monarchs, each hand comes back to me as follows (in the order of my picks):
 * - the hand I start with: my 1st pick, and my 4th one, free, among the 2 cards left;
 * - the hand of my right neighbour: my 2nd pick, and the last card, which I do not choose;
 * - the hand of my left neighbour: my 3rd pick.
 */
const scenarioHands: [Unit, PlayerColor][] = [
  [Unit.ForestSpirit, me],
  [Unit.Farmer, rightNeighbour],
  [Unit.Blacksmith, rightNeighbour],
  [Unit.Hunter, leftNeighbour]
]

/**
 * A card that asks its Monarch for a choice during the first turn: the steps of the tutorial are written in advance, and
 * they have no room for a choice of an opponent
 */
const asksForAChoice = (unit: Unit) => cardEffects(unit).some((effect) => isMysticEffect(effect) || (isDeploymentType(effect) && isChoice(effect)))

/**
 * Everything is random but what the scenario needs: the cards of the scenario are already in the hands when the deal
 * completes them from the deck (see Deal). The other copies of these cards and the cards that ask for a choice wait at
 * the bottom of the deck: they come later in the game.
 */
export class TutorialSetup extends PaperTalesSetup {
  setupDeck(options: PaperTalesOptions) {
    super.setupDeck(options)
    for (const [unit, player] of scenarioHands) {
      this.deck.id(unit).limit(1).moveItems({ type: LocationType.PlayerDraftHand, player })
    }
    this.deck.id<Unit>((unit) => scenarioUnits.includes(unit) || asksForAChoice(unit)).moveItems({ type: LocationType.Deck, x: 0 })
  }

  private get deck() {
    return this.material(MaterialType.Unit).location(LocationType.Deck)
  }
}
