import { css } from '@emotion/react'
import { useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { getDraftRecipient, getMe, getPanelsOrder, handsLabelPosition, isDraftRule, isMyAreaDisplayed } from '../locators/TableLayout'
import { getColor } from '../utils/color'
import { colorStripCss, labelCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * During the recruitment, who receives the cards I do not keep, in their colour, with an arrow towards their panel
 */
export const DraftDirection: FC = () => {
  const context = useMaterialContext()
  if (!isDraftRule(context) || !isMyAreaDisplayed(context, getMe(context))) return null
  return <DraftRecipient />
}

const DraftRecipient: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const recipient = getDraftRecipient(context)
  const name = usePlayerName(recipient)
  const order = getPanelsOrder(context)
  const arrow = order.indexOf(recipient) < order.indexOf(getMe(context)) ? '↑' : '↓'
  return (
    <TableAnchor position={handsLabelPosition} css={[labelCss, colorStripCss(getColor(recipient).substring(0, 7)), centeredCss]}>
      {t('draft.recipient', { defaultValue: 'Your other cards go to {player}', player: name })} {arrow}
    </TableAnchor>
  )
}

const centeredCss = css`
  transform: translateX(-50%);
`
