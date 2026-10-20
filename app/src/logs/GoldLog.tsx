import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialLogProps } from '@gamepark/react-game'
import { CreateItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { GoldValueIcon } from '../material/help/book/HelpIcons'
import { deployEffectSource, goldGainTold } from './logHelpers'
import { CardLink } from './CardLink'
import { Who } from './Who'

/**
 * Gold a Monarch receives, told once for all the coins of the gain: the income (rulebook p.6), a "when revealed"
 * effect with its card, the effects of the Age phase
 */
export const GoldLog: FC<MaterialLogProps<CreateItem>> = ({ move, context }) => {
  const player = move.item.location.player as PlayerColor
  const rule = context.game.rule?.id
  const source = rule === RuleId.DeployEffects ? deployEffectSource(context.game, player) : undefined
  const components = {
    who: <Who player={player} />,
    g: <GoldValueIcon value={goldGainTold(move, context) ?? 0} />,
    source: source !== undefined ? <CardLink card={source} /> : <></>
  }
  if (source !== undefined) return <Trans i18nKey="log.gold.effect" defaults="<who/> receives <g/> from <source/>" components={components} />
  if (rule === RuleId.AgeEffects) return <Trans i18nKey="log.gold.age" defaults="<who/> receives <g/> from the Aging effects" components={components} />
  return <Trans i18nKey="log.gold" defaults="<who/> receives <g/>" components={components} />
}
