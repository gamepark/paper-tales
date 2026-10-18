import { css } from '@emotion/react'
import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import {
  getDraftRecipient,
  getMe,
  getPanelsOrder,
  getViewedPlayer,
  handsLabelPosition,
  isDraftRule,
  isMyAreaDisplayed,
  isSpectator,
  isWarView
} from '../locators/TableLayout'
import { getColor } from '../utils/color'
import { colorStripCss, labelCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * During the recruitment, who receives the cards I do not keep, in their colour, with an arrow towards their panel.
 * A spectator reads it for the Monarch whose area is displayed.
 */
export const DraftDirection: FC = () => {
  const context = useMaterialContext()
  // With 2 players, every card goes to the other Monarch: nothing to tell
  if (!isDraftRule(context) || context.rules.players.length === 2) return null
  if (isSpectator(context)) return isWarView(context) ? null : <DraftRecipient player={getViewedPlayer(context)} />
  if (!isMyAreaDisplayed(context, getMe(context))) return null
  return <DraftRecipient player={getMe(context)} />
}

const DraftRecipient: FC<{ player: number }> = ({ player }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const recipient = getDraftRecipient(context, player)
  const name = usePlayerName(recipient)
  const giver = usePlayerName(player)
  const order = getPanelsOrder(context)
  const arrow = order.indexOf(recipient) < order.indexOf(player) ? '↑' : '↓'
  const text = isSpectator(context)
    ? t('draft.recipient.spectator', { defaultValue: 'The other cards of {giver} go to {player}', giver, player: name })
    : t('draft.recipient', { defaultValue: 'Your other cards go to {player}', player: name })
  return (
    <TableAnchor position={handsLabelPosition} css={[labelCss, colorStripCss(getColor(recipient).substring(0, 7)), rightAlignedCss]}>
      {text} {arrow}
    </TableAnchor>
  )
}

const rightAlignedCss = css`
  transform: translateX(-100%);
`
