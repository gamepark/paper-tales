import { isMoveItemType, ItemMove, Material, MaterialItem, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
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
import { ScoreHelper } from '../helpers/ScoreHelper'
import { Memory } from '../Memory'

import { RuleId } from '../RuleId'

export class DeployEffects extends SimultaneousRule {
  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players

    players.forEach((player) => {
      const deployedUnitsIndexes = this.remind<number[]>(Memory.PlayedCardsDuringDeployment, player)
      const deployedUnits = this.material(MaterialType.Unit).index(deployedUnitsIndexes).getItems()
      const playerUnitBoard = this.getPlayerUnits(player)
      const buildHelper = new BuildHelper(this.game, player)
      const scoreHelper = new ScoreHelper(this.game, player)
      let scoreToAdd = 0

      for (const [unitIndex, unit] of playerUnitBoard.entries) {
        const unitId = unit.id as Unit
        const characteristics: UnitPattern = unitCardCaracteristics[unitId]
        const effects = characteristics.effect ?? []
        for (const effect of effects) {
          if (isGainTokenOnDeploy(effect) && effect.token === MaterialType.ScoreToken) {
            if (!effect.onDeployment || deployedUnits.find((deployedUnit) => deployedUnit.id === unit.id)) {
              const factor = effect.perLevel2Builds ? buildHelper.buildLevel2Buildings.length : 1
              scoreToAdd = effect.amount * factor
            }
          } else {
            moves.push(...this.getUnitDeployEffectMoves(unit, unitIndex, player, effect))
          }
        }
      }

      moves.push(...scoreHelper.gainOrLoseScore(scoreToAdd))
    })

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
      if (unitCardCaracteristics[unitId].cost < 1) {
        moves.push(unitCard.moveItem({ type: LocationType.Discard }))
        moves.push(
          this.material(MaterialType.Unit).location(LocationType.Deck).deck().dealOne({
            type: LocationType.PlayerUnitBoard,
            player: unit.location.player,
            x: unit.location.x,
            y: unit.location.y
          })
        )
      } else {
        const effects: Effect[] | undefined = unitCardCaracteristics[unitId].effect
        const deployedUnitsIndexes = this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
        const deployedUnits = this.material(MaterialType.Unit).index(deployedUnitsIndexes).getItems()
        const buildHelper = new BuildHelper(this.game, player)
        const scoreHelper = new ScoreHelper(this.game, player)

        const cardsPlayedIndexes: number[] = this.remind(Memory.PlayedCardsDuringDeployment, player)
        cardsPlayedIndexes.push(move.itemIndex)
        this.memorize(Memory.PlayedCardsDuringDeployment, cardsPlayedIndexes, player)

        if (effects !== undefined) {
          effects.forEach((eff) => {
            if (isGainTokenOnDeploy(eff) && eff.token === MaterialType.ScoreToken) {
              if (!eff.onDeployment || deployedUnits.find((deployedUnit) => deployedUnit.id === unitId)) {
                const coeff = eff.perLevel2Builds ? buildHelper.buildLevel2Buildings.getQuantity() : 1
                scoreToAdd = eff.amount * coeff
              }
            } else {
              moves.push(...this.getUnitDeployEffectMoves(unit, move.itemIndex, player, eff))
            }

            moves.push(...scoreHelper.gainOrLoseScore(scoreToAdd))
          })
        }

        moves.push(shapeShifterCard.moveItem({ type: LocationType.Discard }))
        moves.push(
          this.material(MaterialType.Age).createItem({
            location: { type: LocationType.OnCard, parent: move.itemIndex, player: player },
            quantity: 1
          })
        )
      }
    }
    return moves
  }

  getActivePlayerLegalMoves(_playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []
    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    let goToChooseRule = false

    for (const player of this.game.players) {
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
      return !gainAgeTokenOnChosenUnit.onDeployment || deployedUnits.includes(index)
    })
  }

  getPlayerUnits(player: number): Material {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(player)
  }

  getUnitDeployEffectMoves(unit: MaterialItem, unitIndex: number, player: PlayerColor, eff: Effect): MaterialMove[] {
    const moves: MaterialMove[] = []
    const deployedUnitsIndexes = this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, player) ?? []
    const deployedUnits = this.material(MaterialType.Unit).index(deployedUnitsIndexes)

    if (!isDeploymentType(eff)) return moves
    if (eff.onDeployment && !deployedUnits.id(unit.id).length) return moves

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

  private onShapeShifter(player: number, unit: MaterialItem): MaterialMove[] {
    const deck = this.deck
    if (!deck.length) return []
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
        this.material(MaterialType.Age).createItem({
          location: { type: LocationType.OnCard, parent: unitIndex, player: player },
          quantity: eff.amount
        })
      ]
    } else if (eff.whichUnit === WhichUnit.All) {
      // No case in whole game
      //} else if (eff.whichUnit === WhichUnit.Others) {
    } else {
      const moves: MaterialMove[] = []
      for (const entry of playerUnitBoard.entries) {
        const spaceIndex = entry[0]
        if (spaceIndex !== unitIndex) {
          moves.push(
            this.material(MaterialType.Age).createItem({
              location: { type: LocationType.OnCard, parent: spaceIndex, player: player },
              quantity: eff.amount
            })
          )
        }
      }

      return moves
    }

    return []
  }
}
