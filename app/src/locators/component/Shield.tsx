/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { Picture, pointerCursorCss, usePlayerId, useRules } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { FC, useMemo } from 'react'
import shieldIcon from '../../images/tokens/bouclier_rouge.png'

export const ShieldIcon: FC<{ location: Location }> = ({ location }) => {
  const rules = useRules<PaperTalesRules>()!
  const unit = rules.material(MaterialType.Unit).getItem(location.parent!)
  const unitId: Unit | undefined = unit.id
  const player = usePlayerId()
  const war = useMemo(() => new War(rules.game), [rules.game, player])
  const unitPower = !player || !unitId ? undefined : war.getUnitPower(unit, location.parent!)

  if (!unitPower) return null
  return (
    <>
      <Picture src={shieldIcon} css={[pointerCursorCss, shieldCss]} />
      <span css={[textPosition]}>{unitPower}</span>
    </>
  )
}

const shieldCss = css`
  width: 1.5em;
  position: absolute;
`

const textPosition = css`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -30%);
  font-size: 1.2em;
  font-family: 'Helvetica';
  font-weight: bold;
`
