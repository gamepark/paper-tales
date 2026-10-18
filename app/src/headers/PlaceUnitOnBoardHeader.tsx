import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton, useLegalMove, usePlayerId, useRules } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Deployment (rulebook p.5): place units face down, keep a single card, discard the others. The end button exists
 * only once at most one card is left in hand (the rule offers it then).
 */
export const PlaceUnitOnBoardHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId<PlayerColor>()
  const endMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  if (me === undefined) return <>{t('header.deploy.spectator', 'The Monarchs deploy their units')}</>
  if (!rules.isTurnToPlay(me)) return <>{t('header.deploy.wait', 'The other Monarchs deploy their units')}</>
  const inHand = rules.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(me).length
  if (endMove) {
    return (
      <Trans i18nKey="header.deploy.end" defaults="Deploy your units, or <0>end the deployment</0>">
        <PlayMoveButton move={endMove} />
      </Trans>
    )
  }
  return <>{t('header.deploy', { defaultValue: 'Deploy your units face down, keep 1 card: discard {count}', count: inHand - 1 })}</>
}
