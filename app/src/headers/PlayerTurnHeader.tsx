/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMoves } from "@gamepark/react-game"
import { Trans } from "react-i18next"

export const PlayerTurnHeader = () => {

  const end = useLegalMoves()
  //console.log(end)
   
  return <>
    <Trans defaults="end.turn">
    <PlayMoveButton move={end} />
    </Trans>
  </>
}


