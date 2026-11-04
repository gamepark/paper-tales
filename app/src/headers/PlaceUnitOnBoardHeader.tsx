import { Card } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton, useDraggedItem, useLegalMove, useMaterialContext, usePlayerId, useRules } from '@gamepark/react-game'
import { isEndPlayerTurn, MaterialMove } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { isMyAreaDisplayed } from '../locators/TableLayout'
import { CardLink } from '../logs/CardLink'
import { getSelectedUnit, unselectToPlace } from '../material/actions/PlaceActions'

/** The deployment ends by itself this long, in seconds, after the last change the Monarch made to it */
const END_COUNTDOWN = 20

/**
 * Deployment (rulebook p.5): place units face down, keep a single card, discard the others. While a card is chosen with
 * its button, the header names it and asks where to place it. The end button exists only once at most one card is left in
 * hand (the rule offers it then). It counts down from then on: the countdown starts over at each card moved, and waits
 * while the Monarch drags a card, reads a help or looks at another kingdom.
 */
export const PlaceUnitOnBoardHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const context = useMaterialContext()
  const me = usePlayerId<PlayerColor>()
  const endMove = useLegalMove<MaterialMove>(isEndPlayerTurn)
  const dragging = !!useDraggedItem()
  if (me === undefined) return <>{t('header.deploy.spectator', 'The Monarchs deploy their units')}</>
  if (!rules.isTurnToPlay(me)) return <>{t('header.deploy.wait', 'The other Monarchs deploy their units')}</>
  const selected = getSelectedUnit(context)
  if (selected !== undefined) {
    return (
      <Trans
        i18nKey="header.deploy.choose"
        defaults="<0/>: choose where to place it, or <1>cancel</1>"
        components={[
          <CardLink key="card" card={rules.material(MaterialType.Unit).getItem<Card>(selected).id} inHeader />,
          <PlayMoveButton key="cancel" moves={unselectToPlace(context)} move={undefined} transient />
        ]}
      />
    )
  }
  const inHand = rules.material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(me).length
  if (endMove) {
    const reading = dragging || !!rules.game.helpDisplay || !isMyAreaDisplayed(context, me)
    // A new key at each card moved: the button starts its countdown over
    const cards = rules.material(MaterialType.Unit).player(me).getItems().map(({ location }) => [location.type, location.x, location.y])
    return (
      <Trans key={JSON.stringify(cards)} i18nKey="header.deploy.end" defaults="Deploy your units, or <0>end the deployment</0>">
        <PlayMoveButton move={endMove} auto={reading ? undefined : END_COUNTDOWN} />
      </Trans>
    )
  }
  return <>{t('header.deploy', { defaultValue: 'Deploy your units face down, keep 1 card: discard {count}', count: inHand - 1 })}</>
}
