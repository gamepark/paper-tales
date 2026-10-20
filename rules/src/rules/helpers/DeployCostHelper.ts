import { MaterialGame, MaterialRulesPart } from '@gamepark/rules-api'
import { sumBy } from 'es-toolkit/compat'
import { Card, isArtifact, isUnit } from '../../material/Artifact'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { Memory } from '../Memory'

/**
 * The deployment cost of the cards of a Monarch (rulebook p.5 and p.11): a unit costs its printed cost, a Legendary
 * Artifact costs 1 gold plus 1 for each artifact the Monarch deployed before it.
 */
export class DeployCostHelper extends MaterialRulesPart {
  constructor(
    game: MaterialGame,
    readonly player: number
  ) {
    super(game)
  }

  /** The indexes of the cards laid this turn */
  get placedIndexes(): number[] {
    return this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, this.player) ?? []
  }

  private get placedCards(): Card[] {
    return this.material(MaterialType.Unit).index(this.placedIndexes).getItems<Card>().map((card) => card.id)
  }

  /** The Legendary Artifacts in play before this turn */
  get artifactsBefore(): number {
    const placed = this.placedIndexes
    return this.material(MaterialType.Unit)
      .location(LocationType.PlayerArtifacts)
      .player(this.player)
      .index((index) => !placed.includes(index)).length
  }

  /** What the cards laid this turn cost all together */
  get placedCost(): number {
    const cards = this.placedCards
    const artifacts = cards.filter(isArtifact).length
    // The artifacts laid this turn cost before + 1, before + 2...
    return sumBy(cards.filter(isUnit), (unit) => unitCardCaracteristics[unit].cost) + artifacts * this.artifactsBefore + (artifacts * (artifacts + 1)) / 2
  }

  /** What a card of the hand would cost if laid now, after the cards laid this turn */
  costOf(card: Card): number {
    if (!isArtifact(card)) return unitCardCaracteristics[card].cost
    return 1 + this.artifactsBefore + this.placedCards.filter(isArtifact).length
  }
}
