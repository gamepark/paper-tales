import { isWarFromBacklane } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { MaterialItem } from '@gamepark/rules-api'

/** A unit of the back row that still fights (rulebook p.6, the ranged units) */
export const fightsFromBackRow = (item: MaterialItem) =>
  item.id !== undefined && (unitCardCaracteristics[item.id as Unit].effect ?? []).some(isWarFromBacklane)
