import { isEndPlayerTurn, isMoveItemType, MaterialGame, MaterialMove, MoveKind, RandomBot } from '@gamepark/rules-api'
import { maxBy, minBy } from 'es-toolkit/compat'
import { DeploymentPlanner } from './bot/DeploymentPlanner'
import { KingdomEvaluation } from './bot/KingdomEvaluation'
import { Taste } from './bot/Taste'
import { Building } from './material/Building'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PaperTalesRules } from './PaperTalesRules'
import { BuildAction, BuildHelper } from './rules/helpers/BuildHelper'
import { Memory } from './rules/Memory'
import { RuleId } from './rules/RuleId'

/** How much the tastes of the bot weigh against the value of its moves, in Legend points (see Taste) */
const TASTE_AMPLITUDE = 1

/**
 * A bot that plays reasonably, without crushing its opponents. It evaluates its kingdom in Legend points from what it
 * sees only (its view of the game, see KingdomEvaluation): it drafts the card that improves its best deployment the
 * most, deploys the best cards its gold pays, builds the building that is worth the most. Its tastes (see Taste) make
 * it play a good move rather than always the best one, and it never drafts a card just to deny it to a neighbour.
 *
 * The legal moves exclude the moves that would never end a turn. During the deployment, every move takes a card out of
 * the hand, so that the deployment ends in a few moves: a unit already in the kingdom is never moved to another space
 * nor discarded, and a unit of the hand is never laid on a unit placed this turn (which would go back to the hand, see
 * PlaceUnitOnBoard).
 */
export class PaperTalesBot extends RandomBot<MaterialGame, MaterialMove, number> {
  constructor(player: number) {
    super(PaperTalesRules, player)
  }

  override run(game: MaterialGame): MaterialMove[] {
    const legalMoves = this.getLegalMoves(game)
    if (legalMoves.length <= 1) return legalMoves
    const view = new PaperTalesRules(game).getPlayerView(this.player)
    const move = this.chooseMove(view, legalMoves)
    return move ? [move] : super.run(game)
  }

  private chooseMove(view: MaterialGame, legalMoves: MaterialMove[]): MaterialMove | undefined {
    switch (view.rule?.id) {
      case RuleId.Draft:
        return this.draft(view, legalMoves)
      case RuleId.PlaceUnitOnBoard:
        return this.deploy(view, legalMoves)
      case RuleId.Build:
        return this.build(view, legalMoves)
      default:
        return this.bestConsequences(view, legalMoves)
    }
  }

  private taste(view: MaterialGame) {
    return new Taste(this.player, new PaperTalesRules(view).remind<number>(Memory.Time), TASTE_AMPLITUDE)
  }

  /**
   * Keeps the card that makes the best deployment with the cards of the hand. At 2 players, the card discarded is the
   * least useful to the bot, not the most useful to the opponent.
   */
  private draft(view: MaterialGame, legalMoves: MaterialMove[]): MaterialMove | undefined {
    const rules = new PaperTalesRules(view)
    const hand = rules.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(this.player).getIndexes()
    const planner = new DeploymentPlanner(view, this.player, this.taste(view))
    // A card of the hand left out of the best deployment stays out of it with one card more: only the cards of that
    // deployment compete with the card drafted
    const plan = planner.plan(hand)
    const deployed = [...plan.placements.map((placement) => placement.card), ...plan.artifacts]
    const moves = legalMoves.filter(isMoveItemType(MaterialType.Unit))
    const values = new Map(moves.map((move) => [move.itemIndex, planner.plan([...deployed, move.itemIndex]).value]))
    const keep = moves.filter((move) => move.location.type === LocationType.PlayerUnitHand)
    if (keep.length) return maxBy(keep, (move) => values.get(move.itemIndex)!)
    return minBy(moves, (move) => values.get(move.itemIndex)!)
  }

  /** Lays the cards of the best deployment one by one, then discards the rest of the hand */
  private deploy(view: MaterialGame, legalMoves: MaterialMove[]): MaterialMove | undefined {
    const rules = new PaperTalesRules(view)
    const hand = rules.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(this.player).getIndexes()
    const plan = new DeploymentPlanner(view, this.player, this.taste(view)).plan(hand)
    const unitMoves = legalMoves.filter(isMoveItemType(MaterialType.Unit))
    for (const { card, x, y } of plan.placements) {
      const move = unitMoves.find((move) => move.itemIndex === card && move.location.type === LocationType.PlayerUnitBoard && move.location.x === x && move.location.y === y)
      if (move) return move
    }
    for (const artifact of plan.artifacts) {
      const move = unitMoves.find((move) => move.itemIndex === artifact && move.location.type === LocationType.PlayerArtifacts)
      if (move) return move
    }
    return legalMoves.find(isEndPlayerTurn) ?? unitMoves.find((move) => move.location.type === LocationType.Discard)
  }

  /** Builds what is worth the most, its cost paid, or nothing */
  private build(view: MaterialGame, legalMoves: MaterialMove[]): MaterialMove | undefined {
    const taste = this.taste(view)
    return maxBy(legalMoves, (move) => {
      const game = JSON.parse(JSON.stringify(view)) as MaterialGame
      const evaluation = new KingdomEvaluation(game, this.player)
      if (!isMoveItemType(MaterialType.Building)(move)) return evaluation.value()
      const rules = new PaperTalesRules(game)
      const building = rules.material(MaterialType.Building).getItem<Building>(move.itemIndex)
      const fromHand = building.location.type === LocationType.PlayerBuildingHand
      const action = !fromHand ? BuildAction.Upgrade : move.location.rotation ? BuildAction.BuildLevel2 : BuildAction.BuildLevel1
      const goldSpent = new BuildHelper(game, this.player).getGoldToPay(building.id, action) ?? 0
      rules.play(move, { transient: true })
      return evaluation.value({ goldSpent }) + taste.of(100 + building.id)
    })
  }

  /** Any other choice (an effect, a unit to save): the move whose consequences leave the best kingdom */
  private bestConsequences(view: MaterialGame, legalMoves: MaterialMove[]): MaterialMove | undefined {
    return maxBy(legalMoves, (move) => {
      try {
        const game = JSON.parse(JSON.stringify(view)) as MaterialGame
        const rules = new PaperTalesRules(game)
        const queue = [move]
        for (let i = 0; queue.length && i < 100; i++) {
          const next = queue.shift()!
          // The consequences stop at the end of the rule: the next phases do not depend on the choice
          if (next.kind === MoveKind.RulesMove) break
          queue.unshift(...rules.play(next))
        }
        return new KingdomEvaluation(game, this.player).value()
      } catch {
        return -Infinity
      }
    })
  }

  override getLegalMoves(game: MaterialGame): MaterialMove[] {
    const legalMoves = super.getLegalMoves(game)
    if (game.rule?.id !== RuleId.PlaceUnitOnBoard) return legalMoves
    const rules = new PaperTalesRules(game)
    const units = rules.material(MaterialType.Unit)
    const placedThisTurn: number[] = rules.remind(Memory.PlayedCardsDuringDeployment, this.player) ?? []
    return legalMoves.filter((move) => {
      if (!isMoveItemType(MaterialType.Unit)(move)) return true
      if (units.getItem(move.itemIndex).location.type === LocationType.PlayerUnitBoard) return false
      if (move.location.type !== LocationType.PlayerUnitBoard) return true
      return !units
        .location(LocationType.PlayerUnitBoard)
        .player(this.player)
        .filter((unit) => unit.location.x === move.location.x && unit.location.y === move.location.y)
        .getIndexes()
        .some((index) => placedThisTurn.includes(index))
    })
  }
}
