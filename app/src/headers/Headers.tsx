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
import { WarHeader } from './WarHeader'
import { NextTurnHeader } from './NexturnHeader'
import { EndGameHeader } from './EndGameHeader'
import { AgeUnitsAgeHeader } from './AgeUnitsHeader'
import { AgeEffectsHeader } from './AgeEffectsHeader'
import { AgeUnitsDieHeader } from './AgeUnitsDieHeader'

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
  [RuleId.NextTurn]: NextTurnHeader, 
  [RuleId.EndGame]: EndGameHeader,
  [RuleId.AgeUnitsAge]: AgeUnitsAgeHeader,
  [RuleId.AgeEffects]: AgeEffectsHeader,
  [RuleId.AgeUnitsDie]: AgeUnitsDieHeader,



}