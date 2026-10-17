import { Unit } from '@gamepark/paper-tales/material/Unit'
import { useTranslation } from 'react-i18next'
import { unitPrintedName } from '../material/help/unitPrintedName'

/** The name of a unit in the language of the game, else the name printed on the English card */
export const useUnitName = () => {
  const { t, i18n } = useTranslation()
  return (unit: Unit) => (i18n.exists(`unit.name.${unit}`) ? t(`unit.name.${unit}`) : unitPrintedName(unit))
}
