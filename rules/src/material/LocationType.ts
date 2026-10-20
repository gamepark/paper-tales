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
  /** A veil over a unit card, drawn by the interface only (in the discard, at the back row of a war) */
  UnitVeil,
  /** A veil over a building card, drawn by the interface only (a building that cannot be built now) */
  BuildingVeil
}
