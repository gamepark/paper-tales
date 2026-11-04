import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialContext } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove, MoveItem } from '@gamepark/rules-api'

/**
 * Placing a card with buttons, for those who do not drag it: the button of a card chooses it (the card is selected, a
 * transient move only this screen knows), then the buttons of the places lay it there, by the same moves as a drop.
 */

/** During the deployment, the card chosen to be placed */
export const getSelectedUnit = (context: MaterialContext): number | undefined => {
  if (context.rules.game.rule?.id !== RuleId.PlaceUnitOnBoard) return undefined
  return context.rules.material(MaterialType.Unit).selected().getIndexes()[0]
}

/** The moves that lay this card on another place of the kingdom */
export const getPlaceMoves = (legalMoves: MaterialMove[], index: number, item?: MaterialItem): MoveItem[] =>
  legalMoves
    .filter(isMoveItemType(MaterialType.Unit))
    .filter(
      (move) =>
        move.itemIndex === index &&
        move.location.type === LocationType.PlayerUnitBoard &&
        !(item?.location.type === LocationType.PlayerUnitBoard && item.location.x === move.location.x && item.location.y === move.location.y)
    )

/** The move that lays the chosen card on this place */
export const getPlaceMoveTo = (legalMoves: MaterialMove[], selected: number, x?: number, y?: number) =>
  getPlaceMoves(legalMoves, selected).find((move) => move.location.x === x && move.location.y === y)

export const selectToPlace = (context: MaterialContext, index: number) => context.rules.material(MaterialType.Unit).index(index).selectItem()

export const unselectToPlace = (context: MaterialContext) => context.rules.material(MaterialType.Unit).selected().unselectItems()
