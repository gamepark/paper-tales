import { isMoveItemType, isMoveItemTypeAtOnce, ItemMoveType, MaterialGame, MaterialMove, MaterialMoveRandomized, MoveKind } from '@gamepark/rules-api'
import { omit } from 'es-toolkit/compat'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'

const newGame = (count: number) => new PaperTalesSetup().setup({ players: Array.from({ length: count }, (_, i) => ({ id: (i + 1) as PlayerColor })) }) as MaterialGame

/** A random legal move of a random active Monarch; every active Monarch must have a move */
const randomMove = (rules: PaperTalesRules): MaterialMove => {
  const active = rules.players.filter((player) => rules.isTurnToPlay(player))
  const choices = active.map((player) => rules.getLegalMoves(player)).filter((moves) => moves.length)
  expect(choices.length, `an active Monarch has no move (rule ${rules.game.rule?.id})`).toBe(active.length)
  const moves = choices[Math.floor(Math.random() * choices.length)]
  return moves[Math.floor(Math.random() * moves.length)]
}

/** Plays a move and its consequences depth first, like the framework; `onMove` sees each move before it is played */
const play = (rules: PaperTalesRules, move: MaterialMove, onMove: (move: MaterialMoveRandomized, consequences: MaterialMove[]) => void) => {
  const queue: MaterialMove[] = [move]
  while (queue.length > 0) {
    const next = rules.randomize(queue.shift()!)
    const consequences = rules.play(next)
    onMove(next, consequences)
    queue.unshift(...consequences)
  }
}

/**
 * Watches the moves of one action: no item may be deleted twice, unless an item of its type was created in between (it
 * may have taken the freed index). The rules API throws on a second deletion, and the journal replays every action.
 */
const deletionTracker = () => {
  const deleted = new Set<string>()
  return (move: MaterialMove) => {
    if (move.kind !== MoveKind.ItemMove) return
    if (move.type === ItemMoveType.Create || move.type === ItemMoveType.CreateAtOnce) {
      for (const key of [...deleted]) if (key.startsWith(`${move.itemType}:`)) deleted.delete(key)
    }
    const indexes = move.type === ItemMoveType.Delete ? [move.itemIndex] : move.type === ItemMoveType.DeleteAtOnce ? move.indexes : []
    for (const index of indexes) {
      const key = `${move.itemType}:${index}`
      expect(deleted.has(key), `item ${index} of type ${move.itemType} deleted twice by one action`).toBe(false)
      deleted.add(key)
    }
  }
}

const unitLocations =[LocationType.Deck, LocationType.Discard, LocationType.PlayerDraftHand, LocationType.PlayerUnitHand, LocationType.PlayerUnitBoard]

/** What must hold at any time of a game, whatever the moves */
const checkInvariants = (rules: PaperTalesRules, totalUnits: number) => {
  const game = rules.game
  const units = game.items[MaterialType.Unit] ?? []
  expect(units.length, 'units are neither created nor deleted').toBe(totalUnits)
  for (const unit of units) {
    expect(unitLocations, `unit location ${unit.location.type}`).toContain(unit.location.type)
    expect(unit.quantity, 'a unit has no quantity').toBeUndefined()
  }
  for (const player of rules.players) {
    const board = rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player).getItems()
    const spots = board.map((unit) => `${unit.location.x},${unit.location.y}`)
    expect(new Set(spots).size, `two units on one spot of ${player}: ${spots}`).toBe(spots.length)
    for (const unit of board) {
      expect([0, 1]).toContain(unit.location.y)
      expect(unit.location.y === 0 ? [0, 1, 2] : [0, 1], `spot ${unit.location.x},${unit.location.y}`).toContain(unit.location.x)
    }
    // Every Monarch keeps their 5 Buildings, in hand or built
    const buildings = rules.material(MaterialType.Building).player(player)
    expect(buildings.length).toBe(5)
    expect(new Set(buildings.getItems<Building>().map((building) => building.id)).size).toBe(5)
    for (const building of buildings.getItems()) {
      expect([LocationType.PlayerBuildingHand, LocationType.PlayerBuildingBoard]).toContain(building.location.type)
    }
    // One score token on the track
    expect(rules.material(MaterialType.ScoreToken).location(LocationType.PlayerScore).player(player).length).toBe(1)
    expect(rules.getScore(player)).toBeGreaterThanOrEqual(0)
  }
  // Age tokens: on a unit in play of the same Monarch, never orphaned (a deleted item stays as a tombstone of quantity 0)
  for (const token of game.items[MaterialType.Age] ?? []) {
    if (token.quantity === 0) continue
    expect(token.location.type, 'an Age token out of a card').toBe(LocationType.OnCard)
    const unit = units[token.location.parent!]
    expect(unit, 'an Age token on a missing unit').toBeDefined()
    expect(unit.location.type, 'an orphan Age token: its unit left the board').toBe(LocationType.PlayerUnitBoard)
    expect(unit.location.player, 'an Age token of another Monarch').toBe(token.location.player)
  }
  // Gold: coins of 1 and 5 in the stocks of the Monarchs
  for (const coin of game.items[MaterialType.Gold] ?? []) {
    if (coin.quantity === 0) continue
    expect([1, 5]).toContain(coin.id)
    expect(coin.location.type).toBe(LocationType.PlayerGoldStock)
  }
}

/** The parts of a move the client does not know when it predicts it: the reveals, and the result of a shuffle */
const predictable = (move: MaterialMove) => omit(move as object, ['reveal', 'newIndexes'])

const snapshot = (game: MaterialGame) => JSON.parse(JSON.stringify(game))

describe('Random games on the rules alone', () => {
  /**
   * Every turn, an active Monarch plays one of their legal moves at random. A game must reach its end, with never an
   * active Monarch left without a move, and the invariants hold once each move and its consequences are played: no
   * unit lost or duplicated, two units never on one spot, no orphan Age token, 5 Buildings per Monarch, one score
   * token each.
   */
  it.each([2, 4, 7])('%i players: the game ends and the invariants hold after every action', (count) => {
    for (let g = 0; g < 10; g++) {
      const game = newGame(count)
      const rules = new PaperTalesRules(game)
      const totalUnits = game.items[MaterialType.Unit]!.length
      let steps = 0
      while (game.rule && steps++ < 3000) {
        // The moves of the action, to tell which one broke an invariant
        const played: string[] = []
        const checkDeletion = deletionTracker()
        play(rules, randomMove(rules), (move) => {
          played.push(`rule ${rules.game.rule?.id}: ${JSON.stringify(move)}`)
          checkDeletion(move)
        })
        try {
          checkInvariants(rules, totalUnits)
        } catch (error) {
          throw new Error(`${(error as Error).message}\nafter the moves:\n${played.join('\n')}`, { cause: error })
        }
      }
      expect(game.rule).toBeUndefined()
    }
  }, 600000)

  /**
   * The deck runs out at 7 players (42 cards, 35 dealt each turn): the discard is shuffled into a new deck, and a game
   * still ends with every card accounted for.
   */
  it('7 players: the deck runs out and the discard becomes the deck', () => {
    const game = newGame(7)
    const rules = new PaperTalesRules(game)
    let refilled = false
    while (game.rule) {
      play(rules, randomMove(rules), (move) => {
        if ((isMoveItemType(MaterialType.Unit)(move) || isMoveItemTypeAtOnce(MaterialType.Unit)(move)) && move.location.type === LocationType.Deck) refilled = true
      })
    }
    expect(refilled).toBe(true)
  }, 600000)

  /**
   * What each Monarch sees: the client replays every move from its own view of the game (the hidden cards have no id),
   * and predicts the consequences itself. Its state must stay equal to the view the server gives, and its predicted
   * consequences equal to the ones the server plays: a rule that reads a hidden id, or memorizes something computed
   * from one, breaks this.
   */
  it.each([2, 4, 7])('%i players: every Monarch, and a spectator, replay the game from their view and stay in sync', (count) => {
    const game = newGame(count)
    const rules = new PaperTalesRules(game)
    const viewers: (PlayerColor | undefined)[] = [...rules.players, undefined]
    // A client knows who it is: the framework then hides the items that leave its sight
    const clients = new Map(viewers.map((viewer) => [viewer, new PaperTalesRules(snapshot(rules.getView(viewer)), { player: viewer })] as const))
    let steps = 0
    while (game.rule && steps++ < 3000) {
      const move = randomMove(rules)
      // The views are computed before the move changes the game, like on the server
      const queue: MaterialMove[] = [move]
      while (queue.length > 0) {
        const next = rules.randomize(queue.shift()!)
        const views = new Map(viewers.map((viewer) => [viewer, rules.getMoveView(next, viewer)] as const))
        const consequences = rules.play(next)
        for (const viewer of viewers) {
          const client = clients.get(viewer)!
          const predicted = client.play(views.get(viewer)!)
          expect(predicted.map(predictable), `consequences predicted by ${viewer ?? 'the spectator'} after ${JSON.stringify(next)}`).toEqual(consequences.map(predictable))
          expect(snapshot(client.game), `the view of ${viewer ?? 'the spectator'} after ${JSON.stringify(next)}`).toEqual(snapshot(rules.getView(viewer)))
        }
        queue.unshift(...consequences)
      }
    }
    expect(game.rule).toBeUndefined()
  }, 600000)
})
