import { useTranslation } from 'react-i18next'

export const DeployEffectsHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.deploy-effects', 'Deployment effects')}</>
}
