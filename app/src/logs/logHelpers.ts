import { Card } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffects } from '@gamepark/paper-tales/rules/2_Deployment/DeployEffects'
import { DeployCostHelper } from '@gamepark/paper-tales/rules/helpers/DeployCostHelper'
import { MoveComponentContext } from '@gamepark/react-game'
import { CreateItem, isCreateItemType, isMoveItemType, isStartPlayerTurn, isStartRule, isStartSimultaneousRule, MaterialGame, MaterialMove, MoveItem } from '@gamepark/rules-api'

/** What the log entries read on the moves of an action and on the game before them */

export type LogContext = MoveComponentContext<MaterialMove, number, MaterialGame>

/** The moves of the action of a log entry in the order they were played (the action, then its consequences), and the place of the entry */
const actionMoves = (context: LogContext) => ({
  moves: [context.action.move, ...context.action.consequences],
  position: context.consequenceIndex === undefined ? 0 : context.consequenceIndex + 1
})

/** Gold coins created in the stock of a Monarch */
export const isGoldGain = (move: MaterialMove): move is CreateItem =>
  isCreateItemType(MaterialType.Gold)(move) && move.item.location.type === LocationType.PlayerGoldStock

const isGoldGainOf =
  (player: number | undefined) =>
  (move: MaterialMove): move is CreateItem =>
    isGoldGain(move) && move.item.location.player === player

/** Age tokens laid on a unit of a Monarch */
export const isAgeTokenOf =
  (player: number | undefined) =>
  (move: MaterialMove): move is CreateItem =>
    isCreateItemType(MaterialType.Age)(move) && move.item.location.player === player

/** A card turned face up in the kingdom of a Monarch (the reveal only says { rotation: false }), read on the game before */
export const isRevealOf =
  (player: number | undefined, game: MaterialGame) =>
  (move: MaterialMove): move is MoveItem =>
    isMoveItemType(MaterialType.Unit)(move) && move.location.rotation === false && cardAt(game, move.itemIndex).location.player === player

const goldValue = (move: CreateItem) => (move.item.quantity ?? 1) * (move.item.id as number)

/**
 * Several moves in a row of an action told as one entry (the coins of a gain, the cards a Monarch reveals, the units
 * that age): the moves from the entry on that match, told by the first one, or undefined for the next ones.
 */
export const runFrom = <M extends MaterialMove>(context: LogContext, matches: (move: MaterialMove) => move is M): M[] | undefined => {
  const { moves, position } = actionMoves(context)
  if (position > 0 && matches(moves[position - 1])) return
  const run: M[] = []
  for (let index = position; index < moves.length; index++) {
    const move = moves[index]
    if (!matches(move)) break
    run.push(move)
  }
  return run
}

/**
 * A gain of gold comes as one coin of each value (5 gold and 2 gold for 7): the first coin tells the whole gain, the
 * others are not told. The gold of a gain, or undefined for the coins after the first one.
 */
export const goldGainTold = (move: CreateItem, context: LogContext): number | undefined =>
  runFrom(context, isGoldGainOf(move.item.location.player))?.reduce((gold, coins) => gold + goldValue(coins), 0)

/** The next moves of the action after an entry, until one that matches or the next change of rule */
export const nextMovesUntil = (context: LogContext, stop: (move: MaterialMove) => boolean): MaterialMove[] => {
  const { moves, position } = actionMoves(context)
  const next: MaterialMove[] = []
  for (let index = position + 1; index < moves.length && !stop(moves[index]) && !isRuleChange(moves[index]); index++) next.push(moves[index])
  return next
}

/** The gold a Monarch gains in some moves */
export const goldGainedIn = (moves: MaterialMove[], player: number): number =>
  moves.filter(isGoldGainOf(player)).reduce((gold, coins) => gold + goldValue(coins), 0)

/** A phase starts: a rule, a simultaneous rule or a player turn */
const isRuleChange = (move: MaterialMove) => isStartRule(move) || isStartSimultaneousRule(move) || isStartPlayerTurn(move)

/** The card a move takes out of a hidden place (the face of a laid card, the deck): the move itself reveals its id */
export const revealedCard = (move: MoveItem) => (move as MoveItem & { reveal?: { id?: Card } }).reveal?.id

/** A card of the deck (a unit, a Legendary Artifact), wherever it is */
export const cardAt = (game: MaterialGame, index: number) => new PaperTalesRules(game).material(MaterialType.Unit).getItem<Card>(index)

/** The card in play whose "when revealed" effect a Monarch is resolving, read on the game before the move */
export const deployEffectSource = (game: MaterialGame, player: PlayerColor): Card | undefined => {
  const source = new DeployEffects(game).getCurrentEffect(player)?.source
  return source === undefined ? undefined : cardAt(game, source).id
}

/** The Legend points of a move of the score marker, read on the game before the move */
export const scoreChange = (move: MoveItem, game: MaterialGame) => {
  const before = new PaperTalesRules(game).material(MaterialType.ScoreToken).getItem(move.itemIndex)
  return (move.location.x ?? 0) - (before.location.x ?? 0)
}

/** The Monarchs who laid no card this turn, read on the game before the reveal */
export const nothingDeployed = (game: MaterialGame): PlayerColor[] =>
  game.players.filter((player) => !new DeployCostHelper(game, player).placedIndexes.length)
