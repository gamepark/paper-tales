import { describe, expect, it } from 'vitest'
import { isGainTokenOnDeploy } from '../material/effects/2_DeploymentEffects'
import { isGainTokenIfDying } from '../material/effects/6_AgeEffects'
import { isIgnoreFieldCost } from '../material/effects/5_Build'
import { CountKind, EffectType } from '../material/effects/Effect'
import { baseGameDeck, Unit } from '../material/Unit'
import { unitCardCaracteristics } from '../material/UnitCaracteristics'

/** Values read on the printed cards (docs/cards-audit.md) */
const effects = (unit: Unit) => unitCardCaracteristics[unit].effect ?? []

describe('Printed cards', () => {
  it('Peddler: 3 copies', () => {
    expect(baseGameDeck.filter((unit) => unit === Unit.Peddler)).toHaveLength(3)
  })

  it('Landlord: ignore the land cost', () => {
    expect(effects(Unit.LandLord).some(isIgnoreFieldCost)).toBe(true)
  })

  it('Master Alchemist: 1 Age token for each food', () => {
    const effect = effects(Unit.MasterAlchemist).find((e) => e.type === EffectType.GainAgeTokenOnChosenUnit)
    expect(effect).toMatchObject({ amount: 1 })
  })

  it('Kraken: loses 3 Legend points for each level 2 building', () => {
    expect(effects(Unit.Kraken).find(isGainTokenOnDeploy)).toMatchObject({ amount: -3, per: { kind: CountKind.Level2Buildings } })
  })

  it('Demon: -3 only if it dies with exactly one Age token', () => {
    expect(effects(Unit.Demon).find(isGainTokenIfDying)).toMatchObject({ amount: -3, ifSingleAgeToken: true })
  })

  it('Palm Reader: 1 Legend point for each Age token on the dying units', () => {
    expect(effects(Unit.PalmReader).find(isGainTokenIfDying)).toMatchObject({ amount: 1, perAgeToken: true })
  })
})

describe('Printed cards, behaviour', () => {
  it('Master Alchemist: no "once" icon, its Age tokens apply at every deployment', () => {
    const effect = effects(Unit.MasterAlchemist).find((e) => e.type === EffectType.GainAgeTokenOnChosenUnit)
    expect(effect).not.toHaveProperty('onDeployment', true)
  })

  it('Mystical Healer: "you may save", saving nobody is offered', async () => {
    const { PaperTalesSetup } = await import('../PaperTalesSetup')
    const { PaperTalesRules } = await import('../PaperTalesRules')
    const { LocationType } = await import('../material/LocationType')
    const { MaterialType } = await import('../material/MaterialType')
    const { PlayerColor } = await import('../PlayerColor')
    const { RuleId } = await import('../rules/RuleId')
    const { CustomMoveType } = await import('../rules/CustomMoveType')
    const { isCustomMoveType } = await import('@gamepark/rules-api')
    const game = new PaperTalesSetup().setup({ players: [{ id: PlayerColor.Blue }, { id: PlayerColor.Red }] })
    const rules = new PaperTalesRules(game)
    const healer = rules.material(MaterialType.Unit).id(Unit.MysticalHealer).getIndexes()[0]
    const other = rules.material(MaterialType.Unit).id((id) => id !== Unit.MysticalHealer).getIndexes()[0]
    game.items[MaterialType.Unit]![healer].location = { type: LocationType.PlayerUnitBoard, player: PlayerColor.Blue, x: 0, y: 0 }
    game.items[MaterialType.Unit]![other].location = { type: LocationType.PlayerUnitBoard, player: PlayerColor.Blue, x: 1, y: 0 }
    rules.play(rules.material(MaterialType.Age).createItem({ location: { type: LocationType.OnCard, parent: other, player: PlayerColor.Blue }, quantity: 1 }))
    rules.play(rules.startSimultaneousRule(RuleId.SaveUnitsWithMysticEffect, [PlayerColor.Blue]))
    const moves = rules.getLegalMoves(PlayerColor.Blue)
    expect(moves.some(isCustomMoveType(CustomMoveType.SaveNobody))).toBe(true)
    expect(moves.some(isCustomMoveType(CustomMoveType.MysticEffect))).toBe(true)
  })
})

describe('Mystical Healer and the next turn', () => {
  it('a Healer with nothing to save does not end the turn of other Monarchs in the next draft', async () => {
    const { PaperTalesSetup } = await import('../PaperTalesSetup')
    const { PaperTalesRules } = await import('../PaperTalesRules')
    const { LocationType } = await import('../material/LocationType')
    const { MaterialType } = await import('../material/MaterialType')
    const { PlayerColor } = await import('../PlayerColor')
    const { RuleId } = await import('../rules/RuleId')
    const players = [PlayerColor.Blue, PlayerColor.Red, PlayerColor.Green, PlayerColor.Yellow]
    const game = new PaperTalesSetup().setup({ players: players.map((id) => ({ id })) })
    const rules = new PaperTalesRules(game)
    // Clear the draft hands, then Green has a lone Healer: nothing to save
    for (const item of game.items[MaterialType.Unit]!) if (item.location.type === LocationType.PlayerDraftHand) item.location = { type: LocationType.Deck }
    const healer = rules.material(MaterialType.Unit).id(Unit.MysticalHealer).getIndexes()[0]
    game.items[MaterialType.Unit]![healer].location = { type: LocationType.PlayerUnitBoard, player: PlayerColor.Green, x: 0, y: 0 }
    const queue = rules.play(rules.startSimultaneousRule(RuleId.SaveUnitsWithMysticEffect, [PlayerColor.Green]))
    while (queue.length) queue.unshift(...rules.play(queue.shift()!))
    // The next turn begins: everyone drafts
    expect(game.rule?.id).toBe(RuleId.Draft)
    for (const player of players) expect(rules.isTurnToPlay(player)).toBe(true)
  })
})
