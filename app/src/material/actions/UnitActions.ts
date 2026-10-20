import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { CustomMoveType, GainAgeTokenOnChosenUnitEffect, MysticEffectType, ReactivateUnitData } from '@gamepark/paper-tales/rules/CustomMoveType'
import { isCustomMoveType, isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { FC, SVGAttributes } from 'react'
import { AgeIcon, DiscardIcon, KeepIcon, ReactivateIcon, SaveIcon } from '../icons/PaperIcons'

/** What a player can do with one of their unit cards: the same moves, icons and words on the card and in its help */
export enum UnitAction {
  Keep = 1,
  Discard,
  Save,
  AddAge,
  Reactivate
}

export const unitActions = [UnitAction.Keep, UnitAction.Discard, UnitAction.Save, UnitAction.AddAge, UnitAction.Reactivate]

/**
 * The legal moves on the unit at this index, by action. The neighbours view is for looking at the war, not for
 * arranging my kingdom: no discard there.
 */
export const getUnitActions = (legalMoves: MaterialMove[], index: number, warView: boolean): Partial<Record<UnitAction, MaterialMove>> => ({
  [UnitAction.Keep]: legalMoves.find(
    (move) => isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.PlayerUnitHand && move.itemIndex === index
  ),
  [UnitAction.Discard]: warView
    ? undefined
    : legalMoves.find((move) => isMoveItemType(MaterialType.Unit)(move) && move.location.type === LocationType.Discard && move.itemIndex === index),
  [UnitAction.Save]: legalMoves.find(
    (move) => isCustomMoveType(CustomMoveType.MysticEffect)(move) && (move.data as MysticEffectType).unitIndex === index
  ),
  [UnitAction.AddAge]: legalMoves.find(
    (move) => isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move) && (move.data as GainAgeTokenOnChosenUnitEffect).unitIndex === index
  ),
  [UnitAction.Reactivate]: legalMoves.find(
    (move) => isCustomMoveType(CustomMoveType.ReactivateUnit)(move) && (move.data as ReactivateUnitData).unitIndex === index
  )
})

export const unitActionIcons: Record<UnitAction, FC<SVGAttributes<SVGSVGElement>>> = {
  [UnitAction.Keep]: KeepIcon,
  [UnitAction.Discard]: DiscardIcon,
  [UnitAction.Save]: SaveIcon,
  [UnitAction.AddAge]: AgeIcon,
  [UnitAction.Reactivate]: ReactivateIcon
}

/** The translation key and the English text of each action */
export const unitActionTexts: Record<UnitAction, [string, string]> = {
  [UnitAction.Keep]: ['move.keep', 'Keep'],
  [UnitAction.Discard]: ['move.discard', 'Discard'],
  [UnitAction.Save]: ['move.save', 'Save'],
  [UnitAction.AddAge]: ['move.add.age', 'Place the Age token'],
  [UnitAction.Reactivate]: ['move.reactivate', 'Apply again']
}
