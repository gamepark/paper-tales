import { Card, isArtifact } from '@gamepark/paper-tales/material/Artifact'
import { useTranslation } from 'react-i18next'
import { unitPrintedName } from '../material/help/unitPrintedName'

/** The name of a card of the deck (a unit, a Legendary Artifact) in the language of the game, else the name printed on the English card */
export const useUnitName = () => {
  const { t, i18n } = useTranslation()
  return (card: Card) => {
    const key = isArtifact(card) ? `artifact.name.${card}` : `unit.name.${card}`
    return i18n.exists(key) ? t(key) : unitPrintedName(card)
  }
}
