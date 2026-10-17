
import { useTranslation } from 'react-i18next'

export const RevealBoardsHeader = () => {
  const { t } = useTranslation()

  return (
    <>
      <div>{t('header.reveal', 'The units are revealed')}</div>
    </>
  )
}
