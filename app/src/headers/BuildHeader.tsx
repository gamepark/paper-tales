/** @jsxImportSource @emotion/react */

import { PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

export const BuildHeader = () => {
  const endMove = useLegalMove<MaterialMove>((move) => isEndPlayerTurn(move))
  const { t } = useTranslation()

  return (
    <>
      {endMove !== undefined ? (
        <PlayMoveButton move={endMove}>
          <div> {t('end.turn.build')}</div>
        </PlayMoveButton>
      ) : (
        <div> {t('wait.turn.build')} </div>
      )}
    </>
  )
}
