import { PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Construction (rulebook p.7): a single construction action, or none
 */
export const BuildHeader = () => {
  const { t } = useTranslation()
  const endMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  if (!endMove) return <>{t('header.build.wait', 'The other Monarchs build')}</>
  return (
    <Trans i18nKey="header.build" defaults="Build or upgrade a building, or <0>pass</0>">
      <PlayMoveButton move={endMove} />
    </Trans>
  )
}
