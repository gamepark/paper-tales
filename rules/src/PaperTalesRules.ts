import { hideItemId, hideItemIdToOthers, MaterialGame, MaterialMove, PositiveSequenceStrategy, SecretMaterialRules, TimeLimit } from '@gamepark/rules-api'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { Draft } from './rules/Draft'
import { RuleId } from './rules/RuleId'
import { Deal } from './rules/Deal'
import { GiveDraftToNeighbor } from './rules/GiveDraftToNeighbor'
import { PlaceUnitOnBoard } from './rules/PlaceUnitOnBoard'
import { RevealBoards } from './rules/RevealBoards'

export class PaperTalesRules extends SecretMaterialRules<PlayerColor, MaterialType, LocationType>
  implements TimeLimit<MaterialGame<PlayerColor, MaterialType, LocationType>, MaterialMove<PlayerColor, MaterialType, LocationType>, PlayerColor> {
  rules = {
    [RuleId.Draft]: Draft,
    [RuleId.Deal]: Deal,
    [RuleId.GiveDraftToNeighbor]: GiveDraftToNeighbor,
    [RuleId.PlaceUnitOnBoard]: PlaceUnitOnBoard,
    [RuleId.RevealBoards]: RevealBoards
  }

  locationsStrategies = {
    [MaterialType.Unit]:{
      [LocationType.Deck]: new PositiveSequenceStrategy(),
      [LocationType.Discard]: new PositiveSequenceStrategy(),
      [LocationType.PlayerDraftHand]: new PositiveSequenceStrategy(),
      [LocationType.PlayerUnitHand]: new PositiveSequenceStrategy(),
    }
  }

  hidingStrategies = {
    [MaterialType.Unit]:{
      [LocationType.Deck]:hideItemId,
      [LocationType.PlayerDraftHand]:hideItemIdToOthers,
      [LocationType.PlayerUnitHand]:hideItemIdToOthers,
      [LocationType.Discard]:hideItemId
    }
  }

  giveTime(): number {
    return 60
  }
}