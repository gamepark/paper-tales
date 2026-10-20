import { EffectType } from '@gamepark/paper-tales/material/effects/Effect'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffects } from '@gamepark/paper-tales/rules/2_Deployment/DeployEffects'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * The deployment effects resolve on their own, except the ones a Monarch chooses how to apply: the header says which
 * choice is mine, the buttons are on the cards
 */
export const DeployEffectsHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId<PlayerColor>()
  const effect = me !== undefined && rules.isTurnToPlay(me) ? new DeployEffects(rules.game).getCurrentEffect(me)?.effect : undefined
  switch (effect?.type) {
    case EffectType.GainAgeTokenOnChosenUnit:
      return <>{t('header.age-token.choose', 'Choose the unit that receives the Age tokens')}</>
    case EffectType.ImproveBuilding:
      return <>{t('header.improve.choose', 'Choose the level 1 building to improve to level 2')}</>
    case EffectType.MoveAgeToken:
      return <>{t('header.move-age.choose', 'Move an Age token from one of your units to another one')}</>
    case EffectType.ReactivateRevealEffects:
      return <>{t('header.reactivate.choose', 'Choose the unit whose "when revealed" effects apply again')}</>
  }
  if (rules.game.players.some((player) => rules.isTurnToPlay(player))) return <>{t('header.deploy-effects.wait', 'The Monarchs apply their deployment effects')}</>
  return <>{t('header.deploy-effects', 'Deployment effects')}</>
}
