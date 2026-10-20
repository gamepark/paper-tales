import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { DeployCostHelper } from '@gamepark/paper-tales/rules/helpers/DeployCostHelper'
import { useMaterialContext } from '@gamepark/react-game'
import { css } from '@emotion/react'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import gold from '../images/tokens/Gold1.jpg'
import { deployGoldPosition, getMe, isMyAreaDisplayed } from '../locators/TableLayout'
import { labelCss, roundImageCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * During the deployment, the new units are paid when revealed (rulebook p.5): my gold and the cost of what I placed
 */
export const DeployGold: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = getMe(context)
  // A spectator has no gold to spend, and does not know the units placed face down
  if (context.player === undefined) return null
  if (context.rules.game.rule?.id !== RuleId.PlaceUnitOnBoard || !isMyAreaDisplayed(context, me)) return null
  const cost = new DeployCostHelper(context.rules.game, me).placedCost
  const goldCount = new BuildHelper(context.rules.game, me).gold
  const left = goldCount - cost
  // My gold, minus the cost of the units I placed, gives what will be left: in crimson when it is not enough
  return (
    <TableAnchor
      position={deployGoldPosition}
      css={[labelCss, equationCss]}
      title={t('deploy.gold.help', { defaultValue: 'Your gold, minus the cost of the units you placed: what you will have left', gold: goldCount, cost, left })}
    >
      <img src={gold} alt="" css={roundImageCss} />
      <span>{goldCount}</span>
      <span css={operatorCss}>−</span>
      <span>{cost}</span>
      <span css={operatorCss}>=</span>
      <span css={left < 0 && lackCss}>{left}</span>
    </TableAnchor>
  )
}

/** A short sum centred under my pile of gold */
const equationCss = css`
  gap: 0.3em;
  transform: translateX(-50%);
`

const operatorCss = css`
  opacity: 0.6;
`

const lackCss = css`
  color: #9b2e4d;
`
