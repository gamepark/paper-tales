import { Card } from '@gamepark/paper-tales/material/Artifact'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { MysticEffectType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { MaterialLogProps } from '@gamepark/react-game'
import { CreateItem, CustomMove, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { CardLink, CardList } from './CardLink'
import { cardAt, isAgeTokenOf, runFrom } from './logHelpers'
import { Who } from './Who'

/** A unit that dies at the Age (rulebook p.8), read on the game before it leaves the kingdom */
export const DeathLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).getItem<Card>(move.itemIndex)
  return (
    <Trans
      i18nKey="log.age.dead"
      defaults="<who/> loses <card/>"
      components={{ who: <Who player={item.location.player as PlayerColor} />, card: <CardLink card={item.id} /> }}
    />
  )
}

/** The units of a Monarch that survive the Age and receive an Age token (rulebook p.8), told as one line */
export const AgingLog: FC<MaterialLogProps<CreateItem>> = ({ move, context }) => {
  const player = move.item.location.player as PlayerColor
  const tokens = runFrom(context, isAgeTokenOf(player)) ?? [move]
  return (
    <Trans
      i18nKey="log.age.aging"
      defaults="<who/>: <cards/> {count, plural, one {receives} other {receive}} an Age token"
      values={{ count: tokens.length }}
      components={{ who: <Who player={player} />, cards: <CardList cards={tokens.map((token) => cardAt(context.game, token.item.location.parent!).id)} /> }}
    />
  )
}

/** A Monarch with a Mystic who chooses to save no unit */
export const SaveNobodyLog: FC<MaterialLogProps<CustomMove<PlayerColor>>> = ({ move }) => (
  <Trans i18nKey="log.age.saved.none" defaults="<who/> saves no unit" components={{ who: <Who player={move.data} /> }} />
)

/** A unit the Mystic keeps from dying */
export const SaveLog: FC<MaterialLogProps<CustomMove<MysticEffectType>>> = ({ move, context }) => {
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).getItem<Card>(move.data.unitIndex)
  return (
    <Trans i18nKey="log.age.saved" defaults="<who/> saves <card/>" components={{ who: <Who player={move.data.player} />, card: <CardLink card={item.id} /> }} />
  )
}
