/** @jsxImportSource @emotion/react */
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { ComponentType } from 'react'
import { PlayerTurnHeader } from './PlayerTurnHeader'
import { DraftHeader } from './DraftHeader'
import { BuildHeader } from './BuildHeader'
import { GiveDraftToNeighborHeader } from './GiveDraftToNeighborHeader'
import { RevealBoardsHeader } from './RevealBoardsHeader'
import { DealHeader } from './DealHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.Draft]: DraftHeader,
  [RuleId.GiveDraftToNeighbor]: GiveDraftToNeighborHeader,
  [RuleId.PlaceUnitOnBoard]: PlayerTurnHeader,
  [RuleId.Build]: BuildHeader,
  [RuleId.RevealBoards]: RevealBoardsHeader,
  [RuleId.Deal]: DealHeader,
}