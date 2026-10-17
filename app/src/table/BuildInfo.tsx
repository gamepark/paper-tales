import { css } from '@emotion/react'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { useMaterialContext } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import wood from '../images/ressources/ressources_bois.png'
import diamond from '../images/ressources/ressources_minerai.png'
import food from '../images/ressources/ressources_viande.png'
import gold from '../images/tokens/Gold1.jpg'
import { buildInfoPosition, getMe, isMyAreaDisplayed } from '../locators/TableLayout'
import { labelCss, roundImageCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * During the Build phase: the resources my kingdom produces (they are never spent, rulebook p.7), my gold and the cost
 * of the land
 */
export const BuildInfo: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = getMe(context)
  if (context.rules.game.rule?.id !== RuleId.Build || !isMyAreaDisplayed(context, me)) return null
  const resources = new ResourcesHelper(context.rules.game, me)
  const buildHelper = new BuildHelper(context.rules.game, me)
  return (
    <TableAnchor position={buildInfoPosition} css={columnCss}>
      <span css={labelCss}>
        <img src={wood} alt="" />
        {resources.getResource(Resources.Wood)}
        <img src={food} alt="" />
        {resources.getResource(Resources.Food)}
        <img src={diamond} alt="" />
        {resources.getResource(Resources.Diamond)}
        <img src={gold} alt="" css={roundImageCss} />
        {buildHelper.gold}
      </span>
      <span css={labelCss}>{t('build.field-cost', { defaultValue: 'Land: {cost} gold', cost: buildHelper.fieldCost })}</span>
    </TableAnchor>
  )
}

const columnCss = css`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.4em;

  > span {
    position: relative;
  }
`
