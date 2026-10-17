import { useTranslation } from 'react-i18next'

export const DealHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.deal', 'Dealing the Unit cards')}</>
}
