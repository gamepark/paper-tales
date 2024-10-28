import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator } from '@gamepark/react-game'
import { unitDeckLocator } from './DeckLocator'
import { goldStockLocator } from './GoldStockLocator'
import { discardLocator } from './DiscardLocator'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'
import { ageStockLocator } from './AgeStockLocator'
import { playerUnitHandLocator } from './PlayerUnitHandLocator'
import { playerGoldStockLocator } from './PlayerGoldStockLocator'
import { playerBuldingBoard } from './PlayerBuildingBoardLocator'
import { playerBuildingHandLocator } from './PlayerBuildingHandLocator'
import { playerUnitBoard } from './PlayerUnitBoard'
import { scoreBoardLocator } from './ScoreBoardLocator'
import { scoreTokenLocator } from './ScoreTokenLocator'

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {

    [LocationType.Deck]: unitDeckLocator,
    [LocationType.GoldStock]: goldStockLocator,
    [LocationType.Discard]: discardLocator,
    [LocationType.PlayerDraftHand]: playerDraftHandLocator,
    [LocationType.AgeStock]: ageStockLocator,
    [LocationType.PlayerUnitHand]: playerUnitHandLocator,
    [LocationType.PlayerGoldStock]: playerGoldStockLocator,
    [LocationType.PlayerBuildingBoard]: playerBuldingBoard,
    [LocationType.PlayerBuildingHand]: playerBuildingHandLocator,
    [LocationType.PlayerUnitBoard]: playerUnitBoard,
    [LocationType.Score]: scoreBoardLocator,
    [LocationType.Pawn]: scoreTokenLocator,






}

