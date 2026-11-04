export enum LocationType {
  PlayerUnitHand = 1,
  PlayerDraftHand,
  PlayerUnitBoard,
  PlayerBuildingHand,
  PlayerBuildingBoard,
  PlayerGoldStock,
  PlayerScore,
  AgeStock,
  GoldStock,
  Discard,
  Deck,
  Time,
  OnCard,
  /** A hand passed during the recruitment, on its way to the Monarch who receives it (player), face down for all */
  DraftTransit,
  /** A veil over a unit card, drawn by the interface only (in the discard, at the back row of a war) */
  UnitVeil,
  /** A veil over a building card, drawn by the interface only (a building that cannot be built now) */
  BuildingVeil,
  /** The Legendary Artifacts of a Monarch, apart from the units (x: the order they were put into play) */
  PlayerArtifacts,
  /** The rules proper to this game (2 players, expansions), a help page opened by the interface only */
  GameRules,
  /** What a Legendary Artifact of my hand would cost me now, drawn by the interface only on the card (parent) */
  ArtifactCost,
  /** The recruitment cost printed on a unit (parent), that the tutorial points at: drawn by the interface only */
  UnitCost
}
