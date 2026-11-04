import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayMoveButton, useLegalMove, usePlayerId, useRules } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Construction (rulebook p.7): a single construction action, or none. Who is active comes from the rule, and the tutorial
 * may not offer to pass.
 */
export const BuildHeader = () => {
  const { t } = useTranslation()
  const me = usePlayerId()
  const rules = useRules<PaperTalesRules>()!
  const endMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  if (me === undefined) return <>{t('header.build.spectator', 'The Monarchs build')}</>
  if (!rules.game.rule?.players?.includes(me)) return <>{t('header.build.wait', 'The other Monarchs build')}</>
  if (!endMove) return <>{t('header.build.tutorial', 'Build a building')}</>
  return (
    <Trans i18nKey="header.build" defaults="Build or upgrade a building, or <0>pass</0>">
      <PlayMoveButton move={endMove} />
    </Trans>
  )
}
