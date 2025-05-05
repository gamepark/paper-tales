import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from '@gamepark/rules-api'
import { Building } from '../../material/Building'
import { isMysticEffect } from '../../material/effects/6_AgeEffects'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { AgeHelper } from '../helpers/AgeHelper'
import { BuildHelper } from '../helpers/BuildHelper'
import { RuleId } from '../RuleId'

export class Build extends SimultaneousRule {
  onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove[] {
    return []
  }

  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves: MaterialMove[] = []
    const buildHelper = new BuildHelper(this.game, playerId)
    const fieldCost = buildHelper.hasIgnoreFieldCostEffect(playerId) ? 0 : buildHelper.getFieldCost(playerId)

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
        ...buildHelper.buildLevel2Buildings.moveItems({
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
      const buildHelper = new BuildHelper(this.game, move.location.player!)
      const fieldCost = buildHelper.hasIgnoreFieldCostEffect(move.location.player!) ? 0 : buildHelper.getFieldCost(move.location.player!)
      const building = this.material(MaterialType.Building).getItem<Building>(move.itemIndex)
      const buildingId = this.material(MaterialType.Building)
        .index((index) => index === move.itemIndex)
        .getItem<Building>()!.id

      const cameFromHand = building.location.type === LocationType.PlayerBuildingHand && building.location.player === move.location.player

      const goldMoney = this.material(MaterialType.Gold).money(golds)
      // Vient de la main --> Cout de terrain
      if (cameFromHand) {
        if (fieldCost > 0) {
          moves.push(
            ...goldMoney.removeMoney(buildHelper.fieldCost, {
              type: LocationType.PlayerGoldStock,
              player: move.location.player!
            })
          )
        }
      }

      // Comment s'assurer que le joueur paye de l'or s'il le doit ?
      // Cas facile : niveau 1, ça vient forcément de sa main
      if (move.location.rotation === false) {
        const goldToPayMove = buildHelper.getGoldToPayCostMove(buildingId, 1, true)
        if (goldToPayMove.length) moves.push(...goldToPayMove)
      } else {
        // Cas difficile : comment distinguer un build direct lvl 2 ou juste un passage lvl1 à lvl2 ?
        // On suppose qu'on peut le faire avant le material move, à vérifier en test

        if (cameFromHand) {
          // On doit checker les deux coûts
          const goldToPayMove1 = buildHelper.getGoldToPayCostMove(buildingId, 1, true)
          const goldToPayMove2 = buildHelper.getGoldToPayCostMove(buildingId, 2, true)
          if (goldToPayMove1.length) moves.push(...goldToPayMove1)
          if (goldToPayMove2.length) moves.push(...goldToPayMove2)
        } else {
          // On en check que le cout lvl 2
          const goldToPayMove = buildHelper.getGoldToPayCostMove(buildingId, 2, true)
          if (goldToPayMove.length) moves.push(...goldToPayMove)
        }
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
    if (this.hasMysticEffect) {
      return [this.startSimultaneousRule(RuleId.SaveUnitsWithMysticEffect)]
    } else {
      return [this.startRule(RuleId.AgeEffects)]
    }
  }

  get hasMysticEffect(): boolean {
    return this.game.players.some((p) => {
      const ageHelper = new AgeHelper(this.game, p)
      return ageHelper.unitsWithAgeEffects
        .getItems<Unit>()
        .flatMap((unit) => ageHelper.getUnitAgeEffects(unit))
        .some((effect) => isMysticEffect(effect))
    })
  }
}
