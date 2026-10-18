import { getEnumValues, ItemMoveType, MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { buildingCardCaracteristics } from '../material/BuildingCaracteristics'
import { Gold } from '../material/Gold'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { Memory } from '../rules/Memory'
import { Unit } from '../material/Unit'
import { unitCardCaracteristics } from '../material/UnitCaracteristics'
import { War } from '../rules/3_War/War'
import { RuleId } from '../rules/RuleId'

const newGame = (players: PlayerColor[]) => new PaperTalesSetup().setup({ players: players.map((id) => ({ id })) }) as MaterialGame

const playConsequences = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = rules.play(rules.randomize(move))
  while (queue.length > 0) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

const units = (rules: PaperTalesRules, type: LocationType) => rules.material(MaterialType.Unit).location(type)

/** The setup deals the first round: put the cards back in the deck to deal again */
const undeal = (game: MaterialGame) => {
  for (const item of game.items[MaterialType.Unit]!) if (item.location.type === LocationType.PlayerDraftHand) item.location = { type: LocationType.Deck }
}

describe('Rulebook p.5: the deal', () => {
  it('deals 5 cards to each Monarch and leaves the discard alone while the deck is enough', () => {
    const game = newGame([PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green])
    undeal(game)
    const rules = new PaperTalesRules(game)
    // A card already in the discard, as after a first round
    const card = units(rules, LocationType.Deck).getIndexes()[0]
    game.items[MaterialType.Unit]![card].location = { type: LocationType.Discard }
    const deckBefore = units(rules, LocationType.Deck).length

    playConsequences(rules, rules.startPlayerTurn(RuleId.Deal, PlayerColor.Blue))

    for (const player of game.players) expect(units(rules, LocationType.PlayerDraftHand).player(player).length).toBe(5)
    expect(units(rules, LocationType.Discard).length).toBe(1)
    expect(units(rules, LocationType.Deck).length).toBe(deckBefore - 15)
  })

  it('shuffles the discard into a new deck only when the deck runs out, then goes on dealing', () => {
    const game = newGame([PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green])
    undeal(game)
    const rules = new PaperTalesRules(game)
    // Only 4 cards left in the deck, the rest in the discard
    for (const index of units(rules, LocationType.Deck).getIndexes().slice(4)) {
      game.items[MaterialType.Unit]![index].location = { type: LocationType.Discard }
    }

    playConsequences(rules, rules.startPlayerTurn(RuleId.Deal, PlayerColor.Blue))

    for (const player of game.players) expect(units(rules, LocationType.PlayerDraftHand).player(player).length).toBe(5)
    expect(units(rules, LocationType.Discard).length).toBe(0)
  })

  it('deals 9 cards at 2 players (p.8)', () => {
    const game = newGame([PlayerColor.Blue, PlayerColor.Red])
    undeal(game)
    const rules = new PaperTalesRules(game)
    playConsequences(rules, rules.startPlayerTurn(RuleId.Deal, PlayerColor.Blue))
    for (const player of game.players) expect(units(rules, LocationType.PlayerDraftHand).player(player).length).toBe(9)
  })
})

describe('Rulebook p.8: the end of the game', () => {
  it('every building gives Legend points by its face', () => {
    for (const building of getEnumValues(Building)) {
      expect(buildingCardCaracteristics[building].points1).toBe(1)
      expect(buildingCardCaracteristics[building].points2).toBe(3)
    }
  })

  it('adds the Legend points of the built buildings to the score', () => {
    const game = newGame([PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green])
    const rules = new PaperTalesRules(game)
    const blueBuildings = rules.material(MaterialType.Building).player(PlayerColor.Blue).getIndexes()
    // Blue built a level 1 and a level 2 building: 1 + 3
    game.items[MaterialType.Building]![blueBuildings[0]].location = { type: LocationType.PlayerBuildingBoard, player: PlayerColor.Blue, rotation: false }
    game.items[MaterialType.Building]![blueBuildings[1]].location = { type: LocationType.PlayerBuildingBoard, player: PlayerColor.Blue, rotation: true }
    game.memory[Memory.Time] = 4

    playConsequences(rules, rules.startRule(RuleId.EndGame))

    expect(rules.getScore(PlayerColor.Blue)).toBe(4)
    expect(rules.getScore(PlayerColor.Red)).toBe(0)
  })

  it('breaks a tie with the gold left', () => {
    const game = newGame([PlayerColor.Blue, PlayerColor.Red])
    const rules = new PaperTalesRules(game)
    rules.play(rules.material(MaterialType.Gold).createItem({ id: Gold.Gold1, location: { type: LocationType.PlayerGoldStock, player: PlayerColor.Red }, quantity: 2 }))
    expect(rules.getTieBreaker(1, PlayerColor.Blue)).toBe(3)
    expect(rules.getTieBreaker(1, PlayerColor.Red)).toBe(5)
  })
})

describe('Rulebook p.6 and p.8: the wars', () => {
  // No unit in play: every kingdom has a strength of 0
  it('a tie wins, even at 0: each kingdom wins against both neighbours', () => {
    const rules = new PaperTalesRules(newGame([PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green]))
    for (const player of rules.players) expect(new War(rules.game).getWarsWon(player)).toBe(2)
  })

  it('at 2 players, a tie wins a war, and at least double wins two: 0 against 0 wins two', () => {
    const rules = new PaperTalesRules(newGame([PlayerColor.Blue, PlayerColor.Red]))
    for (const player of rules.players) expect(new War(rules.game).getWarsWon(player)).toBe(2)
  })
})

describe('Hidden information: the draft', () => {
  it('each hand given to a neighbour is shuffled, so the giver cannot follow its cards', () => {
    const players = [PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green]
    const rules = new PaperTalesRules(newGame(players))
    const consequences = rules.play(rules.startRule(RuleId.GiveDraftToNeighbor))
    const shuffles = consequences.filter((move) => move.kind === MoveKind.ItemMove && move.type === ItemMoveType.Shuffle)
    expect(shuffles).toHaveLength(players.length)
  })
})

describe('Rulebook p.5: deploying on a taken space', () => {
  /** Blue holds 2 cards of cost 0 in hand and has an older unit with an Age token on the front left space */
  const deployment = () => {
    const game = newGame([PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green])
    const rules = new PaperTalesRules(game)
    const free = units(rules, LocationType.PlayerDraftHand).getIndexes()
    // Cheap cards: the 3 gold of Blue pay for each one
    const cheap = units(rules, LocationType.Deck)
      .filter<Unit>((item) => unitCardCaracteristics[item.id].cost <= 1 && !(unitCardCaracteristics[item.id].effect ?? []).length)
      .getIndexes()
    const [older, first, second] = cheap
    const items = game.items[MaterialType.Unit]!
    items[older].location = { type: LocationType.PlayerUnitBoard, player: PlayerColor.Blue, x: 0, y: 0, rotation: false }
    for (const index of [first, second]) items[index].location = { type: LocationType.PlayerUnitHand, player: PlayerColor.Blue }
    for (const index of free) items[index].location = { type: LocationType.Deck }
    playConsequences(rules, rules.material(MaterialType.Age).createItem({ location: { type: LocationType.OnCard, parent: older, player: PlayerColor.Blue } }))
    playConsequences(rules, rules.startSimultaneousRule(RuleId.PlaceUnitOnBoard))
    return { rules, older, first, second }
  }
  const placeOnFrontLeft = (rules: PaperTalesRules, card: number) => {
    const move = rules
      .getLegalMoves(PlayerColor.Blue)
      .find((move) => move.kind === MoveKind.ItemMove && move.type === ItemMoveType.Move && move.itemIndex === card && move.location.type === LocationType.PlayerUnitBoard && move.location.x === 0 && move.location.y === 0)
    expect(move, 'a unit of the hand can be laid on a taken space').toBeDefined()
    playConsequences(rules, move!)
  }

  it('discards an older unit with its Age tokens, and the new unit takes its space', () => {
    const { rules, older, first } = deployment()
    placeOnFrontLeft(rules, first)
    expect(rules.material(MaterialType.Unit).getItem(older).location.type).toBe(LocationType.Discard)
    expect(rules.material(MaterialType.Age).location(LocationType.OnCard).parent(older).length).toBe(0)
    expect(rules.material(MaterialType.Unit).getItem(first).location).toMatchObject({ type: LocationType.PlayerUnitBoard, x: 0, y: 0 })
  })

  it('sends a unit placed this turn back to the hand', () => {
    const { rules, first, second } = deployment()
    placeOnFrontLeft(rules, first)
    placeOnFrontLeft(rules, second)
    expect(rules.material(MaterialType.Unit).getItem(first).location).toMatchObject({ type: LocationType.PlayerUnitHand, player: PlayerColor.Blue })
    expect(rules.remind<number[]>(Memory.PlayedCardsDuringDeployment, PlayerColor.Blue)).toEqual([second])
  })
})
