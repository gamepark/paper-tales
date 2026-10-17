import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BookPage } from './book/BookPage'
import { helpIconComponents } from './book/helpIconComponents'
import { LiveBox } from './book/LiveBox'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'
import { unitPrintedName } from './unitPrintedName'

/** The help of an Age token: how units age and die (rulebook p.8), and what it means for the unit it sits on */
export const AgeTokenHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId()
  const owner = item.location?.player
  const ownerName = usePlayerName(owner)
  const unitIndex = item.location?.type === LocationType.OnCard ? item.location.parent : undefined
  const unit = unitIndex !== undefined ? rules.material(MaterialType.Unit).getItem<Unit>(unitIndex) : undefined
  const tokens = unitIndex !== undefined ? new AgeTokens(rules).count(unitIndex) : 0
  const dying = unit !== undefined && unitIndex !== undefined && owner !== undefined && new AgeHelper(rules.game, owner).isUnitDying(unit, unitIndex)

  const steps: TimelineStep[] = [
    {},
    {
      on: true,
      text: <Trans i18nKey="help.age.deploy" defaults="Some card effects add an Age token (<ageplus/>) on a Unit." components={helpIconComponents} />
    },
    {},
    {},
    {},
    {
      on: true,
      text: t(
        'help.age.aging',
        'All Units that already have one or more Age tokens on them die: they are discarded with all the Age tokens placed on them. Then add one Age token on each Unit that is still in play.'
      ),
      you: dying ? t('help.unit.age.dies', 'Dies at the end of this turn.') : undefined
    },
    { on: true, text: t('help.age.end', 'Relics grant Legend points for each Age token they carry.') }
  ]
  const unitName = unit?.id !== undefined ? (i18n.exists(`unit.name.${unit.id}`) ? t(`unit.name.${unit.id}`) : unitPrintedName(unit.id)) : undefined
  const age = dying ? 'help.unit.live.age.dies' : 'help.unit.live.age.survives'
  return (
    <BookPage
      name={t('help.age.name', 'Age token')}
      lede={
        <PrintedText
          lines={[
            {
              text: t('help.age.lede', 'Put on every Unit still in play at the end of the turn. A Unit that already carries one dies at the next Aging phase.')
            }
          ]}
          rule={false}
        />
      }
    >
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
      {unitName && (
        <LiveBox
          title={
            owner === me
              ? t('help.live.kingdom', 'In your Kingdom')
              : t('help.live.kingdom.other', { defaultValue: 'In the Kingdom of {player}', player: ownerName })
          }
          lines={[
            t('help.age.on', { defaultValue: 'On {unit}.', unit: unitName }),
            <Trans
              key="age"
              i18nKey={age}
              defaults={dying ? '{tokens} <age/>: dies at the end of the turn.' : '{tokens} <age/>: survives, and gets one more.'}
              values={{ tokens }}
              components={helpIconComponents}
            />
          ]}
        />
      )}
    </BookPage>
  )
}
