/** @jsxImportSource @emotion/react */


import { useTranslation } from "react-i18next"

export const RevealBoardsHeader = () => {
    const { t } = useTranslation()


    return <>

        <div>{t('reveal.board')}</div>

    </>

}
