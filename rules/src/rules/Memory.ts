import { DeploymentEffect } from '../material/effects/2_DeploymentEffects'

export enum Memory {
  /** Per player: the indexes of the cards (units and Legendary Artifacts) laid this turn, revealed this turn after the reveal */
  PlayedCardsDuringDeployment = 1,
  UnitSavedWithMystic,
  TwoPlayersDraftMoves,
  Time,
  /** Per player: the discard was already shuffled into a new deck for a draw of this player this turn (Shapeshifter, Court Jester) */
  DeckRefilled,
  /** The strength of each Monarch when the wars of this turn were fought: the outcome is read from it afterwards */
  WarStrengths,
  /** Per player: the deployment effects still to resolve this turn, the first one being resolved (see DeployEffects) */
  DeployEffects
}

export type UnitSavedWithMysticType = number[]

/** A deployment effect waiting to be resolved, with the card that has it (none for a building) */
export type PendingDeployEffect = { source?: number; effect: DeploymentEffect }
