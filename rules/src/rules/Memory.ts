export enum Memory {
  PlayedCardsDuringDeployment = 1,
  UnitSavedWithMystic,
  TwoPlayersDraftMoves,
  PlacingAgeTokenUnitsIndexes,
  Time,
  /** The discard was already shuffled into a new deck for the Shapeshifter of this player this turn */
  ShapeshifterRefill
}

export type UnitSavedWithMysticType = number[]
