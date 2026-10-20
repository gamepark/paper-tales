import { Artifact } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { DeployCostHelper } from '@gamepark/paper-tales/rules/helpers/DeployCostHelper'

/**
 * Where the cost of a Legendary Artifact stands on the card, in % of the card: at the bottom left, the mirror of the
 * printed coin of the units (1.9 cm wide, at 15.3 % and 10.4 %), on the picture, where it covers no text
 */
export const artifactCostPosition = { x: 15.4, y: 89.6, size: 1.9 }

/** Where a Legendary Artifact shows its cost: in the hands of its Monarch, before it is deployed */
export const artifactCostLocations = [LocationType.PlayerDraftHand, LocationType.PlayerUnitHand]

/** What a Legendary Artifact of the hand would cost its Monarch now, if they deployed it */
export const getArtifactCost = (rules: PaperTalesRules, index: number): number | undefined => {
  const artifact = rules.material(MaterialType.Unit).getItem<Artifact>(index)
  const owner = artifact.location.player
  if (owner === undefined || artifact.id === undefined) return undefined
  return new DeployCostHelper(rules.game, owner).costOf(artifact.id)
}
