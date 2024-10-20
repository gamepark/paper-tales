import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator } from '@gamepark/react-game'
import { UnitDeckLocator } from './DeckLocator'
import { goldStockLocator } from './GoldStockLocator'
import { DiscardLocator } from './DiscardLocator'
import { PlayerDraftHandLocator } from './PlayerDraftHandLocator'
import { ageStockLocator } from './AgeStockLocator'
import { PlayerUnitHandLocator } from './PlayerUnitHandLocator'
import { playerGoldStockLocator } from './PlayerGoldStockLocator'
import { PlayerBuildingBoardLocator } from './PlayerBuildingBoardLocator'
import { PlayerBuildingHandLocator } from './PlayerBuildingHandLocator'
import { playerUnitBoard } from './PlayerUnitBoard'
import { scoreBoard } from './ScoreBoard'

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {

    [LocationType.Deck]: new UnitDeckLocator(),
    [LocationType.GoldStock]: goldStockLocator,
    [LocationType.Discard]: new DiscardLocator(),
    [LocationType.PlayerDraftHand]: new PlayerDraftHandLocator(),
    [LocationType.AgeStock]: ageStockLocator,
    [LocationType.PlayerUnitHand]: new PlayerUnitHandLocator(),
    [LocationType.PlayerGoldStock]: playerGoldStockLocator,
    [LocationType.PlayerBuildingBoard]: new PlayerBuildingBoardLocator(),
    [LocationType.PlayerBuildingHand]: new PlayerBuildingHandLocator(),
    [LocationType.PlayerUnitBoard] : playerUnitBoard,
    [LocationType.Score]: scoreBoard,


    


}

