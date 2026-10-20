import { Artifact, Card, isArtifact } from '@gamepark/paper-tales/material/Artifact'
import { Unit } from '@gamepark/paper-tales/material/Unit'

/** The printed name of the card (English edition): the enum key, words split */
export const unitPrintedName = (card: Card) => (isArtifact(card) ? Artifact[card] : Unit[card]).replace(/([a-z])([A-Z])/g, '$1 $2')
