import { isWarFromBacklane } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCharacteristics } from '@gamepark/paper-tales/material/UnitCharacteristics'
import { MaterialItem } from '@gamepark/rules-api'

/** A unit of the back row that still fights (rulebook p.6, the ranged units) */
export const fightsFromBackRow = (item: MaterialItem) =>
  item.id !== undefined && (unitCardCharacteristics[item.id as Unit].effect ?? []).some(isWarFromBacklane)
