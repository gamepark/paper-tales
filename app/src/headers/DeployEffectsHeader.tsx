import { EffectType, WhichUnit } from '@gamepark/paper-tales/material/effects/Effect'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { DeployEffectsHelper } from '@gamepark/paper-tales/rules/helpers/DeployEffectsHelper'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { CardLink } from '../logs/CardLink'
import { getChoiceSourceCards } from '../table/choiceSources'

/**
 * The deployment effects resolve on their own, except the ones a Monarch chooses how to apply: the header says which
 * choice is mine and which card asks for it (a link to its help, the card is outlined on the table), the buttons are on
 * the cards
 */
export const DeployEffectsHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId<PlayerColor>()
  const effect = me !== undefined && rules.isTurnToPlay(me) ? new DeployEffectsHelper(rules.game).getCurrentEffect(me)?.effect : undefined
  const [source] = getChoiceSourceCards(rules, me)
  const card = source !== undefined ? [<CardLink key="card" card={source} inHeader />] : undefined
  switch (effect?.type) {
    case EffectType.GainAgeTokenOnChosenUnit: {
      if (!card) return <>{t('header.age-token.choose', 'Choose the unit that receives the Age tokens')}</>
      const count = new DeployEffectsHelper(rules.game).getChosenAgeTokens(me!, effect)
      const deployed = effect.among === WhichUnit.DeployedThisTurn
      if (count === 1) {
        return deployed ? (
          <Trans i18nKey="header.age-token.source.deployed.one" defaults="<0/>: place an Age token on a unit deployed this turn" components={card} />
        ) : (
          <Trans i18nKey="header.age-token.source.one" defaults="<0/>: place an Age token on a unit" components={card} />
        )
      }
      return deployed ? (
        <Trans
          i18nKey="header.age-token.source.deployed.many"
          defaults="<0/>: place {count} Age tokens on a unit deployed this turn"
          values={{ count }}
          components={card}
        />
      ) : (
        <Trans i18nKey="header.age-token.source.many" defaults="<0/>: place {count} Age tokens on a unit" values={{ count }} components={card} />
      )
    }
    case EffectType.ImproveBuilding:
      if (!card) return <>{t('header.improve.choose', 'Choose the level 1 building to improve to level 2')}</>
      return <Trans i18nKey="header.improve.source" defaults="<0/>: upgrade a level 1 Building to level 2" components={card} />
    case EffectType.MoveAgeToken:
      if (!card) return <>{t('header.move-age.choose', 'Move an Age token from one of your units to another one')}</>
      return <Trans i18nKey="header.move-age.source" defaults="<0/>: move an Age token from one of your Units to another" components={card} />
    case EffectType.ReactivateRevealEffects:
      if (!card) return <>{t('header.reactivate.choose', 'Choose the unit the Shadow reactivates')}</>
      return <Trans i18nKey="header.reactivate.source" defaults="<0/>: trigger a Unit again" components={card} />
  }
  if (rules.game.rule?.players?.length) {
    // A spectator: the Monarchs, not the other ones
    if (me === undefined) return <>{t('header.deploy-effects.spectator', 'The Monarchs apply their deployment effects')}</>
    return <>{t('header.deploy-effects.wait', 'The other Monarchs apply their deployment effects')}</>
  }
  return <>{t('header.deploy-effects', 'Deployment effects')}</>
}
