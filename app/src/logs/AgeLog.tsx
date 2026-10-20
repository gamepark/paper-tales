import { Card } from '@gamepark/paper-tales/material/Artifact'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { MysticEffectType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { MaterialLogProps } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { CardLink } from './CardLink'
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

/** A unit the Mystic keeps from dying */
export const SaveLog: FC<MaterialLogProps<CustomMove<MysticEffectType>>> = ({ move, context }) => {
  const item = new PaperTalesRules(context.game).material(MaterialType.Unit).getItem<Card>(move.data.unitIndex)
  return (
    <Trans i18nKey="log.age.saved" defaults="<who/> saves <card/>" components={{ who: <Who player={move.data.player} />, card: <CardLink card={item.id} /> }} />
  )
}
