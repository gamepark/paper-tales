import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, SimultaneousRule } from '@gamepark/rules-api'
import { Building } from '../../material/Building'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { PlayerColor } from '../../PlayerColor'
import { AgeHelper } from '../helpers/AgeHelper'
import { BuildHelper, getBuildAction } from '../helpers/BuildHelper'
import { RuleId } from '../RuleId'

export class Build extends SimultaneousRule {
  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []
    const buildHelper = new BuildHelper(this.game, playerId)

    // The upgrades to level 2
    moves.push(...buildHelper.upgradableBuildings.rotateItems(true))

    // The buildings of the hand, at level 1
    moves.push(
      ...buildHelper.buildableLevel1Buildings.moveItems({
        type: LocationType.PlayerBuildingBoard,
        player: playerId,
        rotation: false
      })
    )

    // The buildings of the hand, directly at level 2
    moves.push(
      ...buildHelper.buildableLevel2Buildings.moveItems({
        type: LocationType.PlayerBuildingBoard,
        player: playerId,
        rotation: true
      })
    )

    // Pass without building
    moves.push(this.endPlayerTurn(playerId))

    return moves
  }

  beforeItemMove(move: ItemMove, _context?: PlayMoveContext): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (isMoveItemType(MaterialType.Building)(move) && move.location.type === LocationType.PlayerBuildingBoard) {
      const player = move.location.player!
      const buildHelper = new BuildHelper(this.game, player)
      const building = this.material(MaterialType.Building).getItem<Building>(move.itemIndex)
      // All the gold at once (land, gold costs, replaced resources): several removals computed on the same purse would
      // take the same coins twice
      const gold = buildHelper.getGoldToPay(building.id, getBuildAction(building, move.location)) ?? 0
      if (gold > 0) {
        moves.push(...this.material(MaterialType.Gold).money(golds).removeMoney(gold, { type: LocationType.PlayerGoldStock, player }))
      }
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (isMoveItemType(MaterialType.Building)(move) && move.location.type === LocationType.PlayerBuildingBoard) {
      moves.push(this.endPlayerTurn(move.location.player!))
    }
    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    const playersWithMysticEffect = this.playersWithMysticEffect
    if (playersWithMysticEffect.length) {
      return [this.startSimultaneousRule(RuleId.SaveUnitsWithMysticEffect, playersWithMysticEffect)]
    } else {
      return [this.startRule(RuleId.AgeEffects)]
    }
  }

  get playersWithMysticEffect(): PlayerColor[] {
    return this.game.players.filter((player) => new AgeHelper(this.game, player).mysticalEffectsCount > 0)
  }
}
