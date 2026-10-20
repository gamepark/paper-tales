import { Card } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffects } from '@gamepark/paper-tales/rules/2_Deployment/DeployEffects'
import { MoveComponentContext } from '@gamepark/react-game'
import { CreateItem, isCreateItemType, isStartPlayerTurn, isStartRule, isStartSimultaneousRule, MaterialGame, MaterialMove, MoveItem } from '@gamepark/rules-api'

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

const isGoldGainOf = (player: number | undefined) => (move: MaterialMove) => isGoldGain(move) && move.item.location.player === player

const goldValue = (move: CreateItem) => (move.item.quantity ?? 1) * (move.item.id as number)

/**
 * A gain of gold comes as one coin of each value (5 gold and 2 gold for 7): the first coin tells the whole gain, the
 * others are not told. The gold of a gain, or undefined for the coins after the first one.
 */
export const goldGainTold = (move: CreateItem, context: LogContext): number | undefined => {
  const { moves, position } = actionMoves(context)
  const sameGain = isGoldGainOf(move.item.location.player)
  if (position > 0 && sameGain(moves[position - 1])) return
  let gold = 0
  for (let index = position; index < moves.length && sameGain(moves[index]); index++) gold += goldValue(moves[index] as CreateItem)
  return gold
}

/** The gold a Monarch gains in the same phase as a log entry: the moves of the action between two changes of rule */
export const goldGainedInPhase = (player: number, context: LogContext): number => {
  const { moves, position } = actionMoves(context)
  let start = position
  while (start > 0 && !isRuleChange(moves[start - 1])) start--
  let gold = 0
  for (let index = start; index < moves.length && !isRuleChange(moves[index]); index++) {
    const move = moves[index]
    if (isGoldGainOf(player)(move)) gold += goldValue(move as CreateItem)
  }
  return gold
}

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
