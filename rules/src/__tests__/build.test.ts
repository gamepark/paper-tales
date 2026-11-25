import { isEndPlayerTurn, MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { Gold } from '../material/Gold'
import { Resources } from '../material/Resources'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Unit } from '../material/Unit'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { BuildAction, BuildHelper } from '../rules/helpers/BuildHelper'
import { RuleId } from '../rules/RuleId'

const playAll = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = rules.play(move)
  while (queue.length) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

/** Blue owns a built Mine, the given units, and the given gold */
const setup = (units: Unit[], gold: number) => {
  const game = new PaperTalesSetup().setup({ players: [{ id: PlayerColor.Blue }, { id: PlayerColor.Red }] }) as MaterialGame
  const rules = new PaperTalesRules(game)
  units.forEach((unit, x) => {
    const index = rules.material(MaterialType.Unit).id(unit).getIndexes()[0]
    game.items[MaterialType.Unit]![index].location = { type: LocationType.PlayerUnitBoard, player: PlayerColor.Blue, x, y: 0 }
  })
  const mine = rules.material(MaterialType.Building).player(PlayerColor.Blue).id(Building.Mine).getIndex()
  game.items[MaterialType.Building]![mine].location = { type: LocationType.PlayerBuildingBoard, player: PlayerColor.Blue, rotation: false }
  game.items[MaterialType.Gold] = game.items[MaterialType.Gold]!.filter((item) => item.location.player !== PlayerColor.Blue)
  rules.play(rules.material(MaterialType.Gold).createItem({ id: Gold.Gold1, location: { type: LocationType.PlayerGoldStock, player: PlayerColor.Blue }, quantity: gold }))
  return { game, rules }
}

describe('Rulebook p.7: paying a construction', () => {
  it('directly at level 2: land + the level 1 cost + the level 2 cost, missing wood replaced by gold (Wood Merchant)', () => {
    // Town: level 1 wood, level 2 wood + wood → 3 wood. The Peddler produces 1 wood, the Wood Merchant replaces wood by gold
    const { rules } = setup([Unit.Peddler, Unit.WoodMerchant], 7)
    const helper = new BuildHelper(rules.game, PlayerColor.Blue)
    const woods = helper.resources.filter((r) => r === 1).length
    // Land: 2 gold for the Mine already built, then one gold per missing wood
    expect(helper.getGoldToPay(Building.Town, BuildAction.BuildLevel2)).toBe(2 + (3 - woods))
  })

  it('pays everything at once, without failing on the coins', () => {
    const { rules } = setup([Unit.Peddler, Unit.WoodMerchant], 7)
    playAll(rules, rules.startSimultaneousRule(RuleId.Build))
    const helper = new BuildHelper(rules.game, PlayerColor.Blue)
    const toPay = helper.getGoldToPay(Building.Town, BuildAction.BuildLevel2)!
    const town = rules.material(MaterialType.Building).player(PlayerColor.Blue).id(Building.Town).getIndex()
    playAll(rules, rules.material(MaterialType.Building).index(town).moveItem({ type: LocationType.PlayerBuildingBoard, player: PlayerColor.Blue, rotation: true }))
    expect(new BuildHelper(rules.game, PlayerColor.Blue).gold).toBe(7 - toPay)
  })

  it('tells how it is paid: the land, the cost of each level, what is produced and what gold replaces', () => {
    const { rules } = setup([Unit.Peddler, Unit.WoodMerchant], 7)
    const helper = new BuildHelper(rules.game, PlayerColor.Blue)
    const woods = helper.resources.filter((r) => r === Resources.Wood).length
    const payment = helper.getPayment(Building.Town, BuildAction.BuildLevel2)!
    expect(payment.field).toBe(2)
    expect(payment.levels.map((level) => [level.level, level.cost])).toEqual([[1, [Resources.Wood]], [2, [Resources.Wood, Resources.Wood]]])
    expect(payment.produced).toEqual(Array(woods).fill(Resources.Wood))
    expect(payment.replacedByGold).toEqual(Array(3 - woods).fill(Resources.Wood))
    expect(payment.total).toBe(helper.getGoldToPay(Building.Town, BuildAction.BuildLevel2))
  })

  it('a cost the kingdom does not produce is paid with the gold printed beside it', () => {
    // Temple directly at level 2: level 1 a crystal (or 2 gold), level 2 two crystals (or 3 gold). The Mine produces one
    // crystal: it pays level 1, the 3 gold pay level 2, plus the land
    const { rules } = setup([], 5)
    const payment = new BuildHelper(rules.game, PlayerColor.Blue).getPayment(Building.Temple, BuildAction.BuildLevel2)!
    expect(payment.levels).toEqual([
      { level: 1, cost: [Resources.Diamond] },
      { level: 2, cost: [Resources.Gold, Resources.Gold, Resources.Gold], alternate: true }
    ])
    expect(payment.produced).toEqual([Resources.Diamond])
    expect(payment.printedGold).toBe(3)
    expect(payment.total).toBe(5)
  })

  it('cannot build what the kingdom cannot pay', () => {
    // Temple directly at level 2 needs 3 crystals, or gold instead of a cost; no crystal and 2 gold is not enough
    const { rules } = setup([], 2)
    expect(new BuildHelper(rules.game, PlayerColor.Blue).getGoldToPay(Building.Temple, BuildAction.BuildLevel2)).toBeUndefined()
  })
})

describe('Rulebook p.7: the constructions are chosen at the same time', () => {
  const buildPhase = () => {
    const game = new PaperTalesSetup().setup({ players: [{ id: PlayerColor.Blue }, { id: PlayerColor.Red }, { id: PlayerColor.Green }] }) as MaterialGame
    const rules = new PaperTalesRules(game)
    for (const player of rules.players) {
      rules.play(rules.material(MaterialType.Gold).createItem({ id: Gold.Gold1, location: { type: LocationType.PlayerGoldStock, player }, quantity: 10 }))
    }
    playAll(rules, rules.startSimultaneousRule(RuleId.Build))
    return rules
  }
  const construction = (rules: PaperTalesRules, player: PlayerColor) =>
    rules.getLegalMoves(player).find((move) => move.kind === MoveKind.ItemMove && move.itemType === MaterialType.Building)!

  // Like the server: the secret is asked once the move is played, with its consequences
  it('a construction, or the choice not to build, reaches the others only once every Monarch has chosen', () => {
    const rules = buildPhase()
    const blueBuilds = construction(rules, PlayerColor.Blue)
    playAll(rules, blueBuilds)
    expect(rules.keepMoveSecret(blueBuilds, PlayerColor.Red)).toBe(true)
    expect(rules.keepMoveSecret(blueBuilds, PlayerColor.Blue)).toBe(false)

    const redPasses = rules.getLegalMoves(PlayerColor.Red).find(isEndPlayerTurn)!
    playAll(rules, redPasses)
    expect(rules.keepMoveSecret(redPasses, PlayerColor.Blue)).toBe(true)

    const greenBuilds = construction(rules, PlayerColor.Green)
    expect(rules.isUnpredictableMove(rules.startRule(RuleId.AgeEffects), PlayerColor.Green)).toBe(true)
    playAll(rules, greenBuilds)

    // Everyone has chosen: the phase is over, nothing is secret any more
    expect(rules.game.rule?.id).not.toBe(RuleId.Build)
    expect(rules.keepMoveSecret(blueBuilds, PlayerColor.Red)).toBe(false)
    expect(rules.keepMoveSecret(redPasses, PlayerColor.Blue)).toBe(false)
  })

  it('the last reading of the war summary starts the constructions for everybody: it is not secret', () => {
    const game = new PaperTalesSetup().setup({ players: [{ id: PlayerColor.Blue }, { id: PlayerColor.Red }, { id: PlayerColor.Green }] }) as MaterialGame
    const rules = new PaperTalesRules(game)
    playAll(rules, rules.startSimultaneousRule(RuleId.WarSummary))
    const readings = rules.players.map((player) => rules.getLegalMoves(player).find(isEndPlayerTurn)!)
    readings.forEach((reading) => playAll(rules, reading))
    expect(rules.game.rule?.id).toBe(RuleId.Build)
    for (const reading of readings) {
      for (const player of rules.players) expect(rules.keepMoveSecret(reading, player)).toBe(false)
    }
  })
})
