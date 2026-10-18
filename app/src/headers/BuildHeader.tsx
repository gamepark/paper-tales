import { PlayMoveButton, useLegalMove, useMaterialContext, usePlayerId } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { isWarResultsPending, viewMove } from '../locators/TableLayout'

/** How long the results of the wars stay before the construction moves on to my kingdom */
const WAR_RESULTS_SECONDS = 8

/**
 * Construction (rulebook p.7): a single construction action, or none
 */
export const BuildHeader = () => {
  const { t } = useTranslation()
  const me = usePlayerId()
  const context = useMaterialContext()
  const endMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  if (me === undefined) return <>{t('header.build.spectator', 'The Monarchs build')}</>
  // The wars were just fought: their results stay on the table until I move on to my kingdom, at most for a few seconds
  if (isWarResultsPending(context)) {
    return (
      <Trans i18nKey="header.war.results" defaults="The wars are fought: read the results, then <0>continue</0>">
        <PlayMoveButton move={viewMove(context, me)} transient auto={WAR_RESULTS_SECONDS} />
      </Trans>
    )
  }
  if (!endMove) return <>{t('header.build.wait', 'The other Monarchs build')}</>
  return (
    <Trans i18nKey="header.build" defaults="Build or upgrade a building, or <0>pass</0>">
      <PlayMoveButton move={endMove} />
    </Trans>
  )
}
