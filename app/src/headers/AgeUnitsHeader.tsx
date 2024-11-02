/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const AgeUnitsAgeHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('age.units')}</div>

    </>

}