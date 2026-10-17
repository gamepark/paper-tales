import { useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/**
 * Wars (rulebook p.6): resolved at once, each kingdom against each of its neighbours (a single one at 2 players)
 */
export const WarHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()!
  if (rules.players.length === 2) return <>{t('header.war.two-players', 'War: the kingdoms face each other')}</>
  return <>{t('header.war', 'Wars: each kingdom faces its two neighbours')}</>
}
