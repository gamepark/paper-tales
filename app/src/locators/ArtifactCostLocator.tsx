import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationDescription, Locator } from '@gamepark/react-game'
import { artifactCostPosition } from './artifactCost'
import { ArtifactCost } from './component/ArtifactCost'

/**
 * A Legendary Artifact has no cost printed (rulebook p.11: 1 gold, plus 1 for each artifact already deployed): on the
 * ones of my hand, a coin with what it would cost me now, at the bottom left of the card (see artifactCostPosition)
 */
class ArtifactCostLocator extends Locator {
  parentItemType = MaterialType.Unit
  positionOnParent = { x: artifactCostPosition.x, y: artifactCostPosition.y }
  locationDescription = new ArtifactCostDescription()
}

class ArtifactCostDescription extends LocationDescription {
  width = artifactCostPosition.size
  height = artifactCostPosition.size
  borderRadius = artifactCostPosition.size / 2
  content = ArtifactCost
}

export const artifactCostLocator = new ArtifactCostLocator()
