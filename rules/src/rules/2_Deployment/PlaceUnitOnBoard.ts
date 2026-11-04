import { isMoveItemType, isMoveItemTypeAtOnce, ItemMove, MaterialMove, PlayMoveContext, RuleMove, RuleStep, SimultaneousRule } from '@gamepark/rules-api'
import { isEqual, omit } from 'es-toolkit/compat'
import { Card, isArtifact, isUnit } from '../../material/Artifact'
import { golds } from '../../material/Gold'
import { LocationType } from '../../material/LocationType'
import { MaterialType } from '../../material/MaterialType'
import { Unit } from '../../material/Unit'
import { PlayerColor } from '../../PlayerColor'
import { Memory } from '../Memory'
import { RuleId } from '../RuleId'
import { AgeTokens } from '../helpers/AgeTokens'
import { DeployCostHelper } from '../helpers/DeployCostHelper'
import { KingdomHelper } from '../helpers/KingdomHelper'

export class PlaceUnitOnBoard extends SimultaneousRule {
  onRuleStart(_move: RuleMove<number, RuleId>, _previousRule?: RuleStep, _context?: PlayMoveContext): MaterialMove[] {
    this.game.players.forEach((player) => {
      this.memorize(Memory.PlayedCardsDuringDeployment, [], player)
    })
    // The last card of the recruitment, still on its way, joins the hand of its receiver, then the hand is shuffled (see
    // afterItemMove). Once the recruitment is over, the place of a card in a hand is seen by all and follows the order of
    // the picks: a Monarch who passed a hand could follow the cards they left to their neighbour.
    return this.game.players.flatMap((player) => {
      const coming = this.material(MaterialType.Unit).location(LocationType.DraftTransit).player(player)
      if (coming.length) return [coming.moveItemsAtOnce({ type: LocationType.PlayerUnitHand, player })]
      return this.shuffleHand(player)
    })
  }

  private shuffleHand(player: number): MaterialMove[] {
    const hand = this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(player)
    return hand.length > 1 ? [hand.shuffle()] : []
  }

  getActivePlayerLegalMoves(playerId: number): MaterialMove[] {
    const moves = []

    const playerGold = this.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(playerId).money(golds).count
    const costs = new DeployCostHelper(this.game, playerId)
    const goldToSpend = playerGold - costs.placedCost
    // A card that cannot be paid would be discarded (rulebook p.5): it is not laid
    const playerHand = this.getPlayerHand(playerId)
    // The hand of another Monarch is hidden: its cards are not known, nothing is offered
    const playerHandPlayable = playerHand.filter<Card>((item) => item.id !== undefined && costs.costOf(item.id) <= goldToSpend)
    const playerUnitsAlreadyPlayed = this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)

    const boardSpaces = new KingdomHelper(this.game, playerId).boardSpaces
    // A unit of the hand goes on any space of the kingdom: on an empty one, or on a unit, which then leaves (see
    // beforeItemMove)
    moves.push(
      ...boardSpaces.flatMap((space) => {
        return [
          ...playerHandPlayable.filter<Card>((item) => isUnit(item.id)).moveItems({
            type: LocationType.PlayerUnitBoard,
            player: playerId,
            x: space.x,
            y: space.y,
            rotation: true
          })
        ]
      })
    )

    // A unit in play goes on any other space of the kingdom
    moves.push(
      ...boardSpaces.flatMap((space) => {
        return [
          ...playerUnitsAlreadyPlayed.filter((item) => item.location.x !== space.x || item.location.y !== space.y).moveItems((item) => ({
            type: LocationType.PlayerUnitBoard,
            player: playerId,
            x: space.x,
            y: space.y,
            rotation: item.location.rotation
          }))
        ]
      })
    )

    moves.push(
      ...playerUnitsAlreadyPlayed.moveItems({
        type: LocationType.Discard
      })
    )

    // A Legendary Artifact goes apart from the units, face down, without limit (rulebook p.11). One in play is never
    // discarded
    moves.push(
      ...playerHandPlayable.filter<Card>((item) => isArtifact(item.id)).moveItems({ type: LocationType.PlayerArtifacts, player: playerId, rotation: true })
    )

    // A card laid this turn, still face down, goes back to the hand: a unit of an earlier turn stays in the kingdom
    const justDeployed = this.getCardJustDeployed(playerId)
    moves.push(
      ...this.material(MaterialType.Unit)
        .index((index) => justDeployed.includes(index))
        .location((location) => location.type === LocationType.PlayerUnitBoard || location.type === LocationType.PlayerArtifacts)
        .player(playerId)
        .moveItems({ type: LocationType.PlayerUnitHand, player: playerId })
    )

    moves.push(...playerHand.moveItems({ type: LocationType.Discard }))
    // The deployment ends only when the cards laid can be paid (none is laid that cannot be, see keepsPaid)
    if (playerHand.length <= 1 && costs.placedCost <= playerGold) moves.push(this.endPlayerTurn(playerId))

    return moves.filter((move) => this.keepsPaid(playerId, move, playerGold))
  }

  /**
   * The cards laid this turn must stay payable (rulebook p.5: a card that cannot be paid is discarded, so it is not laid).
   * A card of negative cost pays for others: taking it back to the hand, discarding it or laying a unit on its space
   * (it goes back to the hand) would leave them unpaid, so it is not offered.
   */
  private keepsPaid(player: number, move: MaterialMove, gold: number): boolean {
    if (!isMoveItemType(MaterialType.Unit)(move)) return true
    const costs = new DeployCostHelper(this.game, player)
    const item = this.material(MaterialType.Unit).getItem(move.itemIndex)
    let placed = costs.placedIndexes.filter((index) => index !== move.itemIndex)
    if (item.location.type === LocationType.PlayerUnitHand) {
      if (move.location.type !== LocationType.PlayerUnitBoard && move.location.type !== LocationType.PlayerArtifacts) return true
      placed = [...placed, move.itemIndex]
      // The unit laid this turn on the space goes back to the hand
      if (move.location.type === LocationType.PlayerUnitBoard) {
        const onSpace = this.getPlayerBoard(player).filter((unit) => unit.location.x === move.location.x && unit.location.y === move.location.y).getIndexes()
        placed = placed.filter((index) => !onSpace.includes(index))
      }
    } else if (move.location.type !== LocationType.PlayerUnitHand && move.location.type !== LocationType.Discard) {
      return true
    }
    return costs.costOfIndexes(placed) <= gold
  }

  getCardJustDeployed(playerId: number): number[] {
    return this.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, playerId) ?? []
  }

  removeCardFromDeployment(playerId: number, cardIndex: number) {
    this.memorize(Memory.PlayedCardsDuringDeployment, (cards: number[] = []) => cards.filter((c) => c !== cardIndex), playerId)
  }

  beforeItemMove(move: ItemMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    if (!isMoveItemType(MaterialType.Unit)(move)) return []

    // The card a Monarch chose with its button (a selection of their screen only, nothing the framework clears) has moved
    delete this.material(MaterialType.Unit).getItem(move.itemIndex).selected

    // Taken back to the hand: it no longer counts among the cards deployed this turn
    if (move.location.type === LocationType.PlayerUnitHand) {
      this.removeCardFromDeployment(move.location.player!, move.itemIndex)
    }

    if (move.location.type === LocationType.Discard) {
      const card = this.material(MaterialType.Unit).getItem<Unit>(move.itemIndex)
      this.removeCardFromDeployment(card.location.player!, move.itemIndex)
      moves.push(...new AgeTokens(this).remove(move.itemIndex))
    }

    if (move.location.type === LocationType.PlayerUnitBoard) {
      const location = omit(move.location, 'rotation')
      const cardOnPlace = this.material(MaterialType.Unit)
        .index((i) => i !== move.itemIndex)
        .location((l) => {
          return isEqual(location, omit(l, 'rotation'))
        })
      const movedCard = this.material(MaterialType.Unit).getItem<Unit>(move.itemIndex)
      if (cardOnPlace.length && movedCard.location.type === LocationType.PlayerUnitHand) {
        // A unit of the hand laid on a space taken: the unit placed there this turn goes back to the hand, an older unit
        // is discarded, its Age tokens going back to the reserve first (the card laid stays where it was dropped meanwhile,
        // then takes the space)
        const player = movedCard.location.player!
        const justPlaced = this.getCardJustDeployed(player).includes(cardOnPlace.getIndex())
        if (justPlaced) {
          this.removeCardFromDeployment(player, cardOnPlace.getIndex())
          moves.push(cardOnPlace.moveItem({ type: LocationType.PlayerUnitHand, player }))
        } else {
          moves.push(...new AgeTokens(this).remove(cardOnPlace.getIndex()))
          moves.push(cardOnPlace.moveItem({ type: LocationType.Discard }))
        }
      } else if (cardOnPlace.length) {
        moves.push(cardOnPlace.moveItem((item) => ({ ...movedCard.location, rotation: item.location.rotation })))
      }
    }

    return moves
  }

  afterItemMove(move: ItemMove): MaterialMove[] {
    const moves: MaterialMove[] = []
    // The last card of the recruitment has joined the hand: it is shuffled
    if (isMoveItemTypeAtOnce(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitHand) return this.shuffleHand(move.location.player!)

    if (isMoveItemType(MaterialType.Unit)(move)) {
      if ((move.location.type === LocationType.PlayerUnitBoard || move.location.type === LocationType.PlayerArtifacts) && move.location.rotation === true) {
        // A card laid this turn may move again, still face down: it counts once
        this.memorize(Memory.PlayedCardsDuringDeployment, (cards: number[] = []) => (cards.includes(move.itemIndex) ? cards : [...cards, move.itemIndex]), move.location.player)
      }
    }

    return moves
  }

  getMovesAfterPlayersDone(): MaterialMove[] {
    return [this.startRule(RuleId.RevealBoards)]
  }

  private getPlayerHand(playerId: PlayerColor) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(playerId)
  }

  private getPlayerBoard(playerId: PlayerColor) {
    return this.material(MaterialType.Unit).location(LocationType.PlayerUnitBoard).player(playerId)
  }

}
