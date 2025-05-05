import { CustomMove, isCustomMoveType, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { PlayerColor } from '../../PlayerColor'
import { CustomMoveType, MysticEffectType } from '../CustomMoveType'
import { AgeHelper } from '../helpers/AgeHelper'
import { Memory, UnitSavedWithMysticType } from '../Memory'
import { RuleId } from '../RuleId'

export class SaveUnitsWithMysticEffect extends SimultaneousRule {
  // Need to call this rule BEFORE age effect (conflict with palm reader for example)

  onRuleStart(): MaterialMove[] {
    const moves: MaterialMove[] = []
    const players = this.game.players
    players.forEach((player) => {
      const unitsToSave = this.getUnitToSave(player)

      if (!new AgeHelper(this.game, player).mysticalEffectsCount || !unitsToSave.length) {
        moves.push(this.endPlayerTurn(player))
      }
    })

    return moves
  }

  getUnitToSave(player: PlayerColor) {
    const ageHelper = new AgeHelper(this.game, player)
    const alreadySavedUnits = this.remind<number[]>(Memory.UnitSavedWithMystic, player)
    return ageHelper.units.filter((_, unitIndex) => ageHelper.howManyAgeTokenOnIndex(unitIndex) === 1 && !alreadySavedUnits.includes(unitIndex))
  }

  getActivePlayerLegalMoves(playerId: PlayerColor): MaterialMove[] {
    const moves: MaterialMove[] = []
    const unitsToSave = this.getUnitToSave(playerId)

    // unitsToSave is different of 0 thanks to the pre work in onRuleStart

    unitsToSave.getIndexes().forEach((unitIndex) => {
      moves.push(
        this.customMove(CustomMoveType.MysticEffect, {
          unitIndex: unitIndex,
          //unitId: item.id,
          player: playerId
        })
      )
    })

    return moves
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (!isCustomMoveType(CustomMoveType.MysticEffect)(move)) return []
    const data = move.data as MysticEffectType
    const player: PlayerColor = data.player
    const ageHelper = new AgeHelper(this.game, player)
    this.memorize(
      Memory.UnitSavedWithMystic,
      (indexes: number[] = []) => {
        indexes.push(data.unitIndex)
        return indexes
      },
      player
    )
    const unitsAlreadySaved = this.remind<UnitSavedWithMysticType>(Memory.UnitSavedWithMystic)
    this.memorize(Memory.UnitSavedWithMystic, unitsAlreadySaved, player)

    if (ageHelper.mysticalEffectsCount === unitsAlreadySaved.length + 1) {
      moves.push(this.endPlayerTurn(player))
    }

    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    return [this.startRule(RuleId.AgeUnitsDie)]
  }
}
