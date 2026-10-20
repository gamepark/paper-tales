import { useTranslation } from 'react-i18next'

export const PayDeployedUnitsHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.pay', 'The Monarchs pay their new units')}</>
}
