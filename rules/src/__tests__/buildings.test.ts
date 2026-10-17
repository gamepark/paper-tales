import { MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Resources } from '../material/Resources'
import { Unit } from '../material/Unit'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { War } from '../rules/3_War/War'
import { Income } from '../rules/4_Income/Income'
import { BuildAction, BuildHelper } from '../rules/helpers/BuildHelper'
import { EndScoreHelper } from '../rules/helpers/EndScoreHelper'
import { ResourcesHelper } from '../rules/helpers/ResourcesHelper'
import { ScoreHelper } from '../rules/helpers/ScoreHelper'
import { RuleId } from '../rules/RuleId'

/**
 * The 5 buildings, both faces, from the printed cards (docs/cards-audit.md). Blue and Red, no unit but the given ones,
 * Red's kingdom empty so that every war of Blue is won.
 */
const Blue = PlayerColor.Blue
const Red = PlayerColor.Red

const newGame = (units: Unit[], buildings: [Building, 1 | 2][]) => {
  const game = new PaperTalesSetup().setup({ players: [{ id: Blue }, { id: Red }] }) as MaterialGame
  for (const item of game.items[MaterialType.Unit]!) if (item.location.type === LocationType.PlayerDraftHand) item.location = { type: LocationType.Deck }
  const rules = new PaperTalesRules(game)
  units.forEach((unit, i) => {
    const index = rules.material(MaterialType.Unit).location(LocationType.Deck).id(unit).getIndexes()[0]
    game.items[MaterialType.Unit]![index].location = { type: LocationType.PlayerUnitBoard, player: Blue, x: i % 2, y: Math.floor(i / 2) }
  })
  for (const [building, level] of buildings) {
    const index = rules.material(MaterialType.Building).player(Blue).id(building).getIndex()
    game.items[MaterialType.Building]![index].location = { type: LocationType.PlayerBuildingBoard, player: Blue, rotation: level === 2 }
  }
  return { game, rules }
}

const playAll = (rules: PaperTalesRules, move: MaterialMove) => {
  const queue: MaterialMove[] = rules.play(move)
  while (queue.length) queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
}

/** The score Blue gains at the wars */
const warScore = (units: Unit[], buildings: [Building, 1 | 2][]) => {
  const { game, rules } = newGame(units, buildings)
  const before = new ScoreHelper(game, Blue).score
  playAll(rules, rules.startRule(RuleId.War))
  return new ScoreHelper(rules.game, Blue).score - before
}

describe('Mine', () => {
  it('level 1 produces a crystal', () => {
    const { game } = newGame([], [[Building.Mine, 1]])
    expect(new ResourcesHelper(game, Blue).getResource(Resources.Diamond)).toBe(1)
  })

  it('level 2: 2 Legend points for each crystal of the kingdom, at the wars', () => {
    // Mine 1 crystal + Miner 1 crystal = 2 crystals → 4 points; 1 Miner in front against an empty kingdom: 2 wars won
    // at 2 players only if at least double → strength 2 vs 0: 2 wars → 6 points
    expect(warScore([Unit.Miner], [[Building.Mine, 2]])).toBe(6 + 4)
  })
})

describe('Tavern', () => {
  it('level 1: income 1 gold for each food', () => {
    const { game } = newGame([Unit.Farmer], [[Building.Tavern, 1]])
    expect(new Income(game).getPlayerIncome(Blue)).toBe(1)
  })

  it('level 2: also 1 Legend point for each food at the wars', () => {
    expect(warScore([Unit.Farmer], [[Building.Tavern, 2]])).toBe(6 + 1)
  })
})

describe('Barracks', () => {
  it('level 1: +1 strength for each wood', () => {
    const { game } = newGame([Unit.Woodcutter], [[Building.Barracks, 1]])
    // Woodcutter: strength 2 and 1 wood → +1
    expect(new War(game).getPlayerPower(Blue)).toBe(3)
  })

  it('level 2: 1 Legend point for each unit of strength 3 or more', () => {
    // Knight (4) and Woodcutter (2): one unit of 3 or more. Strength 6 + 1 wood = 7 vs 0: 2 wars → 6 points
    expect(warScore([Unit.Knight, Unit.Woodcutter], [[Building.Barracks, 2]])).toBe(6 + 1)
  })
})

describe('Town', () => {
  it('level 1 produces a wood and a food', () => {
    const { game } = newGame([], [[Building.Town, 1]])
    const resources = new ResourcesHelper(game, Blue)
    expect([resources.getResource(Resources.Wood), resources.getResource(Resources.Food), resources.getResource(Resources.Diamond)]).toEqual([1, 1, 0])
  })

  it('level 2 also produces a crystal', () => {
    const { game } = newGame([], [[Building.Town, 2]])
    const resources = new ResourcesHelper(game, Blue)
    expect([resources.getResource(Resources.Wood), resources.getResource(Resources.Food), resources.getResource(Resources.Diamond)]).toEqual([1, 1, 1])
  })
})

describe('Temple', () => {
  it('level 1: income 2 gold', () => {
    const { game } = newGame([], [[Building.Temple, 1]])
    expect(new Income(game).getPlayerIncome(Blue)).toBe(2)
  })

  it('level 2: also 2 Legend points at the wars', () => {
    // No unit: strength 0 vs 0, a tie wins, and 0 is at least double 0 → 2 wars (6 points) + 2
    expect(warScore([], [[Building.Temple, 2]])).toBe(6 + 2)
  })

  it('costs a crystal or 2 gold at level 1, 2 crystals or 3 gold at level 2', () => {
    const { game } = newGame([], [])
    // Blue has 3 gold and no crystal: level 1 with the gold, land free (no building yet)
    const helper = new BuildHelper(game, Blue)
    expect(helper.getGoldToPay(Building.Temple, BuildAction.BuildLevel1)).toBe(2)
    expect(helper.getGoldToPay(Building.Temple, BuildAction.BuildLevel2)).toBeUndefined()
  })
})

describe('End of the game', () => {
  it('a building gives 1 point at level 1 and 3 at level 2', () => {
    const { game } = newGame([], [[Building.Mine, 1], [Building.Temple, 2]])
    expect(new EndScoreHelper(game, Blue).buildingsPoints).toBe(4)
  })
})
