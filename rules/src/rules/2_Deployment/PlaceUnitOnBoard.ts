import { isMoveItemType, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from '@gamepark/rules-api'
import sumBy from 'lodash/sumBy'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { unitCardCaracteristics } from '../../material/UnitCaracteristics'
import { PlayerColor } from '../../PlayerColor'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { DiscardRemainingUnits } from './DiscardRemainingUnits'

export class PlaceUnitOnBoard extends SimultaneousRule {
  onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove[] {
    this.game.players.forEach((player) => {
      this.memorize(Memory.PlayedCardsDuringDeployment, [], player)
    })
    return []
  }

  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves = []

    const placedIndexes: number[] = this.remind(Memory.PlayedCardsDuringDeployment, playerId)
    const remainingSpaces = this.getRemainingSpaces(playerId)
    const playerGold = this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId).money(golds).count
    const placedUnits = this.material(MaterialType.Unit).index(placedIndexes).getItems<Unit>()
    const goldAlreadySpent = sumBy(placedUnits, (unit) => unitCardCaracteristics[unit.id].cost)
    const goldToSpend = playerGold - goldAlreadySpent
    const playerHand = this.getPlayerHand(playerId)
    const playerHandPlayable = playerHand.filter((item) => unitCardCaracteristics[item.id as Unit].cost <= goldToSpend)
    const playerUnitsAlreadyPlayed = this.material(MaterialType.Unit)
      .location(LocationType.PlayerUnitBoard)
      .player(playerId)
      .index((index) => !placedIndexes.includes(index))

    moves.push(
      ...remainingSpaces.flatMap((space) => {
        return [
          ...playerHandPlayable.moveItems({
            type: LocationType.PlayerUnitBoard,
            player: playerId,
            x: space.x,
            y: space.y,
            rotation: true
          })
        ]
      })
    )

    moves.push(
      ...remainingSpaces.flatMap((space) => {
        return [
          ...playerUnitsAlreadyPlayed.moveItems({
            type: LocationType.PlayerUnitBoard,
            player: playerId,
            x: space.x,
            y: space.y,
            rotation: false
          })
        ]
      })
    )

    moves.push(
      ...playerUnitsAlreadyPlayed.moveItems({
        type: LocationType.Discard
      })
    )

    const discardAndEndMoves = new DiscardRemainingUnits(this.game).getActivePlayerLegalMoves(playerId)
    moves.push(...discardAndEndMoves)

    return moves
  }

  beforeItemMove(move: ItemMove): MaterialMove[] {
    const moves: MaterialMove[] = []

    if (isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.Discard) {
      const ageTokens = this.material(MaterialType.Age).location(LocationType.OnCard).parent(move.itemIndex)
      moves.push(...ageTokens.deleteItems())
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    const moves: MaterialMove[] = []

    if (isMoveItemType(MaterialType.Unit)(move)) {
      if (move.location.type === LocationType.PlayerUnitBoard && move.location.rotation === true) {
        const cardsPlayedIndexes: number[] = this.remind(Memory.PlayedCardsDuringDeployment, move.location.player)
        cardsPlayedIndexes.push(move.itemIndex)
        this.memorize(Memory.PlayedCardsDuringDeployment, cardsPlayedIndexes, move.location.player)
      }
    }

    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    return [this.startRule(RuleId.RevealBoards)]
  }

  getPlayerHand(playerId: PlayerColor) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
  }

  getPlayerBoard(playerId: PlayerColor) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
  }

  getBoardSpaces(playerId: PlayerColor) {
    const hasLevel2Building = this.hasLevel2Building(playerId)
    const board = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 }
    ]
    if (hasLevel2Building) board.push({ x: 2, y: 0 })
    return board
  }

  hasLevel2Building(playerId: number): boolean {
    return this.material(MaterialType.Building).location(LocationType.PlayerBuildingBoard).player(playerId).rotation(true).length > 0
  }

  getRemainingSpaces(playerId: number) {
    return this.getBoardSpaces(playerId).filter(
      (space) =>
        this.getPlayerBoard(playerId)
          .getItems()
          .find((item) => item.location.x === space.x && item.location.y === space.y) === undefined
    )
  }
}
