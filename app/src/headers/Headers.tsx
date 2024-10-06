/** @jsxImportSource @emotion/react */
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { ComponentType } from 'react'
import { PlayerTurnHeader } from './PlayerTurnHeader'
import { DraftHeader } from './DraftHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.Draft]: DraftHeader,
  [RuleId.PlaceUnitOnBoard]: PlayerTurnHeader
}