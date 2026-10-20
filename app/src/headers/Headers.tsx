import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { ComponentType } from 'react'
import { PlaceUnitOnBoardHeader } from './PlaceUnitOnBoardHeader'
import { DraftHeader } from './DraftHeader'
import { BuildHeader } from './BuildHeader'
import { GiveDraftToNeighborHeader } from './GiveDraftToNeighborHeader'
import { RevealBoardsHeader } from './RevealBoardsHeader'
import { DealHeader } from './DealHeader'
import { PayDeployedUnitsHeader } from './PayDeployedUnitsHeader'
import { DeployEffectsHeader } from './DeployEffectsHeader'
import { IncomeHeader } from './IncomeHeader'
import { WarHeader } from './WarHeader'
import { withPhaseIcon } from './withPhaseIcon'
import { AgeEffectsHeader, AgeUnitsAgeHeader, AgeUnitsDieHeader, EndGameHeader, NextTurnHeader, SaveUnitsWithMysticEffectHeader } from './AgeHeaders'

const headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.Deal]: DealHeader,
  [RuleId.Draft]: DraftHeader,
  [RuleId.GiveDraftToNeighbor]: GiveDraftToNeighborHeader,
  [RuleId.PlaceUnitOnBoard]: PlaceUnitOnBoardHeader,
  [RuleId.RevealBoards]: RevealBoardsHeader,
  [RuleId.PayDeployedUnits]: PayDeployedUnitsHeader,
  [RuleId.DeployEffects]: DeployEffectsHeader,
  [RuleId.War]: WarHeader,
  [RuleId.Income]: IncomeHeader,
  [RuleId.Build]: BuildHeader,
  [RuleId.NextTurn]: NextTurnHeader,
  [RuleId.EndGame]: EndGameHeader,
  [RuleId.AgeUnitsAge]: AgeUnitsAgeHeader,
  [RuleId.AgeEffects]: AgeEffectsHeader,
  [RuleId.AgeUnitsDie]: AgeUnitsDieHeader,
  [RuleId.SaveUnitsWithMysticEffect]: SaveUnitsWithMysticEffectHeader
}

/** Every header begins with the icon of its phase */
export const Headers: Partial<Record<RuleId, ComponentType>> = Object.fromEntries(
  Object.entries(headers).map(([rule, Header]) => [rule, withPhaseIcon(Header)])
)
