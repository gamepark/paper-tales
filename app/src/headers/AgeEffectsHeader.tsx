/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const AgeEffectsHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('age.effects')}</div>

    </>

}