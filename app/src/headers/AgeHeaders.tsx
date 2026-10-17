import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { CustomMoveType } from '@gamepark/paper-tales/rules/CustomMoveType'
import { PlayMoveButton, useLegalMove, usePlayerId, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove, MaterialRules } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'

/**
 * Age (rulebook p.8), resolved at once: the effects that apply to the dying units, then the units that already had an
 * Age token die, then the others receive one
 */
export const AgeEffectsHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.age.effects', 'Age: the effects of the dying units')}</>
}

export const AgeUnitsDieHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.age.die', 'Age: the units with an Age token die')}</>
}

export const AgeUnitsAgeHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.age.age', 'Age: the other units receive an Age token')}</>
}

/** Before the Age, a mystic effect lets a Monarch save units from dying */
export const SaveUnitsWithMysticEffectHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()!
  const me = usePlayerId<PlayerColor>()
  const saveNobody = useLegalMove<MaterialMove>(isCustomMoveType(CustomMoveType.SaveNobody))
  if (me === undefined || !rules.isTurnToPlay(me)) return <>{t('header.age.save.wait', 'A Monarch chooses a unit to save from dying')}</>
  return (
    <Trans i18nKey="header.age.save" defaults="Choose the unit your mystic saves from dying, or <0>save nobody</0>">
      <PlayMoveButton move={saveNobody} />
    </Trans>
  )
}

export const NextTurnHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.next-turn', 'A new turn begins')}</>
}

export const EndGameHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.end', 'End of the game')}</>
}
