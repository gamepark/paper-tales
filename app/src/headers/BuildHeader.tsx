/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMoves } from "@gamepark/react-game"
import { useTranslation } from "react-i18next"


export const BuildHeader = () => {

  const legalMoves = useLegalMoves()
  const endMove = legalMoves.find(move => move.type === 2)
  const { t } = useTranslation()


  return <>


    {endMove !== undefined
      ? <PlayMoveButton move={endMove}>
        <div> {t('end.turn.build')}</div>
      </PlayMoveButton>
      : <div> {t('wait.turn.build')}  </div>
    }




  </>
}


