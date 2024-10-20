/** @jsxImportSource @emotion/react */

import { useLegalMoves } from "@gamepark/react-game"
import { useTranslation } from "react-i18next"

export const DraftHeader = () => {
  const { t } = useTranslation()
  const legalMoves = useLegalMoves()
  console.log(legalMoves)

  return <>

    {legalMoves.length !== 0
      ? <div>{t('choose.card')}</div>
      : <div>{t('wait.players')}</div>
    }

  </>

}
