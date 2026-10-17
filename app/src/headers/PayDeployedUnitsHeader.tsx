
import { useTranslation } from 'react-i18next'

export const PayDeployedUnitsHeader = () => {
  const { t } = useTranslation()

  return (
    <>
      <div>{t('header.pay', 'The Monarchs pay their new units')}</div>
    </>
  )
}
