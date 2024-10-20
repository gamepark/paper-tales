/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const PayDeployedUnitsHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('pay.units')}</div>

    </>

}