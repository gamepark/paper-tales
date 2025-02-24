/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMoves } from "@gamepark/react-game"
import { useTranslation } from "react-i18next"


export const PlayerTurnHeader = () => {

  const legalMoves = useLegalMoves()
  const endMove = legalMoves.find(move => move.type === 2)
  const { t } = useTranslation()


  return <>

    <PlayMoveButton move={endMove}>
    <div>{t('end.turn.player')}</div>
    </PlayMoveButton>


  </>
}


