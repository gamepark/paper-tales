import { Location, MaterialGame } from '@gamepark/rules-api'
import { sortBy } from 'es-toolkit/compat'
import { Card, isArtifact, isUnit } from '../material/Artifact'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Unit } from '../material/Unit'
import { unitCardCaracteristics } from '../material/UnitCaracteristics'
import { PaperTalesRules } from '../PaperTalesRules'
import { PlaceUnitOnBoard } from '../rules/2_Deployment/PlaceUnitOnBoard'
import { BuildHelper } from '../rules/helpers/BuildHelper'
import { DeployCostHelper } from '../rules/helpers/DeployCostHelper'
import { KingdomEvaluation } from './KingdomEvaluation'
import { Taste } from './Taste'

/** The units of the hand combined at most in a deployment, the best ones on their own */
const MAX_UNITS_COMBINED = 4

export type Placement = { card: number; x: number; y: number }

/** The cards a Monarch lays this turn, on top of the ones already laid, and what the kingdom is then worth */
export type DeploymentPlan = { placements: Placement[]; artifacts: number[]; value: number }

/**
 * Finds the best deployment of some cards (the hand, or the hand and a card of the draft): every way of laying them on
 * the spaces of the kingdom that the gold pays is tried on a copy of the game, without the effects of the rules (the
 * moves are transient), then evaluated. The cards already laid this turn stay where they are.
 */
export class DeploymentPlanner {
  private readonly rules: PaperTalesRules
  private readonly evaluation: KingdomEvaluation
  private readonly costs: DeployCostHelper
  private readonly placed: number[]
  private best!: DeploymentPlan

  constructor(
    view: MaterialGame,
    readonly player: number,
    private readonly taste: Taste
  ) {
    const game = JSON.parse(JSON.stringify(view)) as MaterialGame
    this.rules = new PaperTalesRules(game)
    this.evaluation = new KingdomEvaluation(game, player)
    this.costs = new DeployCostHelper(game, player)
    this.placed = this.costs.placedIndexes
  }

  plan(cards: number[]): DeploymentPlan {
    const units = this.rules.material(MaterialType.Unit)
    const ids = (card: number) => units.getItem<Card>(card).id
    const handArtifacts = cards.filter((card) => isArtifact(ids(card)))
    const unitCards = cards.filter((card) => isUnit(ids(card)))
    // Every deployment of a big hand would take too long: only the units that are the best on their own are combined
    const handUnits = unitCards.length <= MAX_UNITS_COMBINED ? unitCards : sortBy(unitCards, (card) => -this.plan([card]).value).slice(0, MAX_UNITS_COMBINED)
    const budget = new BuildHelper(this.rules.game, this.player).gold - this.costs.placedCost
    // The spaces where a unit can be laid: not on a unit laid this turn
    const spaces = new PlaceUnitOnBoard(this.rules.game)
      .getBoardSpaces(this.player)
      .filter((space) => !this.occupant(space.x, space.y).some((index) => this.placed.includes(index)))
      .map((space) => ({ ...space, empty: !this.occupant(space.x, space.y).length }))
      // The empty spaces of a lane are worth the same: they are side by side, to be filled in order (see twin)
      .sort((a, b) => Number(a.empty) - Number(b.empty) || a.y - b.y || a.x - b.x)

    this.best = { placements: [], artifacts: [], value: -Infinity }
    const placeUnits = (spaceIndex: number, placements: Placement[], spent: number) => {
      if (spaceIndex === spaces.length) return this.placeArtifacts(handArtifacts, 0, placements, [], spent, budget)
      const { x, y, empty } = spaces[spaceIndex]
      // The previous empty space of the same lane: this one takes a card only after it, and a card that comes after its own
      const twin = empty && spaceIndex > 0 && spaces[spaceIndex - 1].empty && spaces[spaceIndex - 1].y === y ? spaces[spaceIndex - 1] : undefined
      const twinCard = twin && placements.find((placement) => placement.x === twin.x && placement.y === twin.y)?.card
      placeUnits(spaceIndex + 1, placements, spent)
      if (twin && twinCard === undefined) return
      for (const card of handUnits) {
        if (twinCard !== undefined && card <= twinCard) continue
        if (placements.some((placement) => placement.card === card)) continue
        const cost = unitCardCaracteristics[units.getItem<Unit>(card).id].cost
        if (spent + cost > budget) continue
        const undo = this.lay(card, { type: LocationType.PlayerUnitBoard, player: this.player, x, y, rotation: true })
        placeUnits(spaceIndex + 1, [...placements, { card, x, y }], spent + cost)
        undo()
      }
    }
    placeUnits(0, [], 0)
    return this.withoutUselessCards(this.best)
  }

  /**
   * The tastes choose between the cards that bring something, they never make a card that brings nothing worth laying
   * (a unit in the back lane that dies at the end of the turn)
   */
  private withoutUselessCards(plan: DeploymentPlan): DeploymentPlan {
    let { placements, artifacts } = plan
    let value = this.rawValue(placements, artifacts)
    for (const card of [...placements.map((placement) => placement.card), ...artifacts]) {
      const otherPlacements = placements.filter((placement) => placement.card !== card)
      const otherArtifacts = artifacts.filter((artifact) => artifact !== card)
      const otherValue = this.rawValue(otherPlacements, otherArtifacts)
      if (otherValue < value) continue
      placements = otherPlacements
      artifacts = otherArtifacts
      value = otherValue
    }
    if (placements === plan.placements && artifacts === plan.artifacts) return plan
    const units = this.rules.material(MaterialType.Unit)
    const tastes = [...placements.map((placement) => placement.card), ...artifacts].reduce((sum, card) => sum + this.taste.of(units.getItem(card).id), 0)
    return { placements, artifacts, value: value + tastes }
  }

  /** The value of the kingdom with these cards laid, without the tastes */
  private rawValue(placements: Placement[], artifacts: number[]): number {
    const units = this.rules.material(MaterialType.Unit)
    const firstArtifactCost = 1 + this.costs.artifactsBefore + this.placed.filter((index) => isArtifact(units.getItem<Card>(index).id)).length
    let spent = 0
    const undos: (() => void)[] = []
    for (const { card, x, y } of placements) {
      spent += unitCardCaracteristics[units.getItem<Unit>(card).id].cost
      undos.push(this.lay(card, { type: LocationType.PlayerUnitBoard, player: this.player, x, y, rotation: true }))
    }
    artifacts.forEach((artifact, i) => {
      spent += firstArtifactCost + i
      undos.push(this.lay(artifact, { type: LocationType.PlayerArtifacts, player: this.player, rotation: true }))
    })
    const deployed = [...placements.map((placement) => placement.card), ...artifacts]
    const value = this.evaluation.value({ goldSpent: this.costs.placedCost + spent, deployed: [...this.placed, ...deployed] })
    for (const undo of undos.reverse()) undo()
    return value
  }

  /** The Legendary Artifacts cost 1 gold, plus 1 for each artifact deployed before (rulebook p.11) */
  private placeArtifacts(artifacts: number[], from: number, placements: Placement[], laid: number[], spent: number, budget: number) {
    this.evaluate(placements, laid, spent)
    const nextCost =
      1 +
      this.costs.artifactsBefore +
      this.placed.filter((index) => isArtifact(this.rules.material(MaterialType.Unit).getItem<Card>(index).id)).length +
      laid.length
    if (spent + nextCost > budget) return
    for (let i = from; i < artifacts.length; i++) {
      const undo = this.lay(artifacts[i], { type: LocationType.PlayerArtifacts, player: this.player, rotation: true })
      this.placeArtifacts(artifacts, i + 1, placements, [...laid, artifacts[i]], spent + nextCost, budget)
      undo()
    }
  }

  private evaluate(placements: Placement[], artifacts: number[], spent: number) {
    const deployed = [...placements.map((placement) => placement.card), ...artifacts]
    const units = this.rules.material(MaterialType.Unit)
    const value =
      this.evaluation.value({ goldSpent: this.costs.placedCost + spent, deployed: [...this.placed, ...deployed] }) +
      deployed.reduce((sum, card) => sum + this.taste.of(units.getItem(card).id), 0)
    if (value > this.best.value) this.best = { placements, artifacts, value }
  }

  private occupant(x: number, y: number) {
    return this.rules
      .material(MaterialType.Unit)
      .location(LocationType.PlayerUnitBoard)
      .player(this.player)
      .filter((unit) => unit.location.x === x && unit.location.y === y)
      .getIndexes()
  }

  /** Lays a card on the copy of the game (a unit already on the space is discarded), and gives what puts it back */
  private lay(card: number, location: Location<number, LocationType>): () => void {
    const units = this.rules.material(MaterialType.Unit)
    const replaced = location.type === LocationType.PlayerUnitBoard ? this.occupant(location.x!, location.y!) : []
    const moved = [...replaced, card].map((index) => ({ index, location: { ...units.getItem(index).location } }))
    for (const index of replaced) this.rules.play(units.index(index).moveItem({ type: LocationType.Discard }), { transient: true })
    this.rules.play(units.index(card).moveItem(location), { transient: true })
    return () => {
      for (const { index, location } of moved.reverse()) {
        this.rules.play(this.rules.material(MaterialType.Unit).index(index).moveItem(location), { transient: true })
      }
    }
  }
}
