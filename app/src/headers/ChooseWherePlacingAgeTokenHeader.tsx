import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'

/**
 * A deployment effect lets a Monarch choose the unit that receives Age tokens: the button is on each eligible unit
 */
export const ChooseWherePlacingAgeTokenHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId<PlayerColor>()
  if (me !== undefined && rules.isTurnToPlay(me)) return <>{t('header.age-token.choose', 'Choose the unit that receives the Age tokens')}</>
  return <>{t('header.age-token.wait', 'A Monarch chooses where to place Age tokens')}</>
}
