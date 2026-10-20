import { Card, isArtifact } from './Artifact'
import { artifactCaracteristics } from './ArtifactCaracteristics'
import { Effect } from './effects/Effect'
import { ResourceProduction, unitCardCaracteristics } from './UnitCaracteristics'

/** The effects printed on a card of the deck, a unit or a Legendary Artifact (none for a hidden card) */
export const cardEffects = (card?: Card): Effect[] => {
  if (card === undefined) return []
  return (isArtifact(card) ? artifactCaracteristics[card].effect : unitCardCaracteristics[card].effect) ?? []
}

/** The resources printed in the scroll of a card of the deck */
export const cardResources = (card?: Card): ResourceProduction[] => {
  if (card === undefined) return []
  return (isArtifact(card) ? artifactCaracteristics[card].resources : unitCardCaracteristics[card].resources) ?? []
}
