import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator } from '@gamepark/react-game'
import { UnitDeckLocator } from './DeckLocator'
import { GoldStockLocator } from './GoldStockLocator'
import { DiscardLocator } from './DiscardLocator'
import { PlayerDraftHandLocator } from './PlayerDraftHandLocator'
import { AgeStockLocator } from './AgeStockLocator'
import { PlayerUnitHandLocator } from './PlayerUnitHandLocator'
import { playerGoldStockLocator } from './PlayerGoldStockLocator'

export const Locators: Partial<Record<LocationType, Locator<PlayerColor, MaterialType, LocationType>>> = {

    [LocationType.Deck]: new UnitDeckLocator(),
    [LocationType.GoldStock]: new GoldStockLocator(),
    [LocationType.Discard]: new DiscardLocator(),
    [LocationType.PlayerDraftHand]: new PlayerDraftHandLocator(),
    [LocationType.AgeStock]: new AgeStockLocator(),
    [LocationType.PlayerUnitHand]: new PlayerUnitHandLocator(),
    [LocationType.PlayerGoldStock]: playerGoldStockLocator,

    


}

