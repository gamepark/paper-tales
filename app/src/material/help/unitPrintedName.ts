import { Unit } from '@gamepark/paper-tales/material/Unit'

/** The printed name of the card (English edition): the enum key, words split */
export const unitPrintedName = (unit: Unit) => Unit[unit].replace(/([a-z])([A-Z])/g, '$1 $2')
