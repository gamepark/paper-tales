import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { EndScoreHelper } from '@gamepark/paper-tales/rules/helpers/EndScoreHelper'
import { RuleId } from '@gamepark/paper-tales/rules/RuleId'
import { MaterialLogProps } from '@gamepark/react-game'
import { MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { LegendValueIcon } from '../material/help/book/HelpIcons'
import { CardLink } from './CardLink'
import { deployEffectSource, scoreChange } from './logHelpers'
import { Who } from './Who'

/**
 * Legend points gained or lost outside the wars, with where they come from: the card of a "when revealed" effect, the
 * effects of the Age phase
 */
export const ScoreLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = move.location.player as PlayerColor
  const points = scoreChange(move, context.game)
  const rule = context.game.rule?.id
  const source = rule === RuleId.DeployEffects ? deployEffectSource(context.game, player) : undefined
  const components = {
    who: <Who player={player} />,
    pl: <LegendValueIcon value={Math.abs(points)} />,
    source: source !== undefined ? <CardLink card={source} /> : <></>
  }
  const way = points < 0 ? 'loss' : 'gain'
  if (source !== undefined) return <Trans i18nKey={`log.score.${way}.effect`} defaults={`<who/> ${points < 0 ? 'loses <pl/> with' : 'gains <pl/> from'} <source/>`} components={components} />
  if (rule === RuleId.AgeEffects)
    return <Trans i18nKey={`log.score.${way}.age`} defaults={`<who/> ${points < 0 ? 'loses' : 'gains'} <pl/> from the Aging effects`} components={components} />
  return <Trans i18nKey={`log.score.${way}`} defaults={`<who/> ${points < 0 ? 'loses' : 'gains'} <pl/>`} components={components} />
}

/** The Legend points added at the end of the game (rulebook p.8), with what they are made of, read on the game before */
export const EndScoreLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const { t } = useTranslation()
  const player = move.location.player as PlayerColor
  const helper = new EndScoreHelper(context.game, player)
  const parts = [
    { points: helper.buildingsPoints, label: t('log.end.buildings', 'buildings') },
    { points: helper.relicsPoints, label: t('log.end.relics', 'relics') },
    { points: helper.artifactsPoints, label: t('log.end.artifacts', 'Legendary Artifacts') }
  ].filter((part) => part.points)
  return (
    <Trans
      i18nKey="log.end.score"
      defaults="<who/> scores <pl/> ({details})"
      values={{ details: parts.map((part) => `${part.label} ${part.points}`).join(', ') }}
      components={{ who: <Who player={player} />, pl: <LegendValueIcon value={scoreChange(move, context.game)} /> }}
    />
  )
}
