import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { Locator, PileLocator } from '@gamepark/react-game'
import { ageStockLocator } from './AgeStockLocator'
import { unitDeckLocator } from './DeckLocator'
import { discardLocator } from './DiscardLocator'
import { goldStockLocator } from './GoldStockLocator'
import { playerBuildingBoardLocator } from './PlayerBuildingBoardLocator'
import { playerBuildingHandLocator } from './PlayerBuildingHandLocator'
import { playerDraftHandLocator } from './PlayerDraftHandLocator'
import { playerGoldStockLocator } from './PlayerGoldStockLocator'
import { playerUnitBoardLocator } from './PlayerUnitBoardLocator'
import { playerUnitHandLocator } from './PlayerUnitHandLocator'
import { roundTokenLocator } from './RoundTokenLocator'
import { scoreBoardLocator } from './ScoreBoardLocator'
import { scoreTokenLocator } from './ScoreTokenLocator'
import { shieldLocator } from './ShieldLocator'


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
    [LocationType.ScoreBoard]: scoreBoardLocator,
    [LocationType.PlayerScore]: scoreTokenLocator,
    [LocationType.Time]: roundTokenLocator,
    [LocationType.OnCard]: new PileLocator({ parentItemType: MaterialType.Unit, radius: 1, positionOnParent: { x: 50, y: 40 } }),
    [LocationType.ShieldIcon]:shieldLocator







}

