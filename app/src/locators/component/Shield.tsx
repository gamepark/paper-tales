/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Picture, pointerCursorCss, usePlayerId, useRules} from '@gamepark/react-game'
import { Location, MaterialItem } from '@gamepark/rules-api'
import { FC, useMemo } from 'react'
import shieldIcon from '../../images/tokens/bouclier_rouge.png'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { War } from '@gamepark/paper-tales/rules/3_War/War'

export const ShieldIcon: FC<{ location: Location }> = ({ location }) => {
  const rules = useRules<PaperTalesRules>()!
  const unit:MaterialItem | undefined = rules.material(MaterialType.Unit).filter((_i, index) => index === location.parent).getItem()
  const player = usePlayerId()
  const war = useMemo(() => new War(rules.game), [rules.game, player])
  const unitPower = unit === undefined || player === undefined || unit.id === undefined ? undefined : war.getUnitPower(player, unit)

  const powerToDisplay = unitPower === undefined ? undefined : unitPower

  console.log(powerToDisplay)

  if (powerToDisplay === undefined) return null
  return (
    <>
      <Picture src={shieldIcon} css={[pointerCursorCss, shieldCss]} />
      <span css={[textPosition]}>{powerToDisplay}</span>
    </>
  )
}

const shieldCss = css`
  width:1.5em;
  position:absolute;
`

const textPosition = css`
  position:absolute;
  top:50%;left:50%;
  transform: translate(-50%,-30%);
  font-size: 1.2em;
  font-family: "Helvetica";
  font-weight:bold;

`

