/** @jsxImportSource @emotion/react */
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { ComponentType } from 'react'
import { PlayerTurnHeader } from './PlayerTurnHeader'
import { DraftHeader } from './DraftHeader'
import { BuildHeader } from './BuildHeader'
import { GiveDraftToNeighborHeader } from './GiveDraftToNeighborHeader'
import { RevealBoardsHeader } from './RevealBoardsHeader'
import { DealHeader } from './DealHeader'
import { PayDeployedUnitsHeader } from './PayDeployedUnitsHeader'
import { IncomeHeader } from './IncomeHeader'
import { AgeHeader } from './AgeHeader'

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.Deal]: DealHeader,
  [RuleId.Draft]: DraftHeader,
  [RuleId.GiveDraftToNeighbor]: GiveDraftToNeighborHeader,
  [RuleId.PlaceUnitOnBoard]: PlayerTurnHeader,
  [RuleId.RevealBoards]: RevealBoardsHeader,
  [RuleId.PayDeployedUnits]: PayDeployedUnitsHeader,
  [RuleId.War]: WarHeader,
  [RuleId.Income]: IncomeHeader,
  [RuleId.Build]: BuildHeader,
  [RuleId.Age]: AgeHeader, 



}