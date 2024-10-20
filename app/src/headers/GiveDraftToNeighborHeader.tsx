/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const GiveDraftToNeighborHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('draft.cards')}</div>

    </>

}
