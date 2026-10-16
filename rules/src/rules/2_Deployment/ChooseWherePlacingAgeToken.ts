import { CustomMove, isCustomMoveType, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { isGainAgeTokenOnChosenUnit } from '../../material/effects/2_DeploymentEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { CustomMoveType, GainAgeTokenOnChosenUnitEffect } from '../CustomMoveType'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class ChooseWherePlacingAgeToken extends SimultaneousRule {
  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []

    const playerBoardUnit = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)

    playerBoardUnit.getIndexes().forEach((index) => {
      moves.push(
        this.customMove(CustomMoveType.GainAgeTokenOnChosenUnitEffect, {
          unitIndex: index,
          player: playerId
        })
      )
    })
    return moves
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (!isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move)) return []
    const data: GainAgeTokenOnChosenUnitEffect = move.data
    const chosenUnitIndex = data.unitIndex
    const placeAgeTokenUnitIndex: number = this.remind<number[]>(Memory.PlacingAgeTokenUnitsIndexes, data.player)[0]

    const placeAgeTokenUnitId = this.material(MaterialType.Unit).getItem(placeAgeTokenUnitIndex).id as Unit

    const unitEffect = unitCardCaracteristics[placeAgeTokenUnitId].effect!.find(isGainAgeTokenOnChosenUnit)!

    const resourcesHelper = new ResourcesHelper(this.game, data.player)

    const quantityOfAgeTokens: number =
      unitEffect.perResource === undefined ? unitEffect.amount : unitEffect.amount * resourcesHelper.getResource(unitEffect.perResource)

    // Ajout des jetons
    moves.push(
      this.material(MaterialType.Age).createItem({
        location: {
          type: LocationType.OnCard,
          parent: chosenUnitIndex,
          player: data.player
        },
        quantity: quantityOfAgeTokens
      })
    )

    // MaJ des effets à traiter
    if (!this.remainsPlaceAgeToken(data.player)) {
      moves.push(this.endPlayerTurn(data.player))
    }

    return moves
  }

  remainsPlaceAgeToken(player: PlayerColor): boolean {
    this.memorize(
      Memory.PlacingAgeTokenUnitsIndexes,
      (indexes: number[] = []) => {
        indexes.shift()
        return indexes
      },
      player
    )

    const placingAgeIndexes: number[] = this.remind<number[] | undefined>(Memory.PlacingAgeTokenUnitsIndexes, player) ?? []
    return placingAgeIndexes.length > 0
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    this.game.players.forEach((player) => this.forget(Memory.PlacingAgeTokenUnitsIndexes, player))
    return [this.startRule(RuleId.War)]
  }
}
