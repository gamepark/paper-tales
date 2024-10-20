/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const IncomeHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('income')}</div>

    </>

}