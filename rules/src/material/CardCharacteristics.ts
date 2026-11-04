import { Card, isArtifact } from './Artifact'
import { artifactCharacteristics } from './ArtifactCharacteristics'
import { Effect } from './effects/Effect'
import { ResourceProduction, unitCardCharacteristics } from './UnitCharacteristics'

/** The effects printed on a card of the deck, a unit or a Legendary Artifact (none for a hidden card) */
export const cardEffects = (card?: Card): Effect[] => {
  if (card === undefined) return []
  return (isArtifact(card) ? artifactCharacteristics[card].effect : unitCardCharacteristics[card].effect) ?? []
}

/** The resources printed in the scroll of a card of the deck */
export const cardResources = (card?: Card): ResourceProduction[] => {
  if (card === undefined) return []
  return (isArtifact(card) ? artifactCharacteristics[card].resources : unitCardCharacteristics[card].resources) ?? []
}
