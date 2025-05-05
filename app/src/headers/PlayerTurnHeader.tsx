/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

export const PlayerTurnHeader = () => {
  const endMove = useLegalMove<MaterialMove>((move) => isEndPlayerTurn(move))
  const { t } = useTranslation()

  return (
    <>
      <PlayMoveButton move={endMove}>
        <div>{t('end.turn.player')}</div>
      </PlayMoveButton>
    </>
  )
}
