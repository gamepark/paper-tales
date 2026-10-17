import { MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { Gold } from '../material/Gold'
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
  while (queue.length) queue.push(...rules.play(rules.randomize(queue.shift()!)))
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

  it('cannot build what the kingdom cannot pay', () => {
    // Temple directly at level 2 needs 3 crystals, or gold instead of a cost; no crystal and 2 gold is not enough
    const { rules } = setup([], 2)
    expect(new BuildHelper(rules.game, PlayerColor.Blue).getGoldToPay(Building.Temple, BuildAction.BuildLevel2)).toBeUndefined()
  })
})
