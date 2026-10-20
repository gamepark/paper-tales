import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from '@gamepark/rules-api'
import { Building } from '../../material/Building'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { PlayerColor } from '../../PlayerColor'
import { AgeHelper } from '../helpers/AgeHelper'
import { BuildAction, BuildHelper } from '../helpers/BuildHelper'
import { RuleId } from '../RuleId'

export class Build extends SimultaneousRule {
  onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove[] {
    return []
  }

  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []
    const buildHelper = new BuildHelper(this.game, playerId)
    const fieldCost = buildHelper.fieldCost

    // Passages aux niveaux 2
    moves.push(...buildHelper.upgradableBuildings.rotateItems(true))

    // Achats à partir de rien

    if (buildHelper.gold >= fieldCost) {
      // Achats au niveau 1
      moves.push(
        ...buildHelper.buildableLevel1Buildings.moveItems({
          type: LocationType.PlayerBuildingBoard,
          player: playerId,
          rotation: false
        })
      )

      // Achats au niveau 2
      moves.push(
        ...buildHelper.buildableLevel2Buildings.moveItems({
          type: LocationType.PlayerBuildingBoard,
          player: playerId,
          rotation: true
        })
      )
    }

    // Passer sans construire
    moves.push(this.endPlayerTurn(playerId))

    //console.log("LegalMoves : ", moves)

    return moves
  }

  beforeItemMove(move: ItemMove, _context?: PlayMoveContext): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (isMoveItemType(MaterialType.Building)(move) && move.location.type === LocationType.PlayerBuildingBoard) {
      const player = move.location.player!
      const buildHelper = new BuildHelper(this.game, player)
      const building = this.material(MaterialType.Building).getItem<Building>(move.itemIndex)
      const cameFromHand = building.location.type === LocationType.PlayerBuildingHand
      const action = !cameFromHand ? BuildAction.Upgrade : move.location.rotation ? BuildAction.BuildLevel2 : BuildAction.BuildLevel1
      // All the gold at once (land, gold costs, replaced resources): several removals computed on the same purse would
      // take the same coins twice
      const gold = buildHelper.getGoldToPay(building.id, action) ?? 0
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
