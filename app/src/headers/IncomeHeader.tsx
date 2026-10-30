import { usePlayerId } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * Income (rulebook p.6): 2 gold for everyone, plus the income effects of the units and buildings
 */
export const IncomeHeader = () => {
  const { t } = useTranslation()
  const me = usePlayerId()
  if (me === undefined) return <>{t('header.income', 'Income: 2 gold each, plus the income of the kingdoms')}</>
  return <>{t('header.income.you', 'Income: 2 gold, plus the income of your kingdom')}</>
}
