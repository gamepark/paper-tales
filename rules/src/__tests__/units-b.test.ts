/**
 * Behaviour tests for the unit cards Manticore (22) to Adventurer (42).
 * The expected values come only from the printed cards (app/src/images/units/en) and the rulebook (FR, p.3 to p.8).
 */
import { MaterialGame, MaterialMove, MoveKind } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { Gold } from '../material/Gold'
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
import { Memory } from '../rules/Memory'
import { RuleId } from '../rules/RuleId'

const { Blue, Red, Green } = PlayerColor

/** A game with no unit in play: the cards dealt by the setup go back to the deck */
const newRules = (players: PlayerColor[] = [Blue, Red, Green]) => {
  const game = new PaperTalesSetup().setup({ players: players.map((id) => ({ id })) }) as MaterialGame
  for (const item of game.items[MaterialType.Unit]!) {
    if (item.location.type !== LocationType.Deck) item.location = { type: LocationType.Deck }
  }
  return new PaperTalesRules(game)
}

/** Puts a copy of a unit on a player board (y 0 = Front, y 1 = Back), returns its index */
const place = (rules: PaperTalesRules, unit: Unit, player: PlayerColor, x: number, y: number, copy = 0) => {
  const index = rules.material(MaterialType.Unit).id(unit).getIndexes()[copy]
  rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.PlayerUnitBoard, player, x, y }
  return index
}

const addAge = (rules: PaperTalesRules, unitIndex: number, quantity = 1) => {
  const player = rules.game.items[MaterialType.Unit]![unitIndex].location.player
  rules.play(rules.material(MaterialType.Age).createItem({ location: { type: LocationType.OnCard, parent: unitIndex, player }, quantity }))
}

const ageOn = (rules: PaperTalesRules, unitIndex: number) => rules.material(MaterialType.Age).location(LocationType.OnCard).parent(unitIndex).getQuantity()

const build = (rules: PaperTalesRules, player: PlayerColor, building: Building, level2 = false) => {
  const index = rules.material(MaterialType.Building).player(player).id(building).getIndex()
  rules.game.items[MaterialType.Building]![index].location = { type: LocationType.PlayerBuildingBoard, player, rotation: level2 }
  return index
}

const setGold = (rules: PaperTalesRules, player: PlayerColor, amount: number) => {
  rules.game.items[MaterialType.Gold] = rules.game.items[MaterialType.Gold]!.filter((item) => item.location.player !== player)
  if (amount) {
    rules.play(rules.material(MaterialType.Gold).createItem({ id: Gold.Gold1, location: { type: LocationType.PlayerGoldStock, player }, quantity: amount }))
  }
}

const gold = (rules: PaperTalesRules, player: PlayerColor) => new BuildHelper(rules.game, player).gold

const setScore = (rules: PaperTalesRules, player: PlayerColor, score: number) => {
  const index = rules.material(MaterialType.ScoreToken).player(player).getIndex()
  rules.game.items[MaterialType.ScoreToken]![index].location.x = score
}

/** The units revealed this turn, for the "when revealed" effects */
const revealed = (rules: PaperTalesRules, byPlayer: Partial<Record<PlayerColor, number[]>>) => {
  for (const player of rules.players) rules.memorize(Memory.PlayedCardsDuringDeployment, byPlayer[player] ?? [], player)
}

const isItemMove = (move: MaterialMove) => move.kind === MoveKind.ItemMove

/** Runs the start of one phase and its consequences, without going on to the next phase */
const runPhase = (rules: PaperTalesRules, start: MaterialMove) => {
  const queue = rules.play(start).filter(isItemMove)
  while (queue.length) queue.push(...rules.play(rules.randomize(queue.shift()!)).filter(isItemMove))
}

const runRule = (rules: PaperTalesRules, ruleId: RuleId) => runPhase(rules, rules.startRule(ruleId))
const runSimultaneous = (rules: PaperTalesRules, ruleId: RuleId) => runPhase(rules, rules.startSimultaneousRule(ruleId, [...rules.players]))

const power = (rules: PaperTalesRules, player: PlayerColor) => new War(rules.game).getPlayerPower(player)
const unitPower = (rules: PaperTalesRules, index: number) => new War(rules.game).getUnitPower(rules.game.items[MaterialType.Unit]![index], index)
const resource = (rules: PaperTalesRules, player: PlayerColor, r: Resources) => new ResourcesHelper(rules.game, player).getResource(r)
const goldToPay = (rules: PaperTalesRules, player: PlayerColor, building: Building, action: BuildAction) =>
  new BuildHelper(rules.game, player).getGoldToPay(building, action)
const onBoard = (rules: PaperTalesRules, index: number) => rules.game.items[MaterialType.Unit]![index].location.type === LocationType.PlayerUnitBoard

describe('Manticore: phase 3, +2 strength for each food in your Kingdom', () => {
  it('without food: strength 2', () => {
    const rules = newRules()
    place(rules, Unit.Manticore, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(2)
  })

  it('with 2 food from units at the Back (Farmer, Forest Child): 2 + 4 = 6', () => {
    const rules = newRules()
    const manticore = place(rules, Unit.Manticore, Blue, 0, 0)
    place(rules, Unit.Farmer, Blue, 0, 1)
    place(rules, Unit.ForestChild, Blue, 1, 1)
    expect(unitPower(rules, manticore)).toBe(6)
    // The Back row units do not fight
    expect(power(rules, Blue)).toBe(6)
  })

  it('food produced by a Building counts too (Town level 1: wood + food): 2 + 2 = 4', () => {
    const rules = newRules()
    place(rules, Unit.Manticore, Blue, 0, 0)
    build(rules, Blue, Building.Town)
    expect(power(rules, Blue)).toBe(4)
  })
})

describe('Giant Snake: strength 0 instead of 4, and 3 gold at income, if there is an Age token or more on it', () => {
  it('without Age token: strength 4, no income from the card', () => {
    const rules = newRules()
    place(rules, Unit.GiantSnake, Blue, 0, 0)
    setGold(rules, Blue, 3)
    expect(power(rules, Blue)).toBe(4)
    runRule(rules, RuleId.Income)
    // The 2 gold of every Monarch only
    expect(gold(rules, Blue)).toBe(5)
  })

  it('with an Age token: strength 0, and 3 gold at income on top of the 2 base gold', () => {
    const rules = newRules()
    const snake = place(rules, Unit.GiantSnake, Blue, 0, 0)
    addAge(rules, snake)
    setGold(rules, Blue, 3)
    expect(power(rules, Blue)).toBe(0)
    runRule(rules, RuleId.Income)
    expect(gold(rules, Blue)).toBe(3 + 2 + 3)
  })

  it('with 2 Age tokens: still strength 0 and 3 gold ("or more")', () => {
    const rules = newRules()
    const snake = place(rules, Unit.GiantSnake, Blue, 0, 0)
    addAge(rules, snake, 2)
    expect(power(rules, Blue)).toBe(0)
    expect(new Income(rules.game).getPlayerIncome(Blue)).toBe(3)
  })
})

describe('Grand Architect: phase 5, pay 1 gold instead of a wood, a food or a crystal, as many times as you want', () => {
  it('replaces a missing food (Tavern level 1) by 1 gold', () => {
    const rules = newRules()
    place(rules, Unit.GrandArchitect, Blue, 0, 0)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Tavern, BuildAction.BuildLevel1)).toBe(1)
  })

  it('replaces a missing crystal (Temple level 1) by 1 gold, cheaper than the 2 gold alternative cost', () => {
    const rules = newRules()
    place(rules, Unit.GrandArchitect, Blue, 0, 0)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Temple, BuildAction.BuildLevel1)).toBe(1)
  })

  it('as many times as you want: Mine directly at level 2 (wood + wood + crystal) costs 3 gold', () => {
    const rules = newRules()
    place(rules, Unit.GrandArchitect, Blue, 0, 0)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Mine, BuildAction.BuildLevel2)).toBe(3)
  })

  it('without the Grand Architect, a missing food cannot be paid', () => {
    const rules = newRules()
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Tavern, BuildAction.BuildLevel1)).toBeUndefined()
  })
})

describe('Colossus: strength 7 instead of 1 with an Age token or more; 1 Legend point for each War won', () => {
  it('without Age token: strength 1', () => {
    const rules = newRules()
    const colossus = place(rules, Unit.Colossus, Blue, 0, 0)
    expect(unitPower(rules, colossus)).toBe(1)
  })

  it('with 1 or 2 Age tokens: strength 7', () => {
    const rules = newRules()
    const colossus = place(rules, Unit.Colossus, Blue, 0, 0)
    addAge(rules, colossus)
    expect(unitPower(rules, colossus)).toBe(7)
    addAge(rules, colossus)
    expect(unitPower(rules, colossus)).toBe(7)
  })

  it('3 players, 2 Wars won: 2 x 3 Legend points + 2 from the Colossus', () => {
    const rules = newRules()
    const colossus = place(rules, Unit.Colossus, Blue, 0, 0)
    addAge(rules, colossus)
    place(rules, Unit.Farmer, Red, 0, 0)
    runRule(rules, RuleId.War)
    expect(rules.getScore(Blue)).toBe(8)
  })

  it('3 players, no War won: no Legend point from the Colossus', () => {
    const rules = newRules()
    place(rules, Unit.Colossus, Blue, 0, 0) // strength 1
    place(rules, Unit.Archer, Red, 0, 0) // strength 2
    place(rules, Unit.Archer, Green, 0, 0, 1) // strength 2
    runRule(rules, RuleId.War)
    expect(rules.getScore(Blue)).toBe(0)
  })

  it('2 players, double strength wins 2 Wars: 2 x 3 + 2 Legend points', () => {
    const rules = newRules([Blue, Red])
    const colossus = place(rules, Unit.Colossus, Blue, 0, 0)
    addAge(rules, colossus)
    place(rules, Unit.Farmer, Red, 0, 0)
    runRule(rules, RuleId.War)
    expect(rules.getScore(Blue)).toBe(8)
  })
})

describe('Cerberus: strength 3 instead of 2 if your Kingdom produces at least one food', () => {
  it('without food: strength 2', () => {
    const rules = newRules()
    place(rules, Unit.Cerberus, Blue, 0, 0)
    place(rules, Unit.Hunter, Blue, 0, 1) // a Hunter at the Back produces no food
    expect(power(rules, Blue)).toBe(2)
  })

  it('with 1 food: strength 3', () => {
    const rules = newRules()
    const cerberus = place(rules, Unit.Cerberus, Blue, 0, 0)
    place(rules, Unit.Farmer, Blue, 0, 1)
    expect(unitPower(rules, cerberus)).toBe(3)
  })

  it('with 2 food: still strength 3 (not cumulative)', () => {
    const rules = newRules()
    const cerberus = place(rules, Unit.Cerberus, Blue, 0, 0)
    place(rules, Unit.Farmer, Blue, 0, 1)
    place(rules, Unit.ForestChild, Blue, 1, 1)
    expect(unitPower(rules, cerberus)).toBe(3)
  })
})

describe('Farmer: produces 1 food, strength 1', () => {
  it('produces 1 food, at the Back too', () => {
    const rules = newRules()
    place(rules, Unit.Farmer, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(0)
  })

  it('its food pays a Tavern level 1 without gold', () => {
    const rules = newRules()
    place(rules, Unit.Farmer, Blue, 0, 0)
    setGold(rules, Blue, 0)
    expect(goldToPay(rules, Blue, Building.Tavern, BuildAction.BuildLevel1)).toBe(0)
  })

  it('strength 1 at the Front', () => {
    const rules = newRules()
    place(rules, Unit.Farmer, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(1)
  })
})

describe('Kraken', () => {
  it('when revealed: -3 Legend points for each level 2 Building in your Kingdom', () => {
    const rules = newRules()
    const kraken = place(rules, Unit.Kraken, Blue, 0, 0)
    build(rules, Blue, Building.Mine, true)
    build(rules, Blue, Building.Tavern, true)
    build(rules, Blue, Building.Town) // level 1: no penalty
    setScore(rules, Blue, 10)
    revealed(rules, { [Blue]: [kraken] })
    runSimultaneous(rules, RuleId.DeployEffects)
    expect(rules.getScore(Blue)).toBe(4)
  })

  it('when revealed: an Age token on each of your other Units, none on the Kraken nor on other Kingdoms', () => {
    const rules = newRules()
    const kraken = place(rules, Unit.Kraken, Blue, 0, 0)
    const farmer = place(rules, Unit.Farmer, Blue, 1, 0)
    const archer = place(rules, Unit.Archer, Blue, 0, 1)
    addAge(rules, archer)
    const redFarmer = place(rules, Unit.Farmer, Red, 0, 0, 1)
    revealed(rules, { [Blue]: [kraken] })
    runSimultaneous(rules, RuleId.DeployEffects)
    expect(ageOn(rules, kraken)).toBe(0)
    expect(ageOn(rules, farmer)).toBe(1)
    expect(ageOn(rules, archer)).toBe(2)
    expect(ageOn(rules, redFarmer)).toBe(0)
  })

  it('already in play (not revealed this turn): no Legend point lost and no Age token given', () => {
    const rules = newRules()
    const kraken = place(rules, Unit.Kraken, Blue, 0, 0)
    const farmer = place(rules, Unit.Farmer, Blue, 1, 0)
    addAge(rules, kraken)
    build(rules, Blue, Building.Mine, true)
    setScore(rules, Blue, 10)
    revealed(rules, {})
    runSimultaneous(rules, RuleId.DeployEffects)
    expect(rules.getScore(Blue)).toBe(10)
    expect(ageOn(rules, farmer)).toBe(0)
  })

  it('strength 9', () => {
    const rules = newRules()
    place(rules, Unit.Kraken, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(9)
  })

  it('phase 6: 1 Legend point for each Age token on your Units when they die (the Kraken included)', () => {
    const rules = newRules()
    const kraken = place(rules, Unit.Kraken, Blue, 0, 0)
    addAge(rules, kraken) // dies, 1
    addAge(rules, place(rules, Unit.Farmer, Blue, 1, 0)) // dies, 1
    addAge(rules, place(rules, Unit.Blacksmith, Blue, 0, 1), 2) // dies, 2
    addAge(rules, place(rules, Unit.Salamander, Blue, 1, 1)) // does not die with 1 token
    runRule(rules, RuleId.AgeEffects)
    expect(rules.getScore(Blue)).toBe(4)
  })

  // UNSURE: Golem and Kraken revealed the same turn. Neither card says whether the Buildings the Golem improves count
  // for the Kraken penalty. In the code, DeployEffects.onRuleStart computes the Kraken score from the level 2 Buildings
  // before the Golem moves are played, so they do not count. No test written.
})

describe('Demon', () => {
  it('when revealed: an Age token on the Demon', () => {
    const rules = newRules()
    const demon = place(rules, Unit.Demon, Blue, 0, 0)
    revealed(rules, { [Blue]: [demon] })
    runSimultaneous(rules, RuleId.DeployEffects)
    expect(ageOn(rules, demon)).toBe(1)
  })

  it('already in play: no new Age token', () => {
    const rules = newRules()
    const demon = place(rules, Unit.Demon, Blue, 0, 0)
    revealed(rules, {})
    runSimultaneous(rules, RuleId.DeployEffects)
    expect(ageOn(rules, demon)).toBe(0)
  })

  it('strength 7', () => {
    const rules = newRules()
    place(rules, Unit.Demon, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(7)
  })

  it('phase 6: -3 Legend points if the Demon dies with one single Age token', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Demon, Blue, 0, 0))
    setScore(rules, Blue, 10)
    runRule(rules, RuleId.AgeEffects)
    expect(rules.getScore(Blue)).toBe(7)
  })

  it('phase 6: no loss if the Demon dies with 2 Age tokens', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Demon, Blue, 0, 0), 2)
    setScore(rules, Blue, 10)
    runRule(rules, RuleId.AgeEffects)
    expect(rules.getScore(Blue)).toBe(10)
  })

  it('phase 6: dies and is discarded with its token', () => {
    const rules = newRules()
    const demon = place(rules, Unit.Demon, Blue, 0, 0)
    addAge(rules, demon)
    runRule(rules, RuleId.AgeUnitsDie)
    expect(onBoard(rules, demon)).toBe(false)
    expect(rules.material(MaterialType.Age).location(LocationType.OnCard).player(Blue).getQuantity()).toBe(0)
  })
})

describe('Forest Child: produces 1 wood and 1 food', () => {
  it('produces 1 wood and 1 food', () => {
    const rules = newRules()
    place(rules, Unit.ForestChild, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(1)
    expect(resource(rules, Blue, Resources.Food)).toBe(1)
  })

  it('its resources pay a Mine or a Tavern level 1, but not the 2 wood of a Barracks directly at level 2', () => {
    const rules = newRules()
    place(rules, Unit.ForestChild, Blue, 0, 1)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Mine, BuildAction.BuildLevel1)).toBe(0)
    expect(goldToPay(rules, Blue, Building.Tavern, BuildAction.BuildLevel1)).toBe(0)
    expect(goldToPay(rules, Blue, Building.Barracks, BuildAction.BuildLevel2)).toBeUndefined()
  })
})

describe('Ogre: +1 strength for each gold earned in the income phase of the current turn', () => {
  it('alone: the 2 gold of the income phase, strength 2 + 2 = 4', () => {
    const rules = newRules()
    place(rules, Unit.Ogre, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(4)
  })

  it('with a Blacksmith (1 gold) at the Back: 2 + 1 gold earned, strength 2 + 3 = 5', () => {
    const rules = newRules()
    const ogre = place(rules, Unit.Ogre, Blue, 0, 0)
    place(rules, Unit.Blacksmith, Blue, 0, 1)
    expect(unitPower(rules, ogre)).toBe(5)
    // Same as the gold the income phase actually gives
    setGold(rules, Blue, 0)
    runRule(rules, RuleId.Income)
    expect(gold(rules, Blue)).toBe(3)
  })

  it('with a Temple level 1 (2 gold): 2 + 2 gold earned, strength 2 + 4 = 6', () => {
    const rules = newRules()
    const ogre = place(rules, Unit.Ogre, Blue, 0, 0)
    build(rules, Blue, Building.Temple)
    expect(unitPower(rules, ogre)).toBe(6)
  })
})

describe('Hunter: produces 1 food if it is at the Front, strength 2', () => {
  it('at the Front: 1 food, strength 2', () => {
    const rules = newRules()
    place(rules, Unit.Hunter, Blue, 0, 0)
    expect(resource(rules, Blue, Resources.Food)).toBe(1)
    expect(power(rules, Blue)).toBe(2)
  })

  it('at the Back: no food', () => {
    const rules = newRules()
    place(rules, Unit.Hunter, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(0)
  })
})

describe('Blacksmith: phase 4, 1 gold', () => {
  it('income phase: 2 + 1 gold', () => {
    const rules = newRules()
    place(rules, Unit.Blacksmith, Blue, 0, 1)
    setGold(rules, Blue, 3)
    runRule(rules, RuleId.Income)
    expect(gold(rules, Blue)).toBe(6)
  })

  it('two Blacksmiths: 2 + 2 gold', () => {
    const rules = newRules()
    place(rules, Unit.Blacksmith, Blue, 0, 0)
    place(rules, Unit.Blacksmith, Blue, 1, 0, 1)
    setGold(rules, Blue, 0)
    runRule(rules, RuleId.Income)
    expect(gold(rules, Blue)).toBe(4)
  })
})

describe('Relic of Wisdom: never dies; 2 Legend points for each Age token on it at the end of the game', () => {
  it('phase 6: does not die with Age tokens, and gets one more', () => {
    const rules = newRules()
    const relic = place(rules, Unit.RelicOfWisdom, Blue, 0, 0)
    addAge(rules, relic, 3)
    runRule(rules, RuleId.AgeUnitsDie)
    expect(onBoard(rules, relic)).toBe(true)
    runRule(rules, RuleId.AgeUnitsAge)
    expect(ageOn(rules, relic)).toBe(4)
  })

  it('end of the game: 3 Age tokens on it give 6 Legend points', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.RelicOfWisdom, Blue, 0, 0), 3)
    expect(new EndScoreHelper(rules.game, Blue).points).toBe(6)
    setScore(rules, Blue, 10)
    runRule(rules, RuleId.EndGame)
    expect(rules.getScore(Blue)).toBe(16)
  })

  it('strength 0', () => {
    const rules = newRules()
    place(rules, Unit.RelicOfWisdom, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(0)
  })
})

describe('Wood Merchant: phase 5, pay 1 gold instead of a wood, as many times as you want', () => {
  it('Mine level 1 (wood) without wood: 1 gold', () => {
    const rules = newRules()
    place(rules, Unit.WoodMerchant, Blue, 0, 0)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Mine, BuildAction.BuildLevel1)).toBe(1)
  })

  it('Town directly at level 2 (3 wood) without wood: 3 gold', () => {
    const rules = newRules()
    place(rules, Unit.WoodMerchant, Blue, 0, 0)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Town, BuildAction.BuildLevel2)).toBe(3)
  })

  it('does not replace a food: Tavern level 1 without food is impossible', () => {
    const rules = newRules()
    place(rules, Unit.WoodMerchant, Blue, 0, 0)
    setGold(rules, Blue, 10)
    expect(goldToPay(rules, Blue, Building.Tavern, BuildAction.BuildLevel1)).toBeUndefined()
  })
})

describe('Strategist: +1 strength for each Age token in your Kingdom; can fight from the Back', () => {
  it('at the Back without Age token: its strength 1 counts', () => {
    const rules = newRules()
    place(rules, Unit.Strategist, Blue, 0, 1)
    expect(power(rules, Blue)).toBe(1)
  })

  it('counts all the Age tokens of your Kingdom, not those of the other Kingdoms', () => {
    const rules = newRules()
    const strategist = place(rules, Unit.Strategist, Blue, 0, 1)
    addAge(rules, strategist)
    addAge(rules, place(rules, Unit.Farmer, Blue, 0, 0), 2)
    addAge(rules, place(rules, Unit.Farmer, Red, 0, 0, 1), 3)
    expect(unitPower(rules, strategist)).toBe(1 + 3)
    // + the Farmer at the Front
    expect(power(rules, Blue)).toBe(5)
  })
})

describe('Palm Reader: phase 6, 1 Legend point for each Age token on your Units when they die', () => {
  it('counts the tokens of your dying units only', () => {
    const rules = newRules()
    place(rules, Unit.PalmReader, Blue, 0, 0) // no token, does not die
    addAge(rules, place(rules, Unit.Farmer, Blue, 1, 0)) // dies, 1
    addAge(rules, place(rules, Unit.Blacksmith, Blue, 0, 1), 2) // dies, 2
    addAge(rules, place(rules, Unit.Salamander, Blue, 1, 1)) // does not die with 1 token
    addAge(rules, place(rules, Unit.Farmer, Red, 0, 0, 1)) // another Kingdom
    runRule(rules, RuleId.AgeEffects)
    expect(rules.getScore(Blue)).toBe(3)
  })

  it('when the Palm Reader itself dies, its token counts', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.PalmReader, Blue, 0, 0))
    runRule(rules, RuleId.AgeEffects)
    expect(rules.getScore(Blue)).toBe(1)
  })
})

describe('Archer: can fight from the Back, strength 2', () => {
  it('at the Back: its strength counts, not the one of another unit at the Back', () => {
    const rules = newRules()
    place(rules, Unit.Archer, Blue, 0, 1)
    place(rules, Unit.Farmer, Blue, 1, 1)
    expect(power(rules, Blue)).toBe(2)
  })
})

describe('Golem: when revealed, improve for free all your level 1 Buildings to level 2', () => {
  it('when revealed: every level 1 Building goes to level 2, for free', () => {
    const rules = newRules()
    const golem = place(rules, Unit.Golem, Blue, 0, 0)
    const mine = build(rules, Blue, Building.Mine)
    const tavern = build(rules, Blue, Building.Tavern)
    const town = build(rules, Blue, Building.Town, true)
    setGold(rules, Blue, 4)
    revealed(rules, { [Blue]: [golem] })
    runSimultaneous(rules, RuleId.DeployEffects)
    for (const index of [mine, tavern, town]) expect(rules.game.items[MaterialType.Building]![index].location.rotation).toBe(true)
    // The Buildings not built stay in hand
    expect(rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(Blue).length).toBe(2)
    expect(gold(rules, Blue)).toBe(4)
    // 3 level 2 Buildings: 3 x 3 Legend points at the end
    expect(new EndScoreHelper(rules.game, Blue).buildingsPoints).toBe(9)
  })

  it('already in play: the Buildings stay at level 1', () => {
    const rules = newRules()
    place(rules, Unit.Golem, Blue, 0, 0)
    const mine = build(rules, Blue, Building.Mine)
    revealed(rules, {})
    runSimultaneous(rules, RuleId.DeployEffects)
    expect(rules.game.items[MaterialType.Building]![mine].location.rotation).toBe(false)
  })

  it('strength 3', () => {
    const rules = newRules()
    place(rules, Unit.Golem, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(3)
  })
})

describe('Salamander: +1 strength for each Age token on it; dies only with 2 Age tokens or more', () => {
  it('strength 4, 5 with 1 token, 6 with 2 tokens', () => {
    const rules = newRules()
    const salamander = place(rules, Unit.Salamander, Blue, 0, 0)
    expect(unitPower(rules, salamander)).toBe(4)
    addAge(rules, salamander)
    expect(unitPower(rules, salamander)).toBe(5)
    addAge(rules, salamander)
    expect(unitPower(rules, salamander)).toBe(6)
  })

  it('phase 6 with 1 token: survives and gets a 2nd token', () => {
    const rules = newRules()
    const salamander = place(rules, Unit.Salamander, Blue, 0, 0)
    addAge(rules, salamander)
    runRule(rules, RuleId.AgeUnitsDie)
    expect(onBoard(rules, salamander)).toBe(true)
    runRule(rules, RuleId.AgeUnitsAge)
    expect(ageOn(rules, salamander)).toBe(2)
  })

  it('phase 6 with 2 tokens: dies, discarded with its tokens', () => {
    const rules = newRules()
    const salamander = place(rules, Unit.Salamander, Blue, 0, 0)
    addAge(rules, salamander, 2)
    runRule(rules, RuleId.AgeUnitsDie)
    expect(onBoard(rules, salamander)).toBe(false)
    expect(ageOn(rules, salamander)).toBe(0)
  })
})

describe('Monkey: cost -1; phase 6, 1 gold for each Age token on it when it dies', () => {
  it('deployment: a cost of -1 gives 1 gold', () => {
    const rules = newRules()
    const monkey = place(rules, Unit.Monkey, Blue, 0, 0)
    setGold(rules, Blue, 3)
    revealed(rules, { [Blue]: [monkey] })
    runRule(rules, RuleId.PayDeployedUnits)
    expect(gold(rules, Blue)).toBe(4)
  })

  it('dies with 1 token: 1 gold', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Monkey, Blue, 0, 0))
    setGold(rules, Blue, 0)
    runRule(rules, RuleId.AgeEffects)
    expect(gold(rules, Blue)).toBe(1)
  })

  it('dies with 2 tokens: 2 gold', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Monkey, Blue, 0, 0), 2)
    setGold(rules, Blue, 0)
    runRule(rules, RuleId.AgeEffects)
    expect(gold(rules, Blue)).toBe(2)
  })

  it('no token: does not die, no gold', () => {
    const rules = newRules()
    place(rules, Unit.Monkey, Blue, 0, 0)
    setGold(rules, Blue, 0)
    runRule(rules, RuleId.AgeEffects)
    expect(gold(rules, Blue)).toBe(0)
  })
})

describe('Adventurer: produces 1 crystal for each Age token on it', () => {
  it('no token: no crystal', () => {
    const rules = newRules()
    place(rules, Unit.Adventurer, Blue, 0, 0)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(0)
  })

  it('1 token: 1 crystal', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Adventurer, Blue, 0, 0))
    expect(resource(rules, Blue, Resources.Diamond)).toBe(1)
  })

  it('2 tokens, placed at once or one by one: 2 crystals', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Adventurer, Blue, 0, 0), 2)
    const other = place(rules, Unit.Adventurer, Red, 0, 0, 1)
    addAge(rules, other)
    addAge(rules, other)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(2)
    expect(resource(rules, Red, Resources.Diamond)).toBe(2)
  })

  it('3 tokens pay a Temple directly at level 2 (3 crystals) without gold', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.Adventurer, Blue, 0, 0), 3)
    setGold(rules, Blue, 0)
    expect(goldToPay(rules, Blue, Building.Temple, BuildAction.BuildLevel2)).toBe(0)
  })
})
