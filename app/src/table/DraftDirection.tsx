import { css } from '@emotion/react'
import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getDraftRecipient, getPanelsOrder, getViewedPlayer, handsLabelPosition, isDraftRule, isSpectator, isWarView } from '../locators/TableLayout'
import { getColor } from '../utils/color'
import { colorStripCss, labelCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * During the recruitment, for a spectator: who receives the cards that the Monarch whose area is displayed does not
 * keep, in their colour, with an arrow towards their panel. A Monarch reads it on the panel of their neighbour
 * (Receives your cards) and in the turn order arrows. With 2 players, every card goes to the other Monarch: nothing
 * to tell.
 */
export const DraftDirection: FC = () => {
  const context = useMaterialContext()
  if (!isDraftRule(context) || context.rules.players.length === 2 || !isSpectator(context) || isWarView(context)) return null
  return <DraftRecipient player={getViewedPlayer(context)} />
}

const DraftRecipient: FC<{ player: number }> = ({ player }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const recipient = getDraftRecipient(context, player)
  const name = usePlayerName(recipient)
  const giver = usePlayerName(player)
  const order = getPanelsOrder(context)
  const arrow = order.indexOf(recipient) < order.indexOf(player) ? '↑' : '↓'
  return (
    <TableAnchor position={handsLabelPosition} css={[labelCss, colorStripCss(getColor(recipient).substring(0, 7)), centeredCss]}>
      {t('draft.recipient.spectator', { defaultValue: 'The other cards of {giver} go to {player}', giver, player: name })} {arrow}
    </TableAnchor>
  )
}

const centeredCss = css`
  transform: translateX(-50%);
`
