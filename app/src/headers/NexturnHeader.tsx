/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const NextTurnHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('next.turn')}</div>

    </>

}