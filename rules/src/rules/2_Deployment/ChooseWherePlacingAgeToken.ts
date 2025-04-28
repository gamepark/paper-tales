import { CustomMove, MaterialMove, SimultaneousRule } from '@gamepark/rules-api'
import { GainAgeTokenOnChosenUnit, isGainAgeTokenOnChosenUnit } from '../../material/effects/2_DeploymentEffects'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { CustomMoveType } from '../CustomMoveType'
import { ResourcesHelper } from '../helpers/ResourcesHelper'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'

export class ChooseWherePlacingAgeToken extends SimultaneousRule {

  getActivePlayerLegalMoves(playerId: number): MaterialMove<number, number, number>[] {

    const moves: MaterialMove[] = []

    const playerBoardUnit = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)

    playerBoardUnit.getIndexes().forEach(index => {
      moves.push(this.customMove(
        CustomMoveType.GainAgeTokenOnChosenUnitEffect,
        { unitIndex: index, player: playerId }))
    })
    return moves

  }

  onCustomMove(move: CustomMove): MaterialMove[] {

    const moves: MaterialMove[] = []
    if (move.type === CustomMoveType.GainAgeTokenOnChosenUnitEffect) {
      const chosenUnitIndex = move.data.unitIndex
      const indexesFirstItem: number = this.remind(Memory.PlacingAgeTokenUnitsIndexes, move.data.player)[0]
      const unitIdWithAgingEffect: number = this.material(MaterialType.Unit).filter((_item, index) => index === indexesFirstItem).getItem()!.id

      const unitEffect: GainAgeTokenOnChosenUnit = unitCardCaracteristics[unitIdWithAgingEffect].effect.find(isGainAgeTokenOnChosenUnit)
      const resourcesHelper = new ResourcesHelper(this.game, move.data.player)

      const quantityOfAgeTokens: number = unitEffect.perResource === undefined ? unitEffect.amount : unitEffect.amount * resourcesHelper.getPlayerResources(move.data.player).filter(res => res === unitEffect.perResource!).length

      // Ajout des jetons
      moves.push(
        this
          .material(MaterialType.Age)
          .createItem({
            location: {
              type: LocationType.OnCard,
              parent: chosenUnitIndex
            },
            quantity: quantityOfAgeTokens
          })
      )

      // MaJ des effets à traiter
      if (!this.remainsPlaceAgeToken(move.data.player)) {
        moves.push(this.endPlayerTurn(move.data.player))
      }

    }

    return moves

  }

  remainsPlaceAgeToken(player: PlayerColor): boolean {
    this.memorize(Memory.PlacingAgeTokenUnitsIndexes, (indexes: number[]) => {
      indexes.shift()
      return indexes
    }, player)
    return this.remind(Memory.PlacingAgeTokenUnitsIndexes, player)?.length > 0
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    this.game.players.forEach(player => this.forget(Memory.PlacingAgeTokenUnitsIndexes, player))
    return [this.startRule(RuleId.War)]
  }

}
