import { isMoveItemType, isMoveItemTypeAtOnce, ItemMove, Material, MaterialItem, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { sumBy } from 'es-toolkit/compat'
import { AgeTokens } from '../helpers/AgeTokens'
import {
  GainAgeToken,
  ImproveBuilding,
  isDeploymentType,
  isGainAgeToken,
  isGainAgeTokenOnChosenUnit,
  isGainTokenOnDeploy,
  isImproveBuilding,
  isShapeshifter
} from '../../material/effects/2_DeploymentEffects'
import { Effect, WhichBuilding, WhichUnit } from '../../material/effects/Effect'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics, UnitPattern } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { BuildHelper } from '../helpers/BuildHelper'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { ScoreHelper } from '../helpers/ScoreHelper'
import { Memory } from '../Memory'

import { RuleId } from '../RuleId'

export class DeployEffects extends SimultaneousRule {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    for (const player of players) {
      const deployedUnitsIndexes = this.remind<number[]>(Memory.PlayedCardsDuringDeployment, player)
      const playerUnitBoard = this.getPlayerUnits(player)
      const buildHelper = new BuildHelper(this.game, player)
      const scoreHelper = new ScoreHelper(this.game, player)
      let scoreToAdd = 0

      // The effects of the phase take into account everything in play at the end of the phase (rulebook p.12): the
      // level 2 Buildings include the ones a Golem revealed this turn improves
      const improvesAll = playerUnitBoard.entries.some(
        ([index, unit]) => deployedUnitsIndexes.includes(index) && (unitCardCaracteristics[unit.id as Unit].effect ?? []).some(isImproveBuilding)
      )
      const level2Buildings = buildHelper.buildLevel2Buildings.length + (improvesAll ? buildHelper.builtLevel1Buildings.length : 0)

      for (const [unitIndex, unit] of playerUnitBoard.entries) {
        const unitId = unit.id as Unit
        const characteristics: UnitPattern = unitCardCaracteristics[unitId]
        const effects = characteristics.effect ?? []
        for (const effect of effects) {
          if (isGainTokenOnDeploy(effect) && effect.token === MaterialType.ScoreToken) {
            if (!effect.onDeployment || deployedUnitsIndexes.includes(unitIndex)) {
              const factor = effect.perLevel2Builds ? level2Buildings : 1
              scoreToAdd += effect.amount * factor
            }
          } else {
            moves.push(...this.getUnitDeployEffectMoves(unit, unitIndex, player, effect))
          }
        }
      }

      moves.push(...scoreHelper.gainOrLoseScore(scoreToAdd))
      // A Shapeshifter draws until it keeps a unit: the turn ends once it is kept, before the wars
      if (!moves.some((move) => this.isShapeshifterDraw(move, player))) moves.push(this.endPlayerTurn(player))
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    const moves: MaterialMove[] = []

    if (isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitBoard) {
      let scoreToAdd = 0
      const unitCard = this.material(MaterialType.Unit).index(move.itemIndex)
      const unit = unitCard.getItem()!
      const player = move.location.player!
      const unitId = unit.id as Unit

      const shapeShifterCard = this.material(MaterialType.Unit)
        .location(LocationType.PlayerUnitBoard)
        .player(player)
        .filter((item) => item.id === Unit.Shapeshifter)
      // Draw and discard until a unit of cost 3 or less is revealed (printed on the card)
      if (unitCardCaracteristics[unitId].cost > 3) {
        moves.push(unitCard.moveItem({ type: LocationType.Discard }))
        if (this.deck.length) {
          moves.push(this.deck.dealOne({ type: LocationType.PlayerUnitBoard, player, x: unit.location.x, y: unit.location.y }))
        } else {
          moves.push(...(this.refillDeck(player) ?? [...this.shapeshifterStays(player), this.endPlayerTurn(player)]))
        }
      } else {
        const effects: Effect[] | undefined = unitCardCaracteristics[unitId].effect
        const buildHelper = new BuildHelper(this.game, player)
        const scoreHelper = new ScoreHelper(this.game, player)

        // The drawn unit is deployed this turn: its "when revealed" effects apply
        this.memorize(Memory.PlayedCardsDuringDeployment, (cards: number[] = []) => [...cards, move.itemIndex], player)
        const deployedUnitsIndexes = this.remind<number[]>(Memory.PlayedCardsDuringDeployment, player)
        this.forget(Memory.ShapeshifterRefill, player)

        if (effects !== undefined) {
          effects.forEach((eff) => {
            if (isGainTokenOnDeploy(eff) && eff.token === MaterialType.ScoreToken) {
              if (!eff.onDeployment || deployedUnitsIndexes.includes(move.itemIndex)) {
                const coeff = eff.perLevel2Builds ? buildHelper.buildLevel2Buildings.getQuantity() : 1
                scoreToAdd += eff.amount * coeff
              }
            } else {
              moves.push(...this.getUnitDeployEffectMoves(unit, move.itemIndex, player, eff))
            }
          })
          // Once, after all the effects: the score moves to its new position from the current one
          moves.push(...scoreHelper.gainOrLoseScore(scoreToAdd))
        }

        // The Shapeshifter leaves with the Age tokens it may have received (Necromancer, Kraken)
        for (const index of shapeShifterCard.getIndexes()) moves.push(...new AgeTokens(this).remove(index))
        moves.push(shapeShifterCard.moveItem({ type: LocationType.Discard }))
        // Its Age token, plus the ones the other units revealed this turn give to it (Necromancer): it is in play at the end of the phase
        moves.push(new AgeTokens(this).add(move.itemIndex, player, 1 + this.ageTokensFromOthers(player, move.itemIndex)))
        moves.push(this.endPlayerTurn(player))
      }
    }

    // The discard just became the new deck for a Shapeshifter: it draws from it
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.Deck) {
      for (const player of this.game.players) {
        if (!this.remind(Memory.ShapeshifterRefill, player)) continue
        const shapeshifter = this.getPlayerUnits(player).id(Unit.Shapeshifter)
        if (shapeshifter.length) moves.push(...this.onShapeShifter(player, shapeshifter.getItem()!))
        else moves.push(this.endPlayerTurn(player))
      }
    }
    return moves
  }

  /** The Shapeshifter is still drawing: either a card comes to the board, or the discard is being shuffled into a new deck */
  private isShapeshifterDraw(move: MaterialMove, player: PlayerColor) {
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.Deck) return !!this.remind(Memory.ShapeshifterRefill, player)
    return isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitBoard && move.location.player === player
  }

  /**
   * The deck is empty while a Shapeshifter draws: the discard is shuffled into a new deck, as during the deal (rulebook
   * p.5), once per Shapeshifter so that a discard without any unit of cost 3 or less does not loop. Undefined when there
   * is nothing to shuffle.
   */
  private refillDeck(player: PlayerColor): MaterialMove[] | undefined {
    const discard = this.material(MaterialType.Unit).location(LocationType.Discard)
    if (!discard.length || this.remind(Memory.ShapeshifterRefill, player)) return undefined
    this.memorize(Memory.ShapeshifterRefill, true, player)
    return [discard.shuffle(), discard.moveItemsAtOnce({ type: LocationType.Deck })]
  }

  getActivePlayerLegalMoves(_playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []
    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    let goToChooseRule = false

    for (const player of this.game.players) {
      this.forget(Memory.ShapeshifterRefill, player)
      const unitWithPlaceAgeToken: number[] = this.getUnitsWithPlaceAgeToken(player).getIndexes()

      if (unitWithPlaceAgeToken.length > 0) {
        this.memorize(Memory.PlacingAgeTokenUnitsIndexes, unitWithPlaceAgeToken, player)
        goToChooseRule = true
      }
    }

    if (goToChooseRule) {
      return [this.startSimultaneousRule(RuleId.ChooseWherePlacingAgeToken, this.playersPlacingAgeTokenUnits)]
    }

    return [this.startRule(RuleId.War)]
  }

  getUnitsWithPlaceAgeToken(player: PlayerColor) {
    const units = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
    const deployedUnits: number[] = this.remind(Memory.PlayedCardsDuringDeployment, player)
    return units.filter((item, index) => {
      const unitId = item.id as Unit
      const effects = unitCardCaracteristics[unitId].effect
      if (!effects?.length) return false
      const gainAgeTokenOnChosenUnit = effects.find(isGainAgeTokenOnChosenUnit)
      if (!gainAgeTokenOnChosenUnit) return false
      // Nothing to place: no choice to make (the Master Alchemist without food)
      if (gainAgeTokenOnChosenUnit.perResource !== undefined && !new ResourcesHelper(this.game, player).getResource(gainAgeTokenOnChosenUnit.perResource)) {
        return false
      }
      return !gainAgeTokenOnChosenUnit.onDeployment || deployedUnits.includes(index)
    })
  }

  getPlayerUnits(player: number): Material {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
  }

  getUnitDeployEffectMoves(unit: MaterialItem, unitIndex: number, player: PlayerColor, eff: Effect): MaterialMove[] {
    const moves: MaterialMove[] = []
    const deployedUnitsIndexes = this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []

    if (!isDeploymentType(eff)) return moves
    // "When revealed" effects: this very card was deployed this turn (an older copy kept in play does not count)
    if (eff.onDeployment && !deployedUnitsIndexes.includes(unitIndex)) return moves

    if (isImproveBuilding(eff)) {
      moves.push(...this.onImproveBuilding(player, eff))
    } else if (isShapeshifter(eff)) {
      moves.push(...this.onShapeShifter(player, unit))
    } else if (isGainAgeToken(eff)) {
      moves.push(...this.onGainAgeToken(player, eff, unitIndex))
    } else if (isGainTokenOnDeploy(eff)) {
      if (eff.token === MaterialType.Gold) {
        // No case in base game
      }
    }

    return moves
  }

  get playersPlacingAgeTokenUnits(): PlayerColor[] {
    return this.game.players.filter((player) => this.remind(Memory.PlacingAgeTokenUnitsIndexes, player) !== undefined)
  }

  private onImproveBuilding(player: PlayerColor, eff: ImproveBuilding) {
    if (eff.whichBuilding === WhichBuilding.All) {
      const buildHelper = new BuildHelper(this.game, player)
      const buildingLevel1 = buildHelper.builtLevel1Buildings
      return buildingLevel1.moveItems({ rotation: true })
    } else {
      return []
      // TODO: No case in base game, but should consider Djinn for later
    }
  }

  /**
   * A Shapeshifter revealed this turn is not in play at the end of the phase (rulebook p.12): the unit it draws takes its
   * place. The Age tokens the other units give (Necromancer, Kraken) go to that unit once kept, never to the Shapeshifter.
   */
  private isLeavingShapeshifter(player: PlayerColor, unitIndex: number) {
    const deployedUnitsIndexes = this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
    return deployedUnitsIndexes.includes(unitIndex) && this.material(MaterialType.Unit).getItem<Unit>(unitIndex).id === Unit.Shapeshifter
  }

  /** The Age tokens the units revealed this turn give to the other units of their Monarch, received by the given unit */
  private ageTokensFromOthers(player: PlayerColor, unitIndex: number) {
    const deployedUnitsIndexes = this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
    return sumBy(
      this.getPlayerUnits(player).entries.filter(([index]) => index !== unitIndex && deployedUnitsIndexes.includes(index)),
      ([, unit]) =>
        sumBy(
          (unitCardCaracteristics[unit.id as Unit].effect ?? []).filter((effect): effect is GainAgeToken => isGainAgeToken(effect) && effect.whichUnit === WhichUnit.Others),
          (effect) => effect.amount
        )
    )
  }

  /** No unit of cost 3 or less left to draw: the Shapeshifter stays in play, and receives the tokens of the others */
  private shapeshifterStays(player: PlayerColor): MaterialMove[] {
    const shapeshifter = this.getPlayerUnits(player).id(Unit.Shapeshifter)
    const quantity = shapeshifter.length ? this.ageTokensFromOthers(player, shapeshifter.getIndex()) : 0
    return quantity ? [new AgeTokens(this).add(shapeshifter.getIndex(), player, quantity)] : []
  }

  private onShapeShifter(player: PlayerColor, unit: MaterialItem): MaterialMove[] {
    const deck = this.deck
    if (!deck.length) return this.refillDeck(player) ?? this.shapeshifterStays(player)
    return [
      deck.dealOne({
        type: LocationType.PlayerUnitBoard,
        player,
        x: unit.location.x,
        y: unit.location.y
      })
    ]
  }

  get deck() {
    return this.material(MaterialType.Unit).location(LocationType.Deck).deck()
  }

  private onGainAgeToken(player: number, eff: GainAgeToken, unitIndex: number) {
    const playerUnitBoard = this.getPlayerUnits(player)
    if (eff.whichUnit === WhichUnit.Myself) {
      return [
        new AgeTokens(this).add(unitIndex, player, eff.amount)
      ]
    } else if (eff.whichUnit === WhichUnit.All) {
      // No case in whole game
      //} else if (eff.whichUnit === WhichUnit.Others) {
    } else {
      const moves: MaterialMove[] = []
      for (const entry of playerUnitBoard.entries) {
        const spaceIndex = entry[0]
        if (spaceIndex !== unitIndex && !this.isLeavingShapeshifter(player, spaceIndex)) {
          moves.push(
            new AgeTokens(this).add(spaceIndex, player, eff.amount)
          )
        }
      }

      return moves
    }

    return []
  }
}
