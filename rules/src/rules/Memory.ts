export enum Memory {
  PlayedCardsDuringDeployment = 1,
  UnitSavedWithMystic,
  TwoPlayersDraftMoves,
  PlacingAgeTokenUnitsIndexes,
  Time,
  /** The discard was already shuffled into a new deck for the Shapeshifter of this player this turn */
  ShapeshifterRefill,
  /** The strength of each Monarch when the wars of this turn were fought: the outcome is read from it afterwards */
  WarStrengths
}

export type UnitSavedWithMysticType = number[]
