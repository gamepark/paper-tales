/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const WarHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('war')}</div>

    </>

}
