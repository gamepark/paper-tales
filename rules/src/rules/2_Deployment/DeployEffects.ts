import { CustomMove, isCustomMoveType, isMoveItemType, isMoveItemTypeAtOnce, ItemMove, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { sortBy } from 'es-toolkit/compat'
import { Card, isArtifact, isUnit } from '../../material/Artifact'
import { cardEffects } from '../../material/CardCaracteristics'
import {
  DeploymentEffect,
  GainAgeToken,
  GainAgeTokenOnChosenUnit,
  GainTokenOnDeploy,
  isDeploymentType,
  isGainAgeTokenOnChosenUnit,
  isImproveBuilding,
  isMoveAgeToken,
  isReactivateRevealEffects
} from '../../material/effects/2_DeploymentEffects'
import { EffectType, WhichBuilding, WhichUnit } from '../../material/effects/Effect'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { BuildRandomBuildingData, CustomMoveType, GainAgeTokenOnChosenUnitEffect, ReactivateUnitData } from '../CustomMoveType'
import { AgeTokens } from '../helpers/AgeTokens'
import { BuildHelper } from '../helpers/BuildHelper'
import { KingdomHelper } from '../helpers/KingdomHelper'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { Memory, PendingDeployEffect } from '../Memory'
import { RuleId } from '../RuleId'

/**
 * The order the effects of a Monarch resolve in. Each effect takes into account as many elements as possible of the end
 * of the phase (rulebook p.12): the cards that replace others come first (the Shapeshifter), then what changes the
 * buildings and the artifacts, then the Age tokens, then what counts the kingdom.
 */
const priority: Record<DeploymentEffect['type'], number> = {
  [EffectType.Shapeshifter]: 0,
  [EffectType.ImproveBuilding]: 1,
  [EffectType.BuildRandomLevel2]: 1,
  [EffectType.DrawArtifact]: 2,
  [EffectType.ReactivateRevealEffects]: 3,
  [EffectType.GainAgeToken]: 4,
  [EffectType.GainAgeTokenOnChosenUnit]: 5,
  [EffectType.MoveAgeToken]: 6,
  [EffectType.GainTokenOnDeploy]: 7
}

/** The effects a Monarch chooses how to apply */
const isChoice = (effect: DeploymentEffect) =>
  isGainAgeTokenOnChosenUnit(effect) ||
  isMoveAgeToken(effect) ||
  isReactivateRevealEffects(effect) ||
  (isImproveBuilding(effect) && effect.whichBuilding === WhichBuilding.Choice)

/** The effects that draw at random: the next effect waits for the draw to end */
const isDraw = (effect: DeploymentEffect) =>
  effect.type === EffectType.Shapeshifter || effect.type === EffectType.DrawArtifact || effect.type === EffectType.BuildRandomLevel2

/** The discard was shuffled into a new deck for a draw of a Monarch: the draw goes on once it is in place, then never again this turn */
export enum DeckRefill {
  Refilling = 1,
  Refilled
}

/**
 * The deployment effects (rulebook p.5): the "when revealed" effects of the cards revealed this turn, and the effects of
 * the cards and buildings that act at every Deployment phase. Every Monarch resolves their effects one after the other,
 * in the order above, each one on the kingdom left by the previous ones; the turn of a Monarch ends with their last effect.
 */
export class DeployEffects extends SimultaneousRule {
  onRuleStart(): MaterialMove[] {
    return this.game.players.flatMap((player) => {
      this.memorize(Memory.DeployEffects, this.sort(this.getTriggeredEffects(player)), player)
      return this.resolve(player)
    })
  }

  getTriggeredEffects(player: PlayerColor): PendingDeployEffect[] {
    const deployed = this.getDeployedIndexes(player)
    const cards = new KingdomHelper(this.game, player).cards.entries.flatMap(([source, card]) =>
      cardEffects(card.id as Card)
        .filter(isDeploymentType)
        .filter((effect) => !effect.onDeployment || deployed.includes(source))
        .map((effect) => ({ source, effect }))
    )
    const buildings = new BuildHelper(this.game, player).buildingEffects.filter(isDeploymentType).map((effect) => ({ effect }))
    return [...cards, ...buildings]
  }

  private sort(queue: PendingDeployEffect[]) {
    return sortBy(queue, (pending) => priority[pending.effect.type])
  }

  getQueue(player: PlayerColor): PendingDeployEffect[] {
    return this.remind<PendingDeployEffect[] | undefined>(Memory.DeployEffects, player) ?? []
  }

  /** The effect a Monarch is resolving, or has to choose how to apply */
  getCurrentEffect(player: PlayerColor): PendingDeployEffect | undefined {
    return this.getQueue(player)[0]
  }

  /**
   * Resolves the effects of a Monarch from the first one: stops at a choice, or after the moves of an effect (the next one
   * is resolved once they are played, see ResolveNextDeployEffect). The turn of the Monarch ends when none is left.
   */
  private resolve(player: PlayerColor): MaterialMove[] {
    const queue = this.getQueue(player)
    while (queue.length) {
      const pending = queue[0]
      if (isChoice(pending.effect)) {
        if (this.getChoiceMoves(player, pending).length) {
          this.memorize(Memory.DeployEffects, queue, player)
          return []
        }
      } else {
        const moves = this.apply(player, pending)
        if (moves.length) {
          this.memorize(Memory.DeployEffects, queue, player)
          return isDraw(pending.effect) ? moves : [...moves, this.resolveNext(player)]
        }
      }
      queue.shift()
    }
    this.forget(Memory.DeployEffects, player)
    return [this.endPlayerTurn(player)]
  }

  private resolveNext(player: PlayerColor) {
    return this.customMove(CustomMoveType.ResolveNextDeployEffect, player)
  }

  /** The effect being resolved is done, with new effects to resolve (the ones of a unit drawn, or applied again by a Shadow) */
  private done(player: PlayerColor, added: PendingDeployEffect[] = []): MaterialMove[] {
    if (added.length) {
      const [current, ...others] = this.getQueue(player)
      this.memorize(Memory.DeployEffects, [current, ...this.sort([...others, ...added])], player)
    }
    return [this.resolveNext(player)]
  }

  getActivePlayerLegalMoves(player: PlayerColor): MaterialMove[] {
    const pending = this.getCurrentEffect(player)
    return pending && isChoice(pending.effect) ? this.getChoiceMoves(player, pending) : []
  }

  getChoiceMoves(player: PlayerColor, { source, effect }: PendingDeployEffect): MaterialMove[] {
    const units = this.getPlayerUnits(player)
    switch (effect.type) {
      case EffectType.GainAgeTokenOnChosenUnit: {
        if (!this.getChosenAgeTokens(player, effect)) return []
        const deployed = this.getDeployedIndexes(player)
        const targets = effect.among === WhichUnit.DeployedThisTurn ? units.index((index) => deployed.includes(index)) : units
        return targets.getIndexes().map((unitIndex) => this.customMove(CustomMoveType.GainAgeTokenOnChosenUnitEffect, { unitIndex, player }))
      }
      case EffectType.ImproveBuilding:
        return new BuildHelper(this.game, player).builtLevel1Buildings.rotateItems(true)
      case EffectType.MoveAgeToken: {
        const tokens = new AgeTokens(this)
        return units.getIndexes().flatMap((from) =>
          tokens.count(from)
            ? units
                .getIndexes()
                .filter((to) => to !== from)
                .map((to) => tokens.on(from).moveItem({ type: LocationType.OnCard, parent: to, player }, 1))
            : []
        )
      }
      case EffectType.ReactivateRevealEffects:
        return units
          .filter<Unit>((unit, index) => index !== source && unit.id !== Unit.Shadow && this.getRevealEffects(index).length > 0)
          .getIndexes()
          .map((unitIndex) => this.customMove(CustomMoveType.ReactivateUnit, { unitIndex, player }))
      default:
        return []
    }
  }

  /** The Age tokens a Monarch places on the unit of their choice (the Master Alchemist: one for each food) */
  getChosenAgeTokens(player: PlayerColor, effect: GainAgeTokenOnChosenUnit) {
    if (effect.perResource === undefined) return effect.amount
    return effect.amount * new ResourcesHelper(this.game, player).getResource(effect.perResource)
  }

  /** The "when revealed" effects of a card in play */
  private getRevealEffects(index: number): PendingDeployEffect[] {
    const card = this.material(MaterialType.Unit).getItem<Card>(index).id
    return cardEffects(card)
      .filter(isDeploymentType)
      .filter((effect) => effect.onDeployment)
      .map((effect) => ({ source: index, effect }))
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    if (isCustomMoveType(CustomMoveType.ResolveNextDeployEffect)(move)) {
      const player = move.data as PlayerColor
      this.memorize(Memory.DeployEffects, this.getQueue(player).slice(1), player)
      return this.resolve(player)
    }
    if (isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move)) {
      const { unitIndex, player } = move.data as GainAgeTokenOnChosenUnitEffect
      const effect = this.getCurrentEffect(player)!.effect as GainAgeTokenOnChosenUnit
      return [new AgeTokens(this).add(unitIndex, player, this.getChosenAgeTokens(player, effect)), ...this.done(player)]
    }
    if (isCustomMoveType(CustomMoveType.ReactivateUnit)(move)) {
      const { unitIndex, player } = move.data as ReactivateUnitData
      return this.done(player, this.getRevealEffects(unitIndex))
    }
    if (isCustomMoveType(CustomMoveType.BuildRandomBuilding)(move)) {
      const { player, building } = move.data as BuildRandomBuildingData
      if (building === undefined) return this.done(player)
      return [this.material(MaterialType.Building).index(building).moveItem({ type: LocationType.PlayerBuildingBoard, player, rotation: true }), ...this.done(player)]
    }
    return []
  }

  /** The moves of an effect that resolves on its own; none when it has nothing to do */
  private apply(player: PlayerColor, { source, effect }: PendingDeployEffect): MaterialMove[] {
    switch (effect.type) {
      case EffectType.Shapeshifter:
      case EffectType.DrawArtifact:
        return this.draw(player, effect.type, source)
      case EffectType.ImproveBuilding:
        return new BuildHelper(this.game, player).builtLevel1Buildings.rotateItems(true)
      case EffectType.BuildRandomLevel2:
        return new BuildHelper(this.game, player).availableBuildings.length ? [this.customMove(CustomMoveType.BuildRandomBuilding, { player })] : []
      case EffectType.GainAgeToken:
        return this.gainAgeTokens(player, effect, source)
      case EffectType.GainTokenOnDeploy:
        return this.gainTokens(player, effect, source)
      default:
        return []
    }
  }

  private gainAgeTokens(player: PlayerColor, effect: GainAgeToken, source?: number): MaterialMove[] {
    const tokens = new AgeTokens(this)
    const deployed = this.getDeployedIndexes(player)
    const targets = this.getPlayerUnits(player).index((index) => {
      switch (effect.whichUnit) {
        case WhichUnit.Myself:
          return index === source
        case WhichUnit.Others:
          return index !== source
        case WhichUnit.OthersDeployedThisTurn:
          return index !== source && deployed.includes(index)
        case WhichUnit.DeployedThisTurn:
          return deployed.includes(index)
        case WhichUnit.All:
          return true
      }
    })
    return targets.getIndexes().map((index) => tokens.add(index, player, effect.amount))
  }

  private gainTokens(player: PlayerColor, effect: GainTokenOnDeploy, source?: number): MaterialMove[] {
    const kingdom = new KingdomHelper(this.game, player)
    if (!kingdom.meets(effect.condition, source)) return []
    const amount = effect.per ? effect.amount * kingdom.count(effect.per, source) : effect.amount
    if (!amount) return []
    if (effect.token === MaterialType.ScoreToken) return new ScoreHelper(this.game, player).gainOrLoseScore(amount)
    return this.material(MaterialType.Gold).money(golds).addMoney(amount, { type: LocationType.PlayerGoldStock, player })
  }

  /**
   * Draws a card for an effect: the Shapeshifter at its place on the board, the Court Jester among the artifacts. An empty
   * deck is refilled with the discard once per Monarch and per turn (rulebook p.5). No move when there is nothing to draw.
   */
  private draw(player: PlayerColor, type: EffectType.Shapeshifter | EffectType.DrawArtifact, source?: number): MaterialMove[] {
    if (!this.deck.length) return this.refillDeck(player)
    if (type === EffectType.DrawArtifact) return [this.deck.dealOne({ type: LocationType.PlayerArtifacts, player })]
    if (source === undefined) return []
    const shapeshifter = this.material(MaterialType.Unit).getItem(source)
    if (shapeshifter.location.type !== LocationType.PlayerUnitBoard) return []
    return [this.deck.dealOne({ type: LocationType.PlayerUnitBoard, player, x: shapeshifter.location.x, y: shapeshifter.location.y })]
  }

  private refillDeck(player: PlayerColor): MaterialMove[] {
    const discard = this.material(MaterialType.Unit).location(LocationType.Discard)
    if (!discard.length || this.remind(Memory.DeckRefilled, player)) return []
    this.memorize(Memory.DeckRefilled, DeckRefill.Refilling, player)
    return [discard.shuffle(), discard.moveItemsAtOnce({ type: LocationType.Deck })]
  }

  /** A card drawn for an effect, or the deck refilled, or a choice made by moving a card or a token */
  afterItemMove(move: ItemMove): MaterialMove[] {
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.Deck) {
      return this.game.players.flatMap((player) => {
        if (this.remind(Memory.DeckRefilled, player) !== DeckRefill.Refilling) return []
        this.memorize(Memory.DeckRefilled, DeckRefill.Refilled, player)
        return this.drawAgain(player)
      })
    }
    if (isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitBoard) {
      return this.onShapeshifterDraw(move.location.player!, move.itemIndex)
    }
    if (isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerArtifacts) {
      const player = move.location.player!
      const drawn = this.material(MaterialType.Unit).index(move.itemIndex)
      // Drawn and discarded until an artifact is revealed, put into play for free (the Court Jester)
      if (isArtifact(this.material(MaterialType.Unit).getItem<Card>(move.itemIndex).id)) return this.done(player)
      return [drawn.moveItem({ type: LocationType.Discard }), ...this.drawAgain(player)]
    }
    // A choice made by a move: a building improved (the Djinn), an Age token moved (the Wizard Apprentice)
    const player = isMoveItemType(MaterialType.Building)(move) || isMoveItemType(MaterialType.Age)(move) ? this.getMovedItemPlayer(move) : undefined
    if (player !== undefined) {
      const pending = this.getCurrentEffect(player)
      if (pending && isChoice(pending.effect) && (isImproveBuilding(pending.effect) || isMoveAgeToken(pending.effect))) return this.done(player)
    }
    return []
  }

  private getMovedItemPlayer(move: ItemMove): PlayerColor | undefined {
    if (!isMoveItemType(MaterialType.Building)(move) && !isMoveItemType(MaterialType.Age)(move)) return undefined
    return move.location.player ?? this.material(move.itemType).getItem(move.itemIndex).location.player
  }

  /** The current draw goes on, or ends when there is nothing left to draw */
  private drawAgain(player: PlayerColor): MaterialMove[] {
    const pending = this.getCurrentEffect(player)!
    const type = pending.effect.type as EffectType.Shapeshifter | EffectType.DrawArtifact
    const moves = this.draw(player, type, pending.source)
    return moves.length ? moves : this.done(player)
  }

  /**
   * The Shapeshifter draws and discards until a unit of cost 3 or less is revealed (printed on the card). The unit takes
   * its place for free with an Age token, and its own "when revealed" effects apply (rulebook p.12).
   */
  private onShapeshifterDraw(player: PlayerColor, drawnIndex: number): MaterialMove[] {
    const drawn = this.material(MaterialType.Unit).index(drawnIndex)
    const card = this.material(MaterialType.Unit).getItem<Card>(drawnIndex).id
    if (!isUnit(card) || unitCardCaracteristics[card].cost > 3) return [drawn.moveItem({ type: LocationType.Discard }), ...this.drawAgain(player)]
    const shapeshifter = this.getCurrentEffect(player)!.source!
    const tokens = new AgeTokens(this)
    this.memorize(Memory.PlayedCardsDuringDeployment, (cards: number[] = []) => [...cards.filter((index) => index !== shapeshifter), drawnIndex], player)
    return [
      // The Shapeshifter leaves with the Age tokens it may have received
      ...tokens.remove(shapeshifter),
      this.material(MaterialType.Unit).index(shapeshifter).moveItem({ type: LocationType.Discard }),
      tokens.add(drawnIndex, player),
      ...this.done(player, this.getRevealEffects(drawnIndex))
    ]
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    for (const player of this.game.players) this.forget(Memory.DeckRefilled, player)
    return [this.startRule(RuleId.War)]
  }

  getDeployedIndexes(player: PlayerColor): number[] {
    return this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
  }

  getPlayerUnits(player: number) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
  }

  get deck() {
    return this.material(MaterialType.Unit).location(LocationType.Deck).deck()
  }
}
