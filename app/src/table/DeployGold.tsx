import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { useMaterialContext } from '@gamepark/react-game'
import { sumBy } from 'es-toolkit/compat'
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
  const placed = context.rules.remind<number[] | undefined>(Memory.PlayedCardsDuringDeployment, me) ?? []
  const units = context.rules.material(MaterialType.Unit).index(placed).getItems<Unit>()
  const cost = sumBy(units, (unit) => unitCardCaracteristics[unit.id]?.cost ?? 0)
  const left = new BuildHelper(context.rules.game, me).gold - cost
  return (
    <TableAnchor position={deployGoldPosition} css={columnCss}>
      <span css={labelCss}>
        {t('deploy.gold.cost', { defaultValue: 'To pay: {cost}', cost })}
        <img src={gold} alt="" css={roundImageCss} />
      </span>
      <span css={labelCss}>
        {left >= 0 ? t('deploy.gold.left', { defaultValue: 'Left: {left}', left }) : t('deploy.gold.missing', { defaultValue: 'Missing: {missing}', missing: -left })}
        <img src={gold} alt="" css={roundImageCss} />
      </span>
    </TableAnchor>
  )
}

/** One line each, centred under my pile of gold: what the units I placed cost, and what is left of my gold */
const columnCss = css`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3em;
  transform: translateX(-50%);

  > span {
    position: relative;
  }
`
