/**
 * The expansions Beyond the gates and What forges legends: the setup of the options, and the behaviour of every new card.
 * The expected values come only from the printed cards (archive « Portage numérique », docs in the notes of the session)
 * and the rulebook of the complete edition (EN, p.9 to p.11).
 */
import { CustomMove, isCustomMoveType, isEndPlayerTurn, isMoveItemType, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { describe, expect, it } from 'vitest'
import { Artifact, artifacts, isArtifact } from '../material/Artifact'
import { artifactCaracteristics } from '../material/ArtifactCaracteristics'
import { baseGameBuildings, beyondTheGatesBuildings, Building, permanentBuildings, whatForgesLegendsBuildings } from '../material/Building'
import { buildingCardCaracteristics } from '../material/BuildingCaracteristics'
import { Gold } from '../material/Gold'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Resources } from '../material/Resources'
import { beyondTheGatesUnits, deckOf, Unit, units, whatForgesLegendsUnits } from '../material/Unit'
import { unitCardCaracteristics } from '../material/UnitCaracteristics'
import { PaperTalesOptions } from '../PaperTalesOptions'
import { PaperTalesRules } from '../PaperTalesRules'
import { PaperTalesSetup } from '../PaperTalesSetup'
import { PlayerColor } from '../PlayerColor'
import { War } from '../rules/3_War/War'
import { Income } from '../rules/4_Income/Income'
import { CustomMoveType } from '../rules/CustomMoveType'
import { BuildAction, BuildHelper } from '../rules/helpers/BuildHelper'
import { EndScoreHelper } from '../rules/helpers/EndScoreHelper'
import { ResourcesHelper } from '../rules/helpers/ResourcesHelper'
import { Memory } from '../rules/Memory'
import { RuleId } from '../rules/RuleId'

const { Blue, Red, Green } = PlayerColor

const allExpansions = { beyondTheGatesUnits: true, beyondTheGatesBuildings: true, whatForgesLegends: true }

const setupGame = (options: Omit<PaperTalesOptions, 'players'>, players: PlayerColor[] = [Blue, Red, Green]) =>
  new PaperTalesSetup().setup({ players: players.map((id) => ({ id })), ...options }) as MaterialGame

/** A game with every expansion, whose first deal is put back in the deck, and no building built */
const newRules = (players: PlayerColor[] = [Blue, Red, Green]) => {
  const game = setupGame(allExpansions, players)
  for (const item of game.items[MaterialType.Unit]!) if (item.location.type !== LocationType.Deck) item.location = { type: LocationType.Deck }
  return new PaperTalesRules(game)
}

/** Plays a move and all its consequences; stops (dropping what is left) as soon as the rule `until` is reached */
const run = (rules: PaperTalesRules, move: MaterialMove, until?: RuleId) => {
  const queue: MaterialMove[] = rules.play(rules.randomize(move))
  while (queue.length > 0) {
    if (until !== undefined && rules.game.rule?.id === until) return
    queue.unshift(...rules.play(rules.randomize(queue.shift()!)))
  }
}

/** Takes a copy of the card from the deck and puts it on the board of the player, face up (an artifact among the artifacts) */
const place = (rules: PaperTalesRules, card: Unit | Artifact, player: PlayerColor, x = 0, y = 0) => {
  const index = rules.material(MaterialType.Unit).location(LocationType.Deck).id(card).getIndexes()[0]
  if (index === undefined) throw new Error(`No ${card} left in the deck`)
  const artifactsInPlay = rules.material(MaterialType.Unit).location(LocationType.PlayerArtifacts).player(player).length
  rules.game.items[MaterialType.Unit]![index].location = isArtifact(card)
    ? { type: LocationType.PlayerArtifacts, player, x: artifactsInPlay }
    : { type: LocationType.PlayerUnitBoard, player, x, y }
  return index
}

/** The deck holds only the given cards, the first one on top: the others go to the discard */
const arrangeDeck = (rules: PaperTalesRules, cards: (Unit | Artifact)[]) => {
  const deck = rules.material(MaterialType.Unit).location(LocationType.Deck)
  const chosen = cards.map((card) => deck.id(card).getIndexes()[0])
  for (const index of deck.getIndexes()) if (!chosen.includes(index)) rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.Discard, x: 0 }
  chosen.forEach((index, i) => (rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.Deck, x: cards.length - i }))
  return chosen
}

const addAge = (rules: PaperTalesRules, unitIndex: number, quantity = 1) => {
  const player = rules.game.items[MaterialType.Unit]![unitIndex].location.player
  rules.play(rules.material(MaterialType.Age).createItem({ location: { type: LocationType.OnCard, parent: unitIndex, player }, quantity }))
}

const ageOn = (rules: PaperTalesRules, unitIndex: number) => rules.material(MaterialType.Age).location(LocationType.OnCard).parent(unitIndex).getQuantity()

/** Gives the building to the player if they do not have it (the buildings of the expansions are drawn at random), and builds it */
const build = (rules: PaperTalesRules, player: PlayerColor, building: Building, level2 = false) => {
  if (!rules.material(MaterialType.Building).player(player).id(building).length) {
    rules.play(rules.material(MaterialType.Building).createItem({ id: building, location: { type: LocationType.PlayerBuildingHand, player } }))
  }
  const index = rules.material(MaterialType.Building).player(player).id(building).getIndex()
  rules.game.items[MaterialType.Building]![index].location = { type: LocationType.PlayerBuildingBoard, player, rotation: level2 }
  return index
}

/** Only the given building in the hand of the player, not built yet */
const onlyInHand = (rules: PaperTalesRules, player: PlayerColor, building: Building) => {
  rules.game.items[MaterialType.Building] = rules.game.items[MaterialType.Building]!.filter((item) => item.location.player !== player)
  rules.play(rules.material(MaterialType.Building).createItem({ id: building, location: { type: LocationType.PlayerBuildingHand, player } }))
}

const setGold = (rules: PaperTalesRules, player: PlayerColor, quantity: number) => {
  rules.game.items[MaterialType.Gold] = rules.game.items[MaterialType.Gold]!.filter((item) => item.location.player !== player)
  if (quantity > 0) rules.play(rules.material(MaterialType.Gold).createItem({ id: Gold.Gold1, location: { type: LocationType.PlayerGoldStock, player }, quantity }))
}

const gold = (rules: PaperTalesRules, player: PlayerColor) => new BuildHelper(rules.game, player).gold
const power = (rules: PaperTalesRules, player: PlayerColor) => new War(rules.game).getPlayerPower(player)
const resource = (rules: PaperTalesRules, player: PlayerColor, r: Resources) => new ResourcesHelper(rules.game, player).getResource(r)
const income = (rules: PaperTalesRules, player: PlayerColor) => new Income(rules.game).getPlayerIncome(player)
const location = (rules: PaperTalesRules, index: number) => rules.material(MaterialType.Unit).getItem(index).location
const level2 = (rules: PaperTalesRules, player: PlayerColor) =>
  rules.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(player).rotation(true).length

const deployed = (rules: PaperTalesRules, revealed: Partial<Record<PlayerColor, number[]>>) => {
  for (const player of rules.players) rules.memorize(Memory.PlayedCardsDuringDeployment, revealed[player] ?? [], player)
}

const runDeployEffects = (rules: PaperTalesRules) => run(rules, rules.startSimultaneousRule(RuleId.DeployEffects), RuleId.War)
const runWar = (rules: PaperTalesRules) => run(rules, rules.startRule(RuleId.War), RuleId.Income)
const runAge = (rules: PaperTalesRules) => run(rules, rules.startRule(RuleId.AgeEffects), RuleId.NextTurn)

const customMoves = (rules: PaperTalesRules, player: PlayerColor, type: CustomMoveType) =>
  rules.getLegalMoves(player).filter(isCustomMoveType(type)) as CustomMove[]
const chooseUnit = (rules: PaperTalesRules, player: PlayerColor, type: CustomMoveType, unitIndex: number) =>
  customMoves(rules, player, type).find((move) => move.data.unitIndex === unitIndex)

describe('Setup with the expansions as options', () => {
  const deckSize = (game: MaterialGame) => game.items[MaterialType.Unit]!.length
  const buildingsOf = (game: MaterialGame, player: PlayerColor) =>
    new PaperTalesRules(game).material(MaterialType.Building).player(player).getItems<Building>().map((building) => building.id)

  it('base game: the 81 units, the 5 buildings', () => {
    const game = setupGame({})
    expect(deckSize(game)).toBe(81)
    for (const player of [Blue, Red, Green]) expect(buildingsOf(game, player).sort()).toEqual([...baseGameBuildings].sort())
  })

  it('Beyond the gates units: the 20 new units in the deck (rulebook p.9)', () => {
    expect(deckOf(beyondTheGatesUnits)).toHaveLength(20)
    expect(deckSize(setupGame({ beyondTheGatesUnits: true }))).toBe(101)
  })

  it('What forges legends: 26 units and 18 Legendary Artifacts in the deck (rulebook p.10)', () => {
    expect(deckOf(whatForgesLegendsUnits)).toHaveLength(26)
    const game = setupGame({ whatForgesLegends: true })
    expect(deckSize(game)).toBe(81 + 26 + 18)
    const rules = new PaperTalesRules(game)
    for (const artifact of artifacts) expect(rules.material(MaterialType.Unit).id(artifact).length).toBe(2)
  })

  it('Beyond the gates buildings: the 4 permanent ones and 3 drawn among the Barracks and the 6 new ones, the same for all (p.9)', () => {
    for (let i = 0; i < 20; i++) {
      const game = setupGame({ beyondTheGatesBuildings: true })
      const blue = buildingsOf(game, Blue)
      expect(blue).toHaveLength(7)
      for (const building of permanentBuildings) expect(blue).toContain(building)
      const drawn = blue.filter((building) => !permanentBuildings.includes(building))
      for (const building of drawn) expect([Building.Barracks, ...beyondTheGatesBuildings]).toContain(building)
      expect(buildingsOf(game, Red)).toEqual(blue)
      expect(buildingsOf(game, Green)).toEqual(blue)
    }
  })

  it('both expansions: the 3 buildings are drawn among 10 (p.10)', () => {
    const drawn = new Set<Building>()
    for (let i = 0; i < 60; i++) for (const building of buildingsOf(setupGame(allExpansions), Blue)) drawn.add(building)
    for (const building of [Building.Barracks, ...beyondTheGatesBuildings, ...whatForgesLegendsBuildings]) expect(drawn).toContain(building)
  })

  it('What forges legends without the buildings of Beyond the gates: the 5 base buildings and 2 drawn among its 3 (p.10)', () => {
    for (let i = 0; i < 10; i++) {
      const blue = buildingsOf(setupGame({ whatForgesLegends: true }), Blue)
      expect(blue).toHaveLength(7)
      for (const building of baseGameBuildings) expect(blue).toContain(building)
      expect(blue.filter((building) => whatForgesLegendsBuildings.includes(building))).toHaveLength(2)
    }
  })

  it('every card has its descriptor', () => {
    for (const unit of units) expect(unitCardCaracteristics[unit]).toBeDefined()
    for (const artifact of artifacts) expect(artifactCaracteristics[artifact].points).toBeGreaterThan(0)
    for (const building of [...beyondTheGatesBuildings, ...whatForgesLegendsBuildings]) {
      expect(buildingCardCaracteristics[building]).toMatchObject({ points1: 1, points2: 3 })
    }
  })
})

describe('Beyond the gates: units', () => {
  it('Wizard Apprentice, when revealed: moves an Age token from one of your units to another one', () => {
    const rules = newRules()
    const apprentice = place(rules, Unit.WizardApprentice, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    const farmer = place(rules, Unit.Farmer, Blue, 0, 1)
    addAge(rules, knight, 2)
    deployed(rules, { [Blue]: [apprentice] })
    runDeployEffects(rules)
    expect(rules.game.rule?.id).toBe(RuleId.DeployEffects)
    const moves = rules.getLegalMoves(Blue).filter(isMoveItemType(MaterialType.Age))
    // From the Knight, the only unit with a token, to each other unit
    expect(moves).toHaveLength(2)
    run(rules, moves.find((move) => move.location.parent === farmer)!, RuleId.War)
    expect(ageOn(rules, knight)).toBe(1)
    expect(ageOn(rules, farmer)).toBe(1)
    expect(rules.game.rule?.id).toBe(RuleId.War)
  })

  it('Wizard Apprentice: nothing to do without any Age token in the kingdom', () => {
    const rules = newRules()
    const apprentice = place(rules, Unit.WizardApprentice, Blue, 0, 0)
    place(rules, Unit.Knight, Blue, 1, 0)
    deployed(rules, { [Blue]: [apprentice] })
    runDeployEffects(rules)
    expect(rules.game.rule?.id).toBe(RuleId.War)
  })

  it('Shadow, when revealed: the "when revealed" effects of another unit apply again, an older one included', () => {
    const rules = newRules()
    const shadow = place(rules, Unit.Shadow, Blue, 0, 0)
    const veteran = place(rules, Unit.Veteran, Blue, 1, 0)
    place(rules, Unit.Knight, Blue, 0, 1)
    deployed(rules, { [Blue]: [shadow] })
    runDeployEffects(rules)
    // Only the Veteran has "when revealed" effects; not the Shadow itself
    const choices = customMoves(rules, Blue, CustomMoveType.ReactivateUnit)
    expect(choices.map((move) => move.data.unitIndex)).toEqual([veteran])
    run(rules, choices[0], RuleId.War)
    expect(ageOn(rules, veteran)).toBe(1)
  })

  it('Shadow: a unit revealed this turn applies its effects twice (rulebook p.12)', () => {
    const rules = newRules()
    const shadow = place(rules, Unit.Shadow, Blue, 0, 0)
    const veteran = place(rules, Unit.Veteran, Blue, 1, 0)
    deployed(rules, { [Blue]: [shadow, veteran] })
    runDeployEffects(rules)
    run(rules, chooseUnit(rules, Blue, CustomMoveType.ReactivateUnit, veteran)!, RuleId.War)
    expect(ageOn(rules, veteran)).toBe(2)
  })

  it('Imp: cost -2 (the gold is earned), when revealed an Age token on it, -2 Legend points if it dies with a single one', () => {
    const rules = newRules()
    const imp = place(rules, Unit.Imp, Blue, 0, 0)
    setGold(rules, Blue, 1)
    deployed(rules, { [Blue]: [imp] })
    run(rules, rules.startRule(RuleId.PayDeployedUnits), RuleId.War)
    expect(gold(rules, Blue)).toBe(3)
    expect(ageOn(rules, imp)).toBe(1)
    run(rules, rules.startRule(RuleId.War), RuleId.Income)
    const before = rules.getScore(Blue)
    runAge(rules)
    expect(rules.getScore(Blue)).toBe(Math.max(0, before - 2))
  })

  it('Dryad: wood can be paid instead of food or crystal for a construction', () => {
    const rules = newRules()
    place(rules, Unit.Dryad, Blue, 0, 0)
    place(rules, Unit.Woodcutter, Blue, 1, 0)
    setGold(rules, Blue, 3)
    // The Temple costs a crystal (or 2 gold): with 2 wood and no crystal, a wood pays it
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Temple, BuildAction.BuildLevel1)).toBe(0)
    // Directly at level 2, 3 crystals: only 2 wood, so the level 1 is paid with its 2 gold and the level 2 with the wood
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Temple, BuildAction.BuildLevel2)).toBe(2)
  })

  it('Smuggler, when revealed: 1 gold for each type of resource in the kingdom', () => {
    const rules = newRules()
    const smuggler = place(rules, Unit.Smuggler, Blue, 0, 0)
    place(rules, Unit.ForestChild, Blue, 1, 0) // wood and food
    place(rules, Unit.Woodcutter, Blue, 0, 1)
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [smuggler] })
    runDeployEffects(rules)
    expect(gold(rules, Blue)).toBe(2)
  })

  it('Djinn, when revealed: improves a level 1 building of your choice, an Age token on a unit of your choice, 1 gold', () => {
    const rules = newRules()
    const djinn = place(rules, Unit.Djinn, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    const mine = build(rules, Blue, Building.Mine)
    build(rules, Blue, Building.Tavern)
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [djinn] })
    runDeployEffects(rules)
    const improve = rules.getLegalMoves(Blue).filter(isMoveItemType(MaterialType.Building))
    expect(improve).toHaveLength(2)
    run(rules, improve.find((move) => move.itemIndex === mine)!, RuleId.War)
    expect(level2(rules, Blue)).toBe(1)
    run(rules, chooseUnit(rules, Blue, CustomMoveType.GainAgeTokenOnChosenUnitEffect, knight)!, RuleId.War)
    expect(ageOn(rules, knight)).toBe(1)
    expect(gold(rules, Blue)).toBe(1)
    expect(rules.game.rule?.id).toBe(RuleId.War)
  })

  it('Princess: the Legend points of the buildings at the War phase are doubled', () => {
    const rules = newRules()
    place(rules, Unit.Princess, Blue, 0, 1)
    build(rules, Blue, Building.Temple, true) // 2 Legend points at the War phase
    runWar(rules)
    // 2 doubled; the wars: Blue (strength 0) ties the others (0)
    expect(rules.getScore(Blue)).toBe(4 + 6)
  })

  it('High Steward, when revealed: 1 gold for each unit of strength 3 or more', () => {
    const rules = newRules()
    const steward = place(rules, Unit.HighSteward, Blue, 0, 0)
    place(rules, Unit.Knight, Blue, 1, 0)
    place(rules, Unit.Farmer, Blue, 0, 1)
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [steward] })
    runDeployEffects(rules)
    expect(gold(rules, Blue)).toBe(2)
    expect(resource(rules, Blue, Resources.Food)).toBe(2)
  })

  it('Noble, when revealed: 2 Legend points for each unit of cost 2 or more', () => {
    const rules = newRules()
    const noble = place(rules, Unit.Noble, Blue, 0, 0)
    place(rules, Unit.Commander, Blue, 1, 0) // cost 2
    place(rules, Unit.Farmer, Blue, 0, 1) // cost 0
    deployed(rules, { [Blue]: [noble] })
    runDeployEffects(rules)
    expect(rules.getScore(Blue)).toBe(4)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(1)
  })

  it('Lost Soul: 7 Legend points when it dies', () => {
    const rules = newRules()
    addAge(rules, place(rules, Unit.LostSoul, Blue, 0, 0))
    runAge(rules)
    expect(rules.getScore(Blue)).toBe(7)
  })

  it('Relic of War: +1 strength for each Age token on it, never dies, 1 Legend point for each at the end', () => {
    const rules = newRules()
    const relic = place(rules, Unit.RelicOfWar, Blue, 0, 0)
    addAge(rules, relic, 3)
    expect(power(rules, Blue)).toBe(3)
    runAge(rules)
    expect(location(rules, relic).type).toBe(LocationType.PlayerUnitBoard)
    expect(ageOn(rules, relic)).toBe(4)
    expect(new EndScoreHelper(rules.game, Blue).relicsPoints).toBe(4)
  })

  it('Relic of Light: never dies, 1 Legend point for each other unit of yours that survives', () => {
    const rules = newRules()
    const relic = place(rules, Unit.RelicOfLight, Blue, 0, 0)
    addAge(rules, relic)
    place(rules, Unit.Knight, Blue, 1, 0) // survives
    place(rules, Unit.Farmer, Blue, 0, 1) // survives
    addAge(rules, place(rules, Unit.Woodcutter, Blue, 1, 1)) // dies
    runAge(rules)
    expect(rules.getScore(Blue)).toBe(2)
    expect(location(rules, relic).type).toBe(LocationType.PlayerUnitBoard)
  })

  it('Jeweler: 1 gold at the Income phase and 1 crystal for each Age token on it', () => {
    const rules = newRules()
    const jeweler = place(rules, Unit.Jeweler, Blue, 0, 0)
    expect(income(rules, Blue)).toBe(0)
    addAge(rules, jeweler, 2)
    expect(income(rules, Blue)).toBe(2)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(2)
  })
})

describe('Beyond the gates: buildings', () => {
  it('Abbey: costs food and 3 gold, produces 2 food; level 2: 1 Legend point for each resource at the War phase', () => {
    const rules = newRules()
    onlyInHand(rules, Blue, Building.Abbey)
    place(rules, Unit.Farmer, Blue, 0, 0)
    setGold(rules, Blue, 3)
    expect(new BuildHelper(rules.game, Blue).getGoldToPay(Building.Abbey, BuildAction.BuildLevel1)).toBe(3)
    build(rules, Blue, Building.Abbey, true)
    place(rules, Unit.Woodcutter, Blue, 1, 1)
    expect(resource(rules, Blue, Resources.Food)).toBe(3)
    runWar(rules)
    // 4 resources (3 food, 1 wood), and the wars tied at strength 0
    expect(rules.getScore(Blue)).toBe(4 + 6)
  })

  it('Library: 1 gold for each of your units that dies; level 2: 1 Legend point for each Age token at the War phase', () => {
    const rules = newRules()
    build(rules, Blue, Building.Library, true)
    addAge(rules, place(rules, Unit.Knight, Blue, 0, 0), 2)
    addAge(rules, place(rules, Unit.Farmer, Blue, 1, 0))
    runWar(rules)
    expect(rules.getScore(Blue)).toBe(3 + 6)
    setGold(rules, Blue, 0)
    runAge(rules)
    expect(gold(rules, Blue)).toBe(2)
  })

  it('Crypt: an Age token on each of your units at every Deployment phase; level 2: 2 gold, 2 food', () => {
    const rules = newRules()
    build(rules, Blue, Building.Crypt)
    const knight = place(rules, Unit.Knight, Blue, 0, 0)
    const farmer = place(rules, Unit.Farmer, Blue, 1, 0)
    deployed(rules, { [Blue]: [farmer] })
    runDeployEffects(rules)
    expect(ageOn(rules, knight)).toBe(1)
    expect(ageOn(rules, farmer)).toBe(1)
    build(rules, Blue, Building.Crypt, true)
    expect(income(rules, Blue)).toBe(2)
    expect(resource(rules, Blue, Resources.Food)).toBe(3)
  })

  it('Black Market: produces a crystal; level 2: 1 Legend point for each gold earned at the Income phase', () => {
    const rules = newRules()
    build(rules, Blue, Building.BlackMarket, true)
    place(rules, Unit.Blacksmith, Blue, 0, 1) // +1 gold
    expect(resource(rules, Blue, Resources.Diamond)).toBe(1)
    runWar(rules)
    // The 2 gold of every Monarch and the Blacksmith
    expect(rules.getScore(Blue)).toBe(3 + 6)
  })

  it('Back Room: the level 2 cost is ignored to build at level 2 or to upgrade; level 2: +2 strength', () => {
    const rules = newRules()
    build(rules, Blue, Building.BackRoom)
    build(rules, Blue, Building.Mine)
    setGold(rules, Blue, 10)
    const helper = new BuildHelper(rules.game, Blue)
    // The Mine level 2 costs wood + crystal: ignored
    expect(helper.getGoldToPay(Building.Mine, BuildAction.Upgrade)).toBe(0)
    // The Temple at level 2: its level 1 cost only (the crystal of the Mine), and the land (2 buildings: 4)
    expect(helper.getGoldToPay(Building.Temple, BuildAction.BuildLevel2)).toBe(4)
    build(rules, Blue, Building.BackRoom, true)
    expect(power(rules, Blue)).toBe(2)
  })

  it('Port: -2 strength at the War phase and 2 gold; level 2: 2 Legend points for each type of resource', () => {
    const rules = newRules()
    build(rules, Blue, Building.Port)
    place(rules, Unit.Knight, Blue, 0, 0)
    expect(power(rules, Blue)).toBe(2)
    expect(income(rules, Blue)).toBe(2)
    build(rules, Blue, Building.Port, true)
    place(rules, Unit.ForestChild, Blue, 0, 1)
    runWar(rules)
    // 2 types (wood, food); Blue (2) ties nobody and beats the others (0)
    expect(rules.getScore(Blue)).toBe(4 + 6)
  })
})

describe('What forges legends: units', () => {
  it('Servile Minion: cost -1, an Age token on it when revealed', () => {
    const rules = newRules()
    const minion = place(rules, Unit.ServileMinion, Blue, 0, 0)
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [minion] })
    run(rules, rules.startRule(RuleId.PayDeployedUnits), RuleId.War)
    expect(gold(rules, Blue)).toBe(1)
    expect(ageOn(rules, minion)).toBe(1)
  })

  it('Cave Lizard: a crystal for each Age token on it, and a food', () => {
    const rules = newRules()
    const lizard = place(rules, Unit.CaveLizard, Blue, 0, 0)
    addAge(rules, lizard, 2)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(2)
    expect(resource(rules, Blue, Resources.Food)).toBe(1)
  })

  it('Pioneer: an Age token on it when revealed, wood and crystal', () => {
    const rules = newRules()
    const pioneer = place(rules, Unit.Pioneer, Blue, 0, 0)
    deployed(rules, { [Blue]: [pioneer] })
    runDeployEffects(rules)
    expect(ageOn(rules, pioneer)).toBe(1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(1)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(1)
  })

  it('Weapon Master, when revealed: an Age token on each other unit deployed this turn', () => {
    const rules = newRules()
    const master = place(rules, Unit.WeaponMaster, Blue, 0, 0)
    const knight = place(rules, Unit.Knight, Blue, 1, 0)
    const farmer = place(rules, Unit.Farmer, Blue, 0, 1)
    deployed(rules, { [Blue]: [master, knight] })
    runDeployEffects(rules)
    expect(ageOn(rules, knight)).toBe(1)
    expect(ageOn(rules, farmer)).toBe(0)
    expect(ageOn(rules, master)).toBe(0)
  })

  it('Gold Digger: 2 gold at the Income phase, a crystal in the Front only', () => {
    const rules = newRules()
    place(rules, Unit.GoldDigger, Blue, 0, 1)
    expect(income(rules, Blue)).toBe(2)
    expect(resource(rules, Blue, Resources.Diamond)).toBe(0)
    place(rules, Unit.GoldDigger, Red, 0, 0)
    expect(resource(rules, Red, Resources.Diamond)).toBe(1)
  })

  it('Wolf Pack: an Age token on it when revealed, +2 strength for each food, a food', () => {
    const rules = newRules()
    const pack = place(rules, Unit.WolfPack, Blue, 0, 0)
    place(rules, Unit.Farmer, Blue, 0, 1)
    expect(power(rules, Blue)).toBe(2 + 2 * 2)
    deployed(rules, { [Blue]: [pack] })
    runDeployEffects(rules)
    expect(ageOn(rules, pack)).toBe(1)
  })

  it('Trapper: 1 gold for each food at the Income phase, a wood', () => {
    const rules = newRules()
    place(rules, Unit.Trapper, Blue, 0, 0)
    place(rules, Unit.Farmer, Blue, 0, 1)
    place(rules, Unit.Treefolk, Blue, 1, 1)
    expect(income(rules, Blue)).toBe(2)
    expect(resource(rules, Blue, Resources.Wood)).toBe(1)
  })

  it('Banner Bearer, when revealed: 2 gold with a unit of cost 2 or more, 2 Legend points with a unit of cost 3 or more', () => {
    const rules = newRules()
    const bearer = place(rules, Unit.BannerBearer, Blue, 0, 0)
    place(rules, Unit.Commander, Blue, 1, 0) // cost 2
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [bearer] })
    runDeployEffects(rules)
    expect(gold(rules, Blue)).toBe(2)
    expect(rules.getScore(Blue)).toBe(0)

    const other = newRules()
    const second = place(other, Unit.BannerBearer, Blue, 0, 0)
    place(other, Unit.Dragon, Blue, 1, 0) // cost 3: both conditions
    setGold(other, Blue, 0)
    deployed(other, { [Blue]: [second] })
    runDeployEffects(other)
    expect(gold(other, Blue)).toBe(2)
    expect(other.getScore(Blue)).toBe(2)
  })

  it('Relic of Harvest: in the Front, 1 Legend point for each wood and each food at the War phase; never dies', () => {
    const rules = newRules()
    const relic = place(rules, Unit.RelicOfHarvest, Blue, 0, 0)
    place(rules, Unit.ForestChild, Blue, 0, 1)
    place(rules, Unit.Miner, Blue, 1, 1) // a crystal does not count
    runWar(rules)
    // Wood and food: 2; strength 1 against 0: 2 wars won
    expect(rules.getScore(Blue)).toBe(2 + 6)
    addAge(rules, relic)
    runAge(rules)
    expect(location(rules, relic).type).toBe(LocationType.PlayerUnitBoard)

    const back = newRules()
    place(back, Unit.RelicOfHarvest, Blue, 0, 1)
    place(back, Unit.ForestChild, Blue, 1, 1)
    runWar(back)
    expect(back.getScore(Blue)).toBe(6)
  })

  it('Relic of Fate: 1 Legend point for each Age token on your units that die; never dies; 1 point for each token on it at the end', () => {
    const rules = newRules()
    const relic = place(rules, Unit.RelicOfFate, Blue, 0, 0)
    addAge(rules, relic, 2)
    addAge(rules, place(rules, Unit.Knight, Blue, 1, 0), 2)
    runAge(rules)
    expect(rules.getScore(Blue)).toBe(2)
    expect(location(rules, relic).type).toBe(LocationType.PlayerUnitBoard)
    expect(new EndScoreHelper(rules.game, Blue).relicsPoints).toBe(3)
  })

  it('War Musician: +1 strength for each Legendary Artifact; 1 Legend point for each when it dies', () => {
    const rules = newRules()
    const musician = place(rules, Unit.WarMusician, Blue, 0, 0)
    place(rules, Artifact.LuxuriantGrove, Blue)
    place(rules, Artifact.HornOfPlenty, Blue)
    expect(power(rules, Blue)).toBe(3)
    addAge(rules, musician)
    runAge(rules)
    expect(rules.getScore(Blue)).toBe(2)
  })

  it('Scribe, when revealed: 1 gold and 1 Legend point for each Legendary Artifact', () => {
    const rules = newRules()
    const scribe = place(rules, Unit.Scribe, Blue, 0, 0)
    place(rules, Artifact.LuxuriantGrove, Blue)
    place(rules, Artifact.WarChest, Blue)
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [scribe] })
    runDeployEffects(rules)
    expect(gold(rules, Blue)).toBe(2)
    expect(rules.getScore(Blue)).toBe(2)
  })

  it('Court Jester, when revealed: draws and discards until a Legendary Artifact, put into play for free; 1 gold for each at the Income', () => {
    const rules = newRules()
    const jester = place(rules, Unit.CourtJester, Blue, 0, 0)
    const [knight, grove] = arrangeDeck(rules, [Unit.Knight, Artifact.LuxuriantGrove])
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [jester] })
    runDeployEffects(rules)
    expect(location(rules, knight).type).toBe(LocationType.Discard)
    expect(location(rules, grove)).toMatchObject({ type: LocationType.PlayerArtifacts, player: Blue })
    expect(gold(rules, Blue)).toBe(0)
    expect(income(rules, Blue)).toBe(1)
  })

  it('Titan, when revealed: builds for free at level 2 a building drawn at random among the ones not built', () => {
    const rules = newRules()
    const titan = place(rules, Unit.Titan, Blue, 0, 0)
    for (const building of rules.material(MaterialType.Building).player(Blue).getItems<Building>().slice(1)) build(rules, Blue, building.id)
    const last = rules.material(MaterialType.Building).location(LocationType.PlayerBuildingHand).player(Blue).getIndex()
    setGold(rules, Blue, 0)
    deployed(rules, { [Blue]: [titan] })
    runDeployEffects(rules)
    expect(rules.material(MaterialType.Building).getItem(last).location).toMatchObject({ type: LocationType.PlayerBuildingBoard, player: Blue, rotation: true })
    expect(gold(rules, Blue)).toBe(0)
  })
})

describe('What forges legends: Legendary Artifacts', () => {
  /** A deployment phase with the given cards in the hand of Blue */
  const deployment = (cards: (Unit | Artifact)[], goldAmount: number, artifactsInPlay: Artifact[] = []) => {
    const rules = newRules()
    for (const artifact of artifactsInPlay) place(rules, artifact, Blue)
    for (const card of cards) {
      const index = rules.material(MaterialType.Unit).location(LocationType.Deck).id(card).getIndexes()[0]
      rules.game.items[MaterialType.Unit]![index].location = { type: LocationType.PlayerUnitHand, player: Blue }
    }
    setGold(rules, Blue, goldAmount)
    run(rules, rules.startSimultaneousRule(RuleId.PlaceUnitOnBoard))
    return rules
  }
  const layArtifact = (rules: PaperTalesRules, artifact: Artifact) =>
    rules
      .getLegalMoves(Blue)
      .filter(isMoveItemType(MaterialType.Unit))
      .find((move) => move.location.type === LocationType.PlayerArtifacts && rules.material(MaterialType.Unit).getItem(move.itemIndex).id === artifact)

  it('deployed apart from the units, face down, the 1st costs 1 gold, the 2nd 2 gold, the 3rd 3 gold (rulebook p.11)', () => {
    const rules = deployment([Artifact.LuxuriantGrove, Artifact.HornOfPlenty, Artifact.WarChest], 3, [Artifact.BottomlessPurse])
    // A Legendary Artifact never goes on a spot of the units
    expect(
      rules
        .getLegalMoves(Blue)
        .filter(isMoveItemType(MaterialType.Unit))
        .some((move) => move.location.type === LocationType.PlayerUnitBoard)
    ).toBe(false)
    const first = layArtifact(rules, Artifact.LuxuriantGrove)!
    expect(first.location).toMatchObject({ type: LocationType.PlayerArtifacts, player: Blue, rotation: true })
    run(rules, first)
    // The 2nd of the game costs 2, the next one 3: 1 gold left
    expect(layArtifact(rules, Artifact.HornOfPlenty)).toBeUndefined()
  })

  it('revealed, then paid: 1 + 2 for the 2 first artifacts', () => {
    const rules = deployment([Artifact.LuxuriantGrove, Artifact.HornOfPlenty, Unit.Knight], 4)
    run(rules, layArtifact(rules, Artifact.LuxuriantGrove)!)
    run(rules, layArtifact(rules, Artifact.HornOfPlenty)!)
    // The last card is kept: the deployment ends
    for (const player of [Blue, Red, Green]) run(rules, rules.getLegalMoves(player).find(isEndPlayerTurn)!, RuleId.War)
    expect(gold(rules, Blue)).toBe(1)
    const inPlay = rules.material(MaterialType.Unit).location(LocationType.PlayerArtifacts).player(Blue)
    expect(inPlay.length).toBe(2)
    expect(inPlay.rotation(true).length).toBe(0)
  })

  it('never age: no Age token on an artifact, and they stay in play', () => {
    const rules = newRules()
    const grove = place(rules, Artifact.LuxuriantGrove, Blue)
    run(rules, rules.startRule(RuleId.AgeEffects), RuleId.NextTurn)
    expect(ageOn(rules, grove)).toBe(0)
    expect(location(rules, grove).type).toBe(LocationType.PlayerArtifacts)
  })

  it('Luxuriant Grove, Horn of Plenty, Elemental Scepter: a resource each', () => {
    const rules = newRules()
    place(rules, Artifact.LuxuriantGrove, Blue)
    place(rules, Artifact.HornOfPlenty, Blue)
    place(rules, Artifact.ElementalScepter, Blue)
    expect([Resources.Wood, Resources.Food, Resources.Diamond].map((r) => resource(rules, Blue, r))).toEqual([1, 1, 1])
  })

  it('Cursed Crown: at every Deployment phase, an Age token on a unit deployed this turn', () => {
    const rules = newRules()
    place(rules, Artifact.CursedCrown, Blue)
    const knight = place(rules, Unit.Knight, Blue, 0, 0)
    const farmer = place(rules, Unit.Farmer, Blue, 1, 0)
    deployed(rules, { [Blue]: [farmer] })
    runDeployEffects(rules)
    const choices = customMoves(rules, Blue, CustomMoveType.GainAgeTokenOnChosenUnitEffect)
    expect(choices.map((move) => move.data.unitIndex)).toEqual([farmer])
    run(rules, choices[0], RuleId.War)
    expect(ageOn(rules, farmer)).toBe(1)
    expect(ageOn(rules, knight)).toBe(0)
  })

  it('Shield of Power: +2 strength', () => {
    const rules = newRules()
    place(rules, Artifact.ShieldOfPower, Blue)
    expect(power(rules, Blue)).toBe(2)
  })

  it('Sword of Glory and War Chest: 1 Legend point and 1 gold for each war won', () => {
    const rules = newRules()
    place(rules, Artifact.SwordOfGlory, Blue)
    place(rules, Artifact.WarChest, Blue)
    place(rules, Unit.Knight, Blue, 0, 0)
    setGold(rules, Blue, 0)
    runWar(rules)
    expect(rules.getScore(Blue)).toBe(2 * (3 + 1))
    expect(gold(rules, Blue)).toBe(2)
  })

  it('Bottomless Purse: 1 gold at the Income phase', () => {
    const rules = newRules()
    place(rules, Artifact.BottomlessPurse, Blue)
    expect(income(rules, Blue)).toBe(1)
  })

  it('Medallion of Life: may save a unit with a single Age token', () => {
    const rules = newRules()
    place(rules, Artifact.MedallionOfLife, Blue)
    const knight = place(rules, Unit.Knight, Blue, 0, 0)
    addAge(rules, knight)
    run(rules, rules.startSimultaneousRule(RuleId.Build))
    for (const player of rules.players) run(rules, rules.getLegalMoves(player).find(isEndPlayerTurn)!, RuleId.SaveUnitsWithMysticEffect)
    expect(rules.game.rule?.id).toBe(RuleId.SaveUnitsWithMysticEffect)
    run(rules, chooseUnit(rules, Blue, CustomMoveType.MysticEffect, knight)!, RuleId.NextTurn)
    expect(location(rules, knight).type).toBe(LocationType.PlayerUnitBoard)
  })

  it('the points printed on the artifacts are added at the end of the game', () => {
    const rules = newRules()
    place(rules, Artifact.BottomlessPurse, Blue) // 2
    place(rules, Artifact.ShieldOfPower, Blue) // 1
    expect(new EndScoreHelper(rules.game, Blue).artifactsPoints).toBe(3)
  })
})

describe('What forges legends: buildings', () => {
  it('Inn: costs wood and food, 2 gold; level 2: 1 Legend point for each different cost of unit', () => {
    const rules = newRules()
    build(rules, Blue, Building.Inn, true)
    expect(income(rules, Blue)).toBe(2)
    place(rules, Unit.Farmer, Blue, 0, 1) // 0
    place(rules, Unit.Woodcutter, Blue, 1, 1) // 0
    place(rules, Unit.Knight, Blue, 0, 0) // 1
    runWar(rules)
    expect(rules.getScore(Blue)).toBe(2 + 6)
  })

  it('Sawmill: produces 2 wood; level 2: 1 Legend point for each wood', () => {
    const rules = newRules()
    build(rules, Blue, Building.Sawmill, true)
    place(rules, Unit.Woodcutter, Blue, 0, 1)
    expect(resource(rules, Blue, Resources.Wood)).toBe(3)
    runWar(rules)
    expect(rules.getScore(Blue)).toBe(3 + 6)
  })

  it('Royal Palace: 1 gold for each Legendary Artifact; level 2: 2 Legend points for each', () => {
    const rules = newRules()
    build(rules, Blue, Building.RoyalPalace, true)
    place(rules, Artifact.LuxuriantGrove, Blue)
    place(rules, Artifact.HornOfPlenty, Blue)
    expect(income(rules, Blue)).toBe(2)
    runWar(rules)
    expect(rules.getScore(Blue)).toBe(4 + 6)
  })
})
