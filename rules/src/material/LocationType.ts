export enum LocationType {
  PlayerUnitHand = 1,
  PlayerDraftHand,
  PlayerUnitBoard,
  PlayerBuildingHand,
  PlayerBuildingBoard,
  PlayerGoldStock,
  PlayerAidCard,
  PlayerScore,
  AgeStock,
  GoldStock,
  Discard,
  Deck,
  Time,
  ScoreBoard,
  OnCard,
  CardBoardRotate,
  CardHandRotate,
  Building,
  ShieldIcon,
  /** A hand passed during the recruitment, on its way to the Monarch who receives it (player), face down for all */
  DraftTransit,
  /** A hand passed during the recruitment, face down in front of the Monarch who receives it (player), for them to take */
  DraftWaiting
}
