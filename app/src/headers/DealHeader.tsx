/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const DealHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('deal.cards')}</div>

    </>

}
