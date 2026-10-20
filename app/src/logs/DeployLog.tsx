import { isArtifact } from '@gamepark/paper-tales/material/Artifact'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffects } from '@gamepark/paper-tales/rules/2_Deployment/DeployEffects'
import { GainAgeTokenOnChosenUnitEffect, ReactivateUnitData } from '@gamepark/paper-tales/rules/CustomMoveType'
import { GainAgeTokenOnChosenUnit } from '@gamepark/paper-tales/material/effects/2_DeploymentEffects'
import { MaterialLogProps } from '@gamepark/react-game'
import { CustomMove, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { CardLink, EffectSourceLink } from './CardLink'
import { cardAt, deployEffectSource, revealedCard } from './logHelpers'
import { Who } from './Who'

/** A unit revealed in a kingdom. Its face was hidden to the others until now: the move itself reveals its id */
export const DeployLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const item = cardAt(context.game, move.itemIndex)
  const card = item.id ?? revealedCard(move)
  const who = <Who player={item.location.player} />
  if (card === undefined) return <Trans i18nKey="log.deploy.hidden" defaults="<who/> deploys a unit" components={{ who }} />
  return <Trans i18nKey="log.deploy" defaults="<who/> deploys <card/>" components={{ who, card: <CardLink card={card} /> }} />
}

/**
 * A card drawn by a "when revealed" effect: the unit that takes the place of the Shapeshifter, the Legendary Artifact
 * the Court Jester finds. The cards drawn and discarded on the way are not told.
 */
export const DrawnLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = move.location.player as PlayerColor
  const card = revealedCard(move) ?? cardAt(context.game, move.itemIndex).id
  const source = deployEffectSource(context.game, player)
  const components = { who: <Who player={player} />, card: <CardLink card={card} />, source: source !== undefined ? <CardLink card={source} /> : <></> }
  if (isArtifact(card)) return <Trans i18nKey="log.drawn.artifact" defaults="<who/> finds <card/> thanks to <source/>" components={components} />
  return <Trans i18nKey="log.drawn.unit" defaults="<who/> replaces <source/> with <card/>" components={components} />
}

/** The Shadow applies again the "when revealed" effects of a unit */
export const ReactivateLog: FC<MaterialLogProps<CustomMove>> = ({ move, context }) => {
  const { unitIndex, player } = move.data as ReactivateUnitData
  return (
    <Trans
      i18nKey="log.reactivate"
      defaults="<who/> triggers <card/> again with <source/>"
      components={{
        who: <Who player={player} />,
        card: <CardLink card={cardAt(context.game, unitIndex).id} />,
        source: <EffectSourceLink game={context.game} player={player} />
      }}
    />
  )
}

/** The Age tokens a Monarch places on the unit of their choice (the Time Mistress, the Master Alchemist…) */
export const ChosenAgeTokenLog: FC<MaterialLogProps<CustomMove>> = ({ move, context }) => {
  const { unitIndex, player } = move.data as GainAgeTokenOnChosenUnitEffect
  const rule = new DeployEffects(context.game)
  const effect = rule.getCurrentEffect(player)?.effect as GainAgeTokenOnChosenUnit
  return (
    <Trans
      i18nKey="log.age-token.placed"
      defaults="<who/> places {count, plural, one {# Age token} other {# Age tokens}} on <card/> with <source/>"
      values={{ count: rule.getChosenAgeTokens(player, effect) }}
      components={{
        who: <Who player={player} />,
        card: <CardLink card={cardAt(context.game, unitIndex).id} />,
        source: <EffectSourceLink game={context.game} player={player} />
      }}
    />
  )
}

/** An Age token moved from a unit to another (the Wizard Apprentice) */
export const MovedAgeTokenLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const token = new PaperTalesRules(context.game).material(MaterialType.Age).getItem(move.itemIndex)
  const player = move.location.player as PlayerColor
  return (
    <Trans
      i18nKey="log.age-token.moved"
      defaults="<who/> moves an Age token with <source/>: <from/> → <to/>"
      components={{
        who: <Who player={player} />,
        source: <EffectSourceLink game={context.game} player={player} />,
        from: <CardLink card={cardAt(context.game, token.location.parent!).id} />,
        to: <CardLink card={cardAt(context.game, move.location.parent!).id} />
      }}
    />
  )
}
