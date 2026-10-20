import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator } from '@gamepark/react-game'
import { ageStockLocator } from './AgeStockLocator'
import { unitDeckLocator } from './DeckLocator'
import { discardLocator } from './DiscardLocator'
import { draftTransitLocator } from './DraftPassingLocators'
import { onCardLocator } from './OnCardLocator'
import { goldStockLocator } from './GoldStockLocator'
import { playerArtifactsLocator } from './PlayerArtifactsLocator'
import { playerBuildingBoardLocator } from './PlayerBuildingBoardLocator'
import { playerBuildingHandLocator } from './PlayerBuildingHandLocator'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'
import { playerGoldStockLocator } from './PlayerGoldStockLocator'
import { playerUnitBoardLocator } from './PlayerUnitBoardLocator'
import { playerUnitHandLocator } from './PlayerUnitHandLocator'
import { scoreBoardLocator } from './ScoreBoardLocator'
import { scoreTokenLocator } from './ScoreTokenLocator'
import { shieldLocator } from './ShieldLocator'
import { buildingVeilLocator, unitVeilLocator } from './VeilLocators'

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {
  [LocationType.Deck]: unitDeckLocator,
  [LocationType.GoldStock]: goldStockLocator,
  [LocationType.Discard]: discardLocator,
  [LocationType.PlayerDraftHand]: playerDraftHandLocator,
  [LocationType.AgeStock]: ageStockLocator,
  [LocationType.PlayerUnitHand]: playerUnitHandLocator,
  [LocationType.PlayerGoldStock]: playerGoldStockLocator,
  [LocationType.PlayerBuildingBoard]: playerBuildingBoardLocator,
  [LocationType.PlayerBuildingHand]: playerBuildingHandLocator,
  [LocationType.PlayerUnitBoard]: playerUnitBoardLocator,
  [LocationType.PlayerArtifacts]: playerArtifactsLocator,
  [LocationType.ScoreBoard]: scoreBoardLocator,
  [LocationType.PlayerScore]: scoreTokenLocator,
  [LocationType.OnCard]: onCardLocator,
  [LocationType.ShieldIcon]: shieldLocator,
  [LocationType.DraftTransit]: draftTransitLocator,
  [LocationType.UnitVeil]: unitVeilLocator,
  [LocationType.BuildingVeil]: buildingVeilLocator
}
