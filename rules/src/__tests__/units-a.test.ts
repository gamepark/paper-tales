import { CustomMove, isCustomMoveType, isEndPlayerTurn, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Building } from '../material/Building'
import { Gold } from '../material/Gold'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Resources } from '../material/Resources'
import { theRealDeck, Unit } from '../material/Unit'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { War } from '../rules/3_War/War'
import { Income } from '../rules/4_Income/Income'
import { CustomMoveType } from '../rules/CustomMoveType'
import { BuildAction, BuildHelper } from '../rules/helpers/BuildHelper'
import { ResourcesHelper } from '../rules/helpers/ResourcesHelper'
import { ScoreHelper } from '../rules/helpers/ScoreHelper'
import { Memory } from '../rules/Memory'
import { RuleId } from '../rules/RuleId'

/**
 * Behaviour of the unit cards 1 to 21 (Commander to Landlord).
 * Every expected value comes from the printed card (app/src/images/units/en) and the rulebook, never from the code.
 */

const { Blue, Red, Green } = PlayerColor

/** A game whose first deal is put back in the deck: no card anywhere but in the deck */
const newRules = (players: PlayerColor[] = [Blue, Red]) => {
  const game = new PaperTalesSetup().setup({ players: players.map((id) => ({ id })) }) as MaterialGame
  for (const item of game.items[MaterialType.Unit]!) if (item.location.type !== LocationType.Deck) item.location = { type: LocationType.Deck }
  return new PaperTalesRules(game)
}

/** Plays a move and all its consequences; stops (dropping what is left) as soon as the rule `until` is reached */
const run = (rules: PaperTalesRules, move: MaterialMove, until?: RuleId) => {
  const queue: MaterialMove[] = rules.play(rules.randomize(move))
  while (queue.length > 0) {
    if (until !== undefined && rules.game.rule?.id === until) return
    queue.push(...rules.play(rules.randomize(queue.shift()!)))
  }
}

/** Takes a copy of the unit from the deck and puts it on the board of the player, face up */
const place = (rules: PaperTalesRules, unit: Unit, player: PlayerColor, x: number, y: number) => {
  const index = rules.material(MaterialType.Unit).location(LocationType.Deck).id(unit).getIndexes()[0]
  if (index === undefined) throw new Error(`No ${Unit[unit]} left in the deck`)
  rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.PlayerUnitBoard, player, x, y }
  return index
}

const addAge = (rules: PaperTalesRules, unitIndex: number, player: PlayerColor, quantity: number) =>
  rules.play(rules.material(MaterialType.Age).createItem({ location: { type: LocationType.OnCard, parent: unitIndex, player }, quantity }))

const ageOn = (rules: PaperTalesRules, unitIndex: number) => rules.material(MaterialType.Age).location(LocationType.OnCard).parent(unitIndex).getQuantity()

const setGold = (rules: PaperTalesRules, player: PlayerColor, quantity: number) => {
  rules.game.items[MaterialType.Gold] = rules.game.items[MaterialType.Gold]!.filter((item) => item.location.player !== player)
  if (quantity > 0) rules.play(rules.material(MaterialType.Gold).createItem({ id: Gold.Gold1, location: { type: LocationType.PlayerGoldStock, player }, quantity }))
}

const gold = (rules: PaperTalesRules, player: PlayerColor) => new BuildHelper(rules.game, player).gold
const score = (rules: PaperTalesRules, player: PlayerColor) => new ScoreHelper(rules.game, player).score
const power = (rules: PaperTalesRules, player: PlayerColor) => new War(rules.game).getPlayerPower(player)
const resource = (rules: PaperTalesRules, player: PlayerColor, r: Resources) => new ResourcesHelper(rules.game, player).getResource(r)
const income = (rules: PaperTalesRules, player: PlayerColor) => new Income(rules.game).getPlayerIncome(player)

const build = (rules: PaperTalesRules, player: PlayerColor, building: Building, level2 = false) => {
  const index = rules.material(MaterialType.Building).player(player).id(building).getIndex()
  rules.game.items[MaterialType.Building]![index].location = { type: LocationType.PlayerBuildingBoard, player, rotation: level2 }
}

const location = (rules: PaperTalesRules, unitIndex: number) => rules.material(MaterialType.Unit).getItem(unitIndex).location

/** The units revealed this turn, for each player (the others have none) */
const deployed = (rules: PaperTalesRules, revealed: Partial<Record<PlayerColor, number[]>>) => {
  for (const player of rules.players) rules.memorize(Memory.PlayedCardsDuringDeployment, revealed[player] ?? [], player)
}

/** Starts the deployment effects, after the reveal; stops at the War */
const runDeployEffects = (rules: PaperTalesRules) => run(rules, rules.startSimultaneousRule(RuleId.DeployEffects), RuleId.War)

/** Pays the units revealed this turn (rulebook p.5); stops at the deployment effects */
const payDeployment = (rules: PaperTalesRules) => run(rules, rules.startRule(RuleId.PayDeployedUnits), RuleId.DeployEffects)

/** The War phase alone: stops at the Income */
const runWar = (rules: PaperTalesRules) => run(rules, rules.startRule(RuleId.War), RuleId.Income)

/** The Income phase alone: stops at the construction */
const runIncome = (rules: PaperTalesRules) => run(rules, rules.startRule(RuleId.Income), RuleId.Build)

/** The construction phase where every Monarch passes, then the Age phase, up to the next turn (or a Mystical Healer choice) */
const runBuildPassAndAge = (rules: PaperTalesRules) => {
  run(rules, rules.startSimultaneousRule(RuleId.Build))
  for (const player of rules.players) {
    const pass = rules.getLegalMoves(player).find(isEndPlayerTurn)
    if (pass) run(rules, pass, RuleId.NextTurn)
  }
}

/** The Age phase alone (no Mystical Healer): stops at the next turn */
const runAge = (rules: PaperTalesRules) => run(rules, rules.startRule(RuleId.AgeEffects), RuleId.NextTurn)

const placeAgeTokenOn = (rules: PaperTalesRules, player: PlayerColor, unitIndex: number) =>
  rules
    .getLegalMoves(player)
    .find((move) => isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move) && (move as CustomMove).data.unitIndex === unitIndex)

const copies = (unit: Unit) => theRealDeck.filter((u) => u === unit).length

/** Printed cost, checked by paying the unit when it is revealed */
const expectCost = (unit: Unit, cost: number) => {
  const rules = newRules()
  const index = place(rules, unit, Blue, 0, 0)
  setGold(rules, Blue, 6)
  deployed(rules, { [Blue]: [index] })
  payDeployment(rules)
  expect(gold(rules, Blue)).toBe(6 - cost)
}

/** Printed strength: counted in the front row, not in the back row (rulebook p.6) */
const expectStrength = (unit: Unit, strength: number) => {
  const front = newRules()
  place(front, unit, Blue, 0, 0)
  expect(power(front, Blue)).toBe(strength)
  const back = newRules()
  place(back, unit, Blue, 0, 1)
  expect(power(back, Blue)).toBe(0)
}

const printed = (unit: Unit, cost: number, strength: number, nbCopies: number) => {
  it(`costs ${cost} gold`, () => expectCost(unit, cost))
  it(`has a strength of ${strength}`, () => expectStrength(unit, strength))
  it(`has ${nbCopies} copies`, () => expect(copies(unit)).toBe(nbCopies))
}

describe('Commander', () => {
  printed(Unit.Commander, 2, 4, 2)

  it('phase 3: 1 Legend point for each War won (2 wars won: 3 + 3 + 1 + 1)', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.Commander, Blue, 0, 0)
    runWar(rules)
    expect(score(rules, Blue)).toBe(8)
  })

  it('phase 3: no point when no War is won', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.Commander, Blue, 0, 0)
    place(rules, Unit.Knight, Red, 0, 0)
    place(rules, Unit.Knight, Red, 1, 0)
    place(rules, Unit.Knight, Green, 0, 0)
    place(rules, Unit.CaveSpirit, Green, 1, 0)
    runWar(rules)
    expect(score(rules, Blue)).toBe(0)
  })

  it('phase 3, 2 players: a double strength wins 2 Wars, so 2 points from the Commander', () => {
    const rules = newRules([Blue, Red])
    place(rules, Unit.Commander, Blue, 0, 0)
    runWar(rules)
    expect(score(rules, Blue)).toBe(8)
  })
})

describe('Militiaman', () => {
  printed(Unit.Militiaman, 0, 2, 3)

  it('phase 3: +1 strength for each Age token on Militiaman', () => {
    const rules = newRules()
    const militiaman = place(rules, Unit.Militiaman, Blue, 0, 0)
    addAge(rules, militiaman, Blue, 2)
    expect(power(rules, Blue)).toBe(4)
  })

  it('phase 3: the Age tokens on another unit do not count', () => {
    const rules = newRules()
    place(rules, Unit.Militiaman, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    addAge(rules, knight, Blue, 1)
    expect(power(rules, Blue)).toBe(2 + 4)
  })
})

describe('Time Master', () => {
  printed(Unit.TimeMaster, 0, 1, 3)

  it('phase 2, when revealed: 2 Age tokens on one of your units, of your choice', () => {
    const rules = newRules()
    const timeMaster = place(rules, Unit.TimeMaster, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, { [Blue]: [timeMaster] })
    runDeployEffects(rules)
    expect(rules.game.rule?.id).toBe(RuleId.ChooseWherePlacingAgeToken)
    const choice = placeAgeTokenOn(rules, Blue, knight)
    expect(choice).toBeDefined()
    expect(placeAgeTokenOn(rules, Blue, timeMaster)).toBeDefined()
    run(rules, choice!, RuleId.War)
    expect(ageOn(rules, knight)).toBe(2)
    expect(ageOn(rules, timeMaster)).toBe(0)
    expect(rules.game.rule?.id).toBe(RuleId.War)
  })

  it('phase 2: nothing when the Time Master was not revealed this turn', () => {
    const rules = newRules()
    const timeMaster = place(rules, Unit.TimeMaster, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, {})
    runDeployEffects(rules)
    expect(rules.game.rule?.id).toBe(RuleId.War)
    expect(ageOn(rules, knight)).toBe(0)
    expect(ageOn(rules, timeMaster)).toBe(0)
  })
})

describe('Peddler', () => {
  printed(Unit.Peddler, 1, 1, 3)

  it('produces 1 wood', () => {
    const rules = newRules()
    place(rules, Unit.Peddler, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(1)
    // The wood pays a Mine (level 1: 1 wood): nothing to pay without any building yet
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Mine, BuildAction.BuildLevel1)).toBe(0)
  })

  it('phase 4: gain 1 gold (2 + 1)', () => {
    const rules = newRules()
    place(rules, Unit.Peddler, Blue, 0, 1)
    setGold(rules, Blue, 0)
    expect(income(rules, Blue)).toBe(1)
    runIncome(rules)
    expect(gold(rules, Blue)).toBe(3)
  })
})

describe('Rogue', () => {
  printed(Unit.Rogue, 1, 3, 2)

  it('phase 3: gain 1 gold for each War won (2 wars)', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.Rogue, Blue, 0, 0)
    setGold(rules, Blue, 0)
    runWar(rules)
    expect(gold(rules, Blue)).toBe(2)
    expect(score(rules, Blue)).toBe(6)
  })

  it('phase 3: no gold when no War is won', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.Rogue, Blue, 0, 0)
    place(rules, Unit.Knight, Red, 0, 0)
    place(rules, Unit.Knight, Green, 0, 0)
    setGold(rules, Blue, 0)
    runWar(rules)
    expect(gold(rules, Blue)).toBe(0)
  })

  it('phase 3: one War won, 1 gold', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.Rogue, Blue, 0, 0)
    place(rules, Unit.Knight, Red, 0, 0)
    setGold(rules, Blue, 0)
    runWar(rules)
    expect(gold(rules, Blue)).toBe(1)
  })
})

describe('Sculptor', () => {
  printed(Unit.Sculptor, 0, 1, 2)

  it('phase 6: 3 Legend points when Sculptor dies', () => {
    const rules = newRules()
    const sculptor = place(rules, Unit.Sculptor, Blue, 0, 0)
    addAge(rules, sculptor, Blue, 1)
    runAge(rules)
    expect(location(rules, sculptor).type).toBe(LocationType.Discard)
    expect(score(rules, Blue)).toBe(3)
  })

  it('phase 6: nothing while Sculptor does not die (it only gets its first Age token)', () => {
    const rules = newRules()
    const sculptor = place(rules, Unit.Sculptor, Blue, 0, 0)
    runAge(rules)
    expect(location(rules, sculptor).type).toBe(LocationType.PlayerUnitBoard)
    expect(ageOn(rules, sculptor)).toBe(1)
    expect(score(rules, Blue)).toBe(0)
  })

  it('phase 6: the 3 points also when a Mystical Healer is in play at the table', () => {
    const rules = newRules()
    const sculptor = place(rules, Unit.Sculptor, Blue, 0, 0)
    addAge(rules, sculptor, Blue, 1)
    place(rules, Unit.MysticalHealer, Red, 0, 0)
    runBuildPassAndAge(rules)
    expect(location(rules, sculptor).type).toBe(LocationType.Discard)
    expect(score(rules, Blue)).toBe(3)
  })
})

describe('Treefolk', () => {
  printed(Unit.Treefolk, 1, 3, 2)

  it('produces 1 food, wherever it is placed', () => {
    const rules = newRules()
    place(rules, Unit.Treefolk, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(1)
    // The food pays a Tavern (level 1: 1 food)
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Tavern, BuildAction.BuildLevel1)).toBe(0)
  })
})

describe('Necromancer', () => {
  printed(Unit.Necromancer, 1, 4, 1)

  it('phase 2, when revealed: 1 Age token on each of your other units', () => {
    const rules = newRules()
    const necromancer = place(rules, Unit.Necromancer, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    const militiaman = place(rules, Unit.Militiaman, Blue, 0, 1)
    const redKnight = place(rules, Unit.Knight, Red, 0, 0)
    deployed(rules, { [Blue]: [necromancer] })
    runDeployEffects(rules)
    expect(ageOn(rules, knight)).toBe(1)
    expect(ageOn(rules, militiaman)).toBe(1)
    expect(ageOn(rules, necromancer)).toBe(0)
    expect(ageOn(rules, redKnight)).toBe(0)
  })

  it('phase 2: nothing when the Necromancer was not revealed this turn', () => {
    const rules = newRules()
    const necromancer = place(rules, Unit.Necromancer, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, { [Blue]: [knight] })
    runDeployEffects(rules)
    expect(ageOn(rules, knight)).toBe(0)
    expect(ageOn(rules, necromancer)).toBe(0)
  })
})

describe('Veteran', () => {
  printed(Unit.Veteran, 0, 3, 3)

  it('phase 2, when revealed: 1 Age token on Veteran', () => {
    const rules = newRules()
    const veteran = place(rules, Unit.Veteran, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, { [Blue]: [veteran] })
    runDeployEffects(rules)
    expect(ageOn(rules, veteran)).toBe(1)
    expect(ageOn(rules, knight)).toBe(0)
  })

  it('phase 2: a Veteran already in play does not get a token when another Veteran is revealed', () => {
    const rules = newRules()
    const oldVeteran = place(rules, Unit.Veteran, Blue, 0, 0)
    const newVeteran = place(rules, Unit.Veteran, Blue, 1, 0)
    addAge(rules, oldVeteran, Blue, 1)
    deployed(rules, { [Blue]: [newVeteran] })
    runDeployEffects(rules)
    expect(ageOn(rules, newVeteran)).toBe(1)
    expect(ageOn(rules, oldVeteran)).toBe(1)
  })
})

describe('Miner', () => {
  printed(Unit.Miner, 1, 2, 3)

  it('produces 1 crystal', () => {
    const rules = newRules()
    place(rules, Unit.Miner, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(1)
    // The crystal pays a Temple (level 1: 1 crystal, or 2 gold)
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Temple, BuildAction.BuildLevel1)).toBe(0)
  })
})

describe('Woodcutter', () => {
  printed(Unit.Woodcutter, 0, 2, 3)

  it('produces 1 wood', () => {
    const rules = newRules()
    place(rules, Unit.Woodcutter, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(1)
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Barracks, BuildAction.BuildLevel1)).toBe(0)
  })

  it('without it, a building needing wood cannot be built', () => {
    const rules = newRules()
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Barracks, BuildAction.BuildLevel1)).toBeUndefined()
  })
})

describe('Dragon', () => {
  printed(Unit.Dragon, 3, 0, 1)

  it('phase 3: strength 7 instead of 0 if your kingdom produces at least 1 crystal (a unit in the back row)', () => {
    const rules = newRules()
    place(rules, Unit.Dragon, Blue, 0, 0)
    place(rules, Unit.Miner, Blue, 0, 1)
    expect(power(rules, Blue)).toBe(7)
  })

  it('phase 3: strength 7 with the crystal of a building (Mine)', () => {
    const rules = newRules()
    place(rules, Unit.Dragon, Blue, 0, 0)
    build(rules, Blue, Building.Mine)
    expect(power(rules, Blue)).toBe(7)
  })

  it('phase 3: still 7, not more, with 2 crystals', () => {
    const rules = newRules()
    place(rules, Unit.Dragon, Blue, 0, 0)
    place(rules, Unit.Miner, Blue, 0, 1)
    place(rules, Unit.CaveSpirit, Blue, 1, 1)
    expect(power(rules, Blue)).toBe(7)
  })

  it('phase 3: not counted in the back row, even with a crystal', () => {
    const rules = newRules()
    place(rules, Unit.Dragon, Blue, 0, 1)
    place(rules, Unit.Miner, Blue, 1, 1)
    expect(power(rules, Blue)).toBe(0)
  })
})

describe('Knight', () => {
  printed(Unit.Knight, 1, 4, 3)

  it('produces nothing', () => {
    const rules = newRules()
    place(rules, Unit.Knight, Blue, 0, 0)
    expect(new ResourcesHelper(rules.game, Blue).resources).toEqual([])
  })
})

describe('Leviathan', () => {
  printed(Unit.Leviathan, 3, 4, 1)

  it('phase 3: +2 strength for each food in your kingdom', () => {
    const rules = newRules()
    place(rules, Unit.Leviathan, Blue, 0, 0)
    place(rules, Unit.Treefolk, Blue, 0, 1)
    build(rules, Blue, Building.Town) // Town level 1: wood + food
    expect(power(rules, Blue)).toBe(4 + 2 * 2)
  })

  it('phase 3: with an Age token or more on it, Leviathan can not fight', () => {
    const rules = newRules()
    const leviathan = place(rules, Unit.Leviathan, Blue, 0, 0)
    place(rules, Unit.Knight, Blue, 1, 0)
    addAge(rules, leviathan, Blue, 1)
    expect(power(rules, Blue)).toBe(4)
  })

  it('produces 2 food if there is an Age token or more on it', () => {
    const rules = newRules()
    const leviathan = place(rules, Unit.Leviathan, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(0)
    addAge(rules, leviathan, Blue, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(2)
    addAge(rules, leviathan, Blue, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(2)
  })

  it('its 2 food count for the other units (Cook: 2 gold)', () => {
    const rules = newRules()
    const leviathan = place(rules, Unit.Leviathan, Blue, 0, 1)
    place(rules, Unit.Cook, Blue, 0, 0)
    addAge(rules, leviathan, Blue, 1)
    expect(income(rules, Blue)).toBe(2)
  })
})

describe('Shapeshifter', () => {
  it('costs 0 gold', () => expectCost(Unit.Shapeshifter, 0))
  it('has 1 copy', () => expect(copies(Unit.Shapeshifter)).toBe(1))

  it('has no strength', () => {
    const rules = newRules()
    place(rules, Unit.Shapeshifter, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(0)
  })

  /** The deck holds only the given cards, the first one on top */
  const arrangeDeck = (rules: PaperTalesRules, cards: Unit[]) => {
    const deck = rules.material(MaterialType.Unit).location(LocationType.Deck)
    const chosen = cards.map((unit) => deck.id(unit).getIndexes().find((i) => !cardsIndexes.includes(i))!).map((i) => (cardsIndexes.push(i), i))
    for (const index of deck.getIndexes()) if (!chosen.includes(index)) rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.Discard, x: 0 }
    chosen.forEach((index, i) => (rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.Deck, x: cards.length - i }))
    return chosen
  }
  let cardsIndexes: number[] = []

  const revealShapeshifter = (cards: Unit[]) => {
    cardsIndexes = []
    const rules = newRules()
    const shapeshifter = place(rules, Unit.Shapeshifter, Blue, 1, 0)
    const deck = arrangeDeck(rules, cards)
    setGold(rules, Blue, 3)
    deployed(rules, { [Blue]: [shapeshifter] })
    runDeployEffects(rules)
    return { rules, shapeshifter, deck }
  }

  it('phase 2, when revealed: draws a unit of cost 3 or less, deploys it at its place with an Age token, and is discarded', () => {
    const { rules, shapeshifter, deck } = revealShapeshifter([Unit.Knight, Unit.Woodcutter])
    const knight = deck[0]
    expect(location(rules, knight)).toMatchObject({ type: LocationType.PlayerUnitBoard, player: Blue, x: 1, y: 0 })
    expect(ageOn(rules, knight)).toBe(1)
    expect(location(rules, shapeshifter).type).toBe(LocationType.Discard)
    expect(location(rules, deck[1]).type).toBe(LocationType.Deck)
    // Freely deployed
    expect(gold(rules, Blue)).toBe(3)
  })

  it('phase 2: a drawn unit of cost 0 is kept (cost 3 or less)', () => {
    const { rules, shapeshifter, deck } = revealShapeshifter([Unit.Woodcutter, Unit.Knight])
    expect(location(rules, deck[0])).toMatchObject({ type: LocationType.PlayerUnitBoard, player: Blue, x: 1, y: 0 })
    expect(ageOn(rules, deck[0])).toBe(1)
    expect(location(rules, deck[1]).type).toBe(LocationType.Deck)
    expect(location(rules, shapeshifter).type).toBe(LocationType.Discard)
  })

  it('phase 2: a drawn unit of cost exactly 3 is kept', () => {
    const { rules, deck } = revealShapeshifter([Unit.ForestSpirit, Unit.Knight])
    expect(location(rules, deck[0])).toMatchObject({ type: LocationType.PlayerUnitBoard, player: Blue, x: 1, y: 0 })
    expect(location(rules, deck[1]).type).toBe(LocationType.Deck)
  })

  it('phase 2: a drawn unit of cost more than 3 is discarded, and the next one is drawn', () => {
    const { rules, shapeshifter, deck } = revealShapeshifter([Unit.Kraken, Unit.Knight, Unit.Woodcutter])
    const [kraken, knight, woodcutter] = deck
    expect(location(rules, kraken).type).toBe(LocationType.Discard)
    expect(location(rules, knight)).toMatchObject({ type: LocationType.PlayerUnitBoard, player: Blue, x: 1, y: 0 })
    expect(ageOn(rules, knight)).toBe(1)
    expect(ageOn(rules, kraken)).toBe(0)
    expect(location(rules, woodcutter).type).toBe(LocationType.Deck)
    expect(location(rules, shapeshifter).type).toBe(LocationType.Discard)
    expect(rules.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(Blue).length).toBe(1)
  })

  it('phase 2: nothing when it was not revealed this turn', () => {
    cardsIndexes = []
    const rules = newRules()
    const shapeshifter = place(rules, Unit.Shapeshifter, Blue, 1, 0)
    const deck = arrangeDeck(rules, [Unit.Knight])
    deployed(rules, {})
    runDeployEffects(rules)
    expect(location(rules, shapeshifter).type).toBe(LocationType.PlayerUnitBoard)
    expect(location(rules, deck[0]).type).toBe(LocationType.Deck)
  })
})

describe('Cave Spirit', () => {
  printed(Unit.CaveSpirit, 1, 4, 2)

  it('produces 1 crystal', () => {
    const rules = newRules()
    place(rules, Unit.CaveSpirit, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(1)
  })

  it('phase 2, when revealed: 1 Age token on Cave Spirit', () => {
    const rules = newRules()
    const caveSpirit = place(rules, Unit.CaveSpirit, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, { [Blue]: [caveSpirit] })
    runDeployEffects(rules)
    expect(ageOn(rules, caveSpirit)).toBe(1)
    expect(ageOn(rules, knight)).toBe(0)
  })

  it('phase 2: no token when it was not revealed this turn', () => {
    const rules = newRules()
    const caveSpirit = place(rules, Unit.CaveSpirit, Blue, 0, 0)
    deployed(rules, {})
    runDeployEffects(rules)
    expect(ageOn(rules, caveSpirit)).toBe(0)
  })
})

describe('Cook', () => {
  printed(Unit.Cook, 0, 1, 2)

  it('phase 4: 1 gold for each food in your kingdom (2 + 2)', () => {
    const rules = newRules()
    place(rules, Unit.Cook, Blue, 0, 0)
    place(rules, Unit.Treefolk, Blue, 0, 1)
    build(rules, Blue, Building.Town) // wood + food
    setGold(rules, Blue, 0)
    expect(income(rules, Blue)).toBe(2)
    runIncome(rules)
    expect(gold(rules, Blue)).toBe(4)
  })

  it('phase 4: nothing without food', () => {
    const rules = newRules()
    place(rules, Unit.Cook, Blue, 0, 0)
    place(rules, Unit.Woodcutter, Blue, 0, 1)
    setGold(rules, Blue, 0)
    runIncome(rules)
    expect(gold(rules, Blue)).toBe(2)
  })
})

describe('Mystical Healer', () => {
  printed(Unit.MysticalHealer, 0, 1, 3)

  const healerTable = () => {
    const rules = newRules()
    rules.memorize(Memory.Time, 1)
    const healer = place(rules, Unit.MysticalHealer, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    addAge(rules, knight, Blue, 1)
    runBuildPassAndAge(rules)
    return { rules, healer, knight }
  }

  it('phase 6: offers to save a unit with a single Age token', () => {
    const { rules, knight } = healerTable()
    expect(rules.game.rule?.id).toBe(RuleId.SaveUnitsWithMysticEffect)
    const saves = rules.getLegalMoves(Blue).filter(isCustomMoveType(CustomMoveType.MysticEffect))
    expect(saves.map((move) => (move as CustomMove).data.unitIndex)).toEqual([knight])
  })

  it('phase 6: the saved unit does not die, and ages like the others', () => {
    const { rules, knight, healer } = healerTable()
    const save = rules.getLegalMoves(Blue).find((move) => isCustomMoveType(CustomMoveType.MysticEffect)(move) && (move as CustomMove).data.unitIndex === knight)!
    run(rules, save, RuleId.NextTurn)
    expect(location(rules, knight).type).toBe(LocationType.PlayerUnitBoard)
    expect(ageOn(rules, knight)).toBe(2)
    expect(ageOn(rules, healer)).toBe(1)
  })

  it('phase 6: "you may", saving nobody lets the unit die', () => {
    const { rules, knight } = healerTable()
    const nobody = rules.getLegalMoves(Blue).find(isCustomMoveType(CustomMoveType.SaveNobody))!
    expect(nobody).toBeDefined()
    run(rules, nobody, RuleId.NextTurn)
    expect(location(rules, knight).type).toBe(LocationType.Discard)
  })

  it('phase 6: a unit with 2 Age tokens can not be saved', () => {
    const rules = newRules()
    place(rules, Unit.MysticalHealer, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    addAge(rules, knight, Blue, 2)
    runBuildPassAndAge(rules)
    expect(rules.game.rule?.id).toBe(RuleId.NextTurn)
    expect(location(rules, knight).type).toBe(LocationType.Discard)
  })

  it('phase 6: one Healer saves only one unit', () => {
    const rules = newRules()
    place(rules, Unit.MysticalHealer, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    const militiaman = place(rules, Unit.Militiaman, Blue, 0, 1)
    addAge(rules, knight, Blue, 1)
    addAge(rules, militiaman, Blue, 1)
    runBuildPassAndAge(rules)
    const save = rules.getLegalMoves(Blue).find((move) => isCustomMoveType(CustomMoveType.MysticEffect)(move) && (move as CustomMove).data.unitIndex === knight)!
    run(rules, save, RuleId.NextTurn)
    expect(location(rules, knight).type).toBe(LocationType.PlayerUnitBoard)
    expect(location(rules, militiaman).type).toBe(LocationType.Discard)
  })
})

describe('Master Alchemist', () => {
  printed(Unit.MasterAlchemist, 2, 1, 1)

  it('phase 2: Age tokens on one single unit, one for each food in your kingdom', () => {
    const rules = newRules()
    const alchemist = place(rules, Unit.MasterAlchemist, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    place(rules, Unit.Treefolk, Blue, 0, 1)
    build(rules, Blue, Building.Town) // wood + food: 2 food in all
    deployed(rules, { [Blue]: [alchemist] })
    runDeployEffects(rules)
    const choice = placeAgeTokenOn(rules, Blue, knight)
    expect(choice).toBeDefined()
    run(rules, choice!, RuleId.War)
    expect(ageOn(rules, knight)).toBe(2)
    expect(ageOn(rules, alchemist)).toBe(0)
  })

  it('phase 2: no "when revealed" icon, the effect applies again in the next turns', () => {
    const rules = newRules()
    place(rules, Unit.MasterAlchemist, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    place(rules, Unit.Treefolk, Blue, 0, 1)
    deployed(rules, {})
    runDeployEffects(rules)
    expect(rules.game.rule?.id).toBe(RuleId.ChooseWherePlacingAgeToken)
    run(rules, placeAgeTokenOn(rules, Blue, knight)!, RuleId.War)
    expect(ageOn(rules, knight)).toBe(1)
  })

  it('phase 2: no food, no token and nothing to choose', () => {
    const rules = newRules()
    const alchemist = place(rules, Unit.MasterAlchemist, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, { [Blue]: [alchemist] })
    runDeployEffects(rules)
    expect(rules.game.rule?.id).toBe(RuleId.War)
    expect(ageOn(rules, knight)).toBe(0)
  })

  it('phase 3: 1 Legend point for each crystal, for each War won (2 crystals, 2 wars: 6 + 4)', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.MasterAlchemist, Blue, 0, 0)
    place(rules, Unit.CaveSpirit, Blue, 1, 0)
    place(rules, Unit.Miner, Blue, 0, 1)
    runWar(rules)
    expect(score(rules, Blue)).toBe(10)
  })

  it('phase 3: no point for the crystals without a War won', () => {
    const rules = newRules([Blue, Red, Green])
    place(rules, Unit.MasterAlchemist, Blue, 0, 0)
    place(rules, Unit.Miner, Blue, 0, 1)
    place(rules, Unit.Knight, Red, 0, 0)
    place(rules, Unit.Knight, Green, 0, 0)
    runWar(rules)
    expect(score(rules, Blue)).toBe(0)
  })

  it('phase 4: 1 gold for each wood in your kingdom (2 + 4)', () => {
    const rules = newRules()
    place(rules, Unit.MasterAlchemist, Blue, 0, 0)
    place(rules, Unit.Woodcutter, Blue, 1, 0)
    place(rules, Unit.ForestSpirit, Blue, 0, 1)
    setGold(rules, Blue, 0)
    expect(income(rules, Blue)).toBe(4)
    runIncome(rules)
    expect(gold(rules, Blue)).toBe(6)
  })
})

describe('Forest Spirit', () => {
  printed(Unit.ForestSpirit, 3, 3, 1)

  it('produces 3 wood', () => {
    const rules = newRules()
    place(rules, Unit.ForestSpirit, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(3)
    // A Town directly at level 2 needs 3 wood (1 + 2): nothing to pay
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Town, BuildAction.BuildLevel2)).toBe(0)
  })
})

describe('Landlord', () => {
  printed(Unit.LandLord, 2, 1, 1)

  it('produces 1 wood', () => {
    const rules = newRules()
    place(rules, Unit.LandLord, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(1)
  })

  it('phase 5: ignore the land cost (2 buildings already built: 0 instead of 4 gold)', () => {
    const rules = newRules()
    place(rules, Unit.LandLord, Blue, 0, 1)
    build(rules, Blue, Building.Mine)
    build(rules, Blue, Building.Tavern)
    setGold(rules, Blue, 0)
    // Barracks level 1: 1 wood, produced by the Landlord
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Barracks, BuildAction.BuildLevel1)).toBe(0)
  })

  it('phase 5: building with the Landlord costs no gold', () => {
    const rules = newRules()
    place(rules, Unit.LandLord, Blue, 0, 1)
    build(rules, Blue, Building.Mine)
    setGold(rules, Blue, 1)
    run(rules, rules.startSimultaneousRule(RuleId.Build))
    const barracks = rules.material(MaterialType.Building).player(Blue).id(Building.Barracks).getIndex()
    const buildBarracks = rules
      .getLegalMoves(Blue)
      .find((move) => isMoveItemType(MaterialType.Building)(move) && move.itemIndex === barracks && move.location.rotation === false)
    expect(buildBarracks).toBeDefined()
    run(rules, buildBarracks!, RuleId.SaveUnitsWithMysticEffect)
    expect(rules.material(MaterialType.Building).index(barracks).getItem()!.location.type).toBe(LocationType.PlayerBuildingBoard)
    expect(gold(rules, Blue)).toBe(1)
  })

  it('phase 5: without the Landlord, the land costs 2 gold per building already built', () => {
    const rules = newRules()
    place(rules, Unit.Woodcutter, Blue, 0, 1)
    build(rules, Blue, Building.Mine)
    setGold(rules, Blue, 5)
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Barracks, BuildAction.BuildLevel1)).toBe(2)
  })
})
