import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationDescription, Locator } from '@gamepark/react-game'
import { ArtifactCost } from './component/ArtifactCost'

/**
 * A Legendary Artifact has no cost printed (rulebook p.11: 1 gold, plus 1 for each artifact already deployed): on the
 * ones of my hand, a coin with what it would cost me now, over the seal, where the units have their printed cost
 */
class ArtifactCostLocator extends Locator {
  parentItemType = MaterialType.Unit
  positionOnParent = { x: 17, y: 11.5 }
  locationDescription = new ArtifactCostDescription()
}

class ArtifactCostDescription extends LocationDescription {
  width = 2.3
  height = 2.3
  borderRadius = 1.15
  content = ArtifactCost
}

export const artifactCostLocator = new ArtifactCostLocator()
