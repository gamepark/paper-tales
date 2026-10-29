import { css } from '@emotion/react'
import { Card } from '@gamepark/paper-tales/material/Artifact'
import { Building } from '@gamepark/paper-tales/material/Building'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton } from '@gamepark/react-game'
import { MaterialGame, MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ochre, rust } from '../theme/tableTheme'
import { deployEffectSource } from './logHelpers'
import { useUnitName } from './useUnitName'
import displayMaterialHelp = MaterialMoveBuilder.displayMaterialHelp

/**
 * The name of a card in the journal, a link to its help: the journal is where the players look for what happened, the
 * card is a click away. The help shows the card itself, not where it is now (it may have left the kingdom since).
 */
const HelpLink: FC<{ type: MaterialType; id: number; inHeader?: boolean; children: ReactNode }> = ({ type, id, inHeader, children }) => (
  <PlayMoveButton css={inHeader ? headerLinkCss : linkCss} move={displayMaterialHelp(type, { id })} transient>
    {children}
  </PlayMoveButton>
)

/** A unit or a Legendary Artifact. In the header, the name is read on the dark bar, not on the page of the journal */
export const CardLink: FC<{ card: Card; inHeader?: boolean }> = ({ card, inHeader }) => {
  const unitName = useUnitName()
  return (
    <HelpLink type={MaterialType.Unit} id={card} inHeader={inHeader}>
      {unitName(card)}
    </HelpLink>
  )
}

/** Cards named one after the other as the language joins them ("A, B and C"), each one a link to its help */
export const CardList: FC<{ cards: Card[]; inHeader?: boolean }> = ({ cards, inHeader }) => {
  const { i18n } = useTranslation()
  const parts = new Intl.ListFormat(i18n.language, { type: 'conjunction' }).formatToParts(cards.map((_, index) => String(index)))
  return (
    <>
      {parts.map((part, index) => (part.type === 'element' ? <CardLink key={index} card={cards[Number(part.value)]} inHeader={inHeader} /> : part.value))}
    </>
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

/**
 * In the header: the buttons there are torn paper (see theme.header.buttons), a name is not one. The ink of the header,
 * in ochre, underlined with dots like in the journal.
 */
const headerLinkCss = css`
  &&& {
    display: inline;
    margin: 0;
    padding: 0;
    border: 0;
    border-bottom: 0.08em dotted ${ochre}aa;
    border-radius: 0;
    background: none;
    color: ${ochre};
    font: inherit;
    font-weight: 800;
    line-height: inherit;
    filter: none;
    transform: none;
    cursor: pointer;
  }

  &&&::before {
    display: none;
  }

  &&&:hover {
    border-bottom-style: solid;
    color: #f4cf6a;
  }
`
