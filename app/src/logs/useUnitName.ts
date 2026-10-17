import { Unit } from '@gamepark/paper-tales/material/Unit'
import { useTranslation } from 'react-i18next'

/** The name of a unit: its translation, else the English name printed on the card */
export const useUnitName = () => {
  const { t } = useTranslation()
  return (unit: Unit) => t(`card.${unit}`, Unit[unit].replace(/([a-z])([A-Z])/g, '$1 $2'))
}
