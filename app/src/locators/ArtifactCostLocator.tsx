import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { LocationDescription, Locator } from '@gamepark/react-game'
import { ArtifactCost } from './component/ArtifactCost'

/**
 * A Legendary Artifact has no cost printed (rulebook p.11: 1 gold, plus 1 for each artifact already deployed): on the
 * ones of my hand, a coin with what it would cost me now, over the seal, where the units have their printed cost
 */
class ArtifactCostLocator extends Locator {
  parentItemType = MaterialType.Unit
  // As large as the printed coin of the unit cards (1.9 cm), centred on the seal, a hair larger, that it covers
  positionOnParent = { x: 15.4, y: 10.1 }
  locationDescription = new ArtifactCostDescription()
}

class ArtifactCostDescription extends LocationDescription {
  width = 1.95
  height = 1.95
  borderRadius = 0.975
  content = ArtifactCost
}

export const artifactCostLocator = new ArtifactCostLocator()
