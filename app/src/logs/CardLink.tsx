import { css } from '@emotion/react'
import { Card } from '@gamepark/paper-tales/material/Artifact'
import { Building } from '@gamepark/paper-tales/material/Building'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton } from '@gamepark/react-game'
import { MaterialGame, MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { rust } from '../theme/tableTheme'
import { deployEffectSource } from './logHelpers'
import { useUnitName } from './useUnitName'
import displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/**
 * The name of a card in the journal, a link to its help: the journal is where the players look for what happened, the
 * card is a click away. The help shows the card itself, not where it is now (it may have left the kingdom since).
 */
const HelpLink: FC<{ type: MaterialType; id: number; children: ReactNode }> = ({ type, id, children }) => (
  <PlayMoveButton css={linkCss} move={displayMaterialHelp(type, { id })} transient>
    {children}
  </PlayMoveButton>
)

/** A unit or a Legendary Artifact */
export const CardLink: FC<{ card: Card }> = ({ card }) => {
  const unitName = useUnitName()
  return (
    <HelpLink type={MaterialType.Unit} id={card}>
      {unitName(card)}
    </HelpLink>
  )
}

/** The card whose "when revealed" effect a Monarch is resolving, read on the game before the move */
export const EffectSourceLink: FC<{ game: MaterialGame; player: PlayerColor }> = ({ game, player }) => {
  const source = deployEffectSource(game, player)
  return source !== undefined ? <CardLink card={source} /> : null
}

export const BuildingLink: FC<{ building: Building }> = ({ building }) => {
  const { t } = useTranslation()
  return (
    <HelpLink type={MaterialType.Building} id={building}>
      {t(`building.${building}`)}
    </HelpLink>
  )
}

/** The name in rust, underlined with dots like a reference of the rulebook; the plain ink of the line on hover */
const linkCss = css`
  &&& {
    display: inline;
    margin: 0;
    padding: 0;
    border: 0;
    border-bottom: 0.08em dotted ${rust}99;
    border-radius: 0;
    background: none;
    color: ${rust};
    font: inherit;
    font-weight: 700;
    font-style: normal;
    line-height: inherit;
    text-decoration: none;
    cursor: pointer;
  }

  &&&:hover {
    border-bottom-style: solid;
    color: #7a2e12;
  }
`
