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
    // Only the Monarchs this rule started for: ending the turn of the others would end it in the rules that follow (the
    // last active Monarch done, the Age goes on to the next turn, and a late "end of turn" would skip a draft pick)
    const players = this.game.players.filter((player) => this.isTurnToPlay(player))
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
    const alreadySavedUnits = this.remind<number[] | undefined>(Memory.UnitSavedWithMystic, player) ?? []
    return ageHelper.units.filter((_, unitIndex) => ageHelper.howManyAgeTokenOnIndex(unitIndex) === 1 && !alreadySavedUnits.includes(unitIndex))
  }

  getActivePlayerLegalMoves(playerId: PlayerColor): MaterialMove[] {
    const moves: MaterialMove[] = []
    const unitsToSave = this.getUnitToSave(playerId)


    unitsToSave.getIndexes().forEach((unitIndex) => {
      moves.push(
        this.customMove(CustomMoveType.MysticEffect, {
          unitIndex: unitIndex,
          player: playerId
        })
      )
    })

    // The card says "you may": the Monarch can also save nobody
    moves.push(this.customMove(CustomMoveType.SaveNobody, playerId))

    return moves
  }

  onCustomMove(move: CustomMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (isCustomMoveType(CustomMoveType.SaveNobody)(move)) return [this.endPlayerTurn(move.data as PlayerColor)]
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

    const unitsAlreadySaved = this.remind<UnitSavedWithMysticType>(Memory.UnitSavedWithMystic, player)

    if (ageHelper.mysticalEffectsCount <= unitsAlreadySaved.length) {
      moves.push(this.endPlayerTurn(player))
    }

    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    // The saves are chosen before the Age: then the Age goes on with its effects, then the deaths
    return [this.startRule(RuleId.AgeEffects)]
  }
}
