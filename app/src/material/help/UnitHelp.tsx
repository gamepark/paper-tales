import { isDeploymentType } from '@gamepark/paper-tales/material/effects/2_DeploymentEffects'
import { isChangeWarPower, isWarType } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { isIncomeType } from '@gamepark/paper-tales/material/effects/4_IncomeEffects'
import { isBuildEffect } from '@gamepark/paper-tales/material/effects/5_Build'
import { isAgeEffect } from '@gamepark/paper-tales/material/effects/6_AgeEffects'
import { isRelicEffect } from '@gamepark/paper-tales/material/effects/7_EndGameEffects'
import { Effect } from '@gamepark/paper-tales/material/effects/Effect'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { howManyCardCopies, Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { CustomMoveType, GainAgeTokenOnChosenUnitEffect } from '@gamepark/paper-tales/rules/CustomMoveType'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { MaterialHelpProps, PlayMoveButton, useLegalMove, usePlayerId, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { tableButtonCss } from '../../theme/tableTheme'
import { BookPage } from './book/BookPage'
import { FactTags } from './book/FactTags'
import { helpIconComponents } from './book/helpIconComponents'
import { CoinIcon, ResourceIcon, StrengthIcon } from './book/HelpIcons'
import { LiveBox } from './book/LiveBox'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { unitPrintedName } from './unitPrintedName'

/** The step of the turn (0 to 5, 6 for the end of the game) an effect of a card acts at */
const effectStep = (effect: Effect) => {
  if (isDeploymentType(effect)) return 1
  if (isWarType(effect)) return 2
  if (isIncomeType(effect)) return 3
  if (isBuildEffect(effect)) return 4
  if (isAgeEffect(effect)) return 5
  if (isRelicEffect(effect)) return 6
  return undefined
}

/**
 * The help of a unit, as a page of the story book (validated mockup docs/mockups/help-book.html): the printed effect,
 * the facts of the card, the life of the card over the turn, and what concerns the player now.
 */
export const UnitHelp: FC<MaterialHelpProps> = (props) => {
  const { item, itemIndex } = props
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId()
  const chooseWhereToPlaceTokenMove = useLegalMove((move: MaterialMove) => {
    if (!isCustomMoveType(CustomMoveType.GainAgeTokenOnChosenUnitEffect)(move)) return false
    return (move.data as GainAgeTokenOnChosenUnitEffect).unitIndex === itemIndex
  })
  const unit = item.id as Unit | undefined
  if (unit === undefined) return <BookPage name={t('help.unit.hidden', 'Face-down card')}>{null}</BookPage>

  const pattern = unitCardCaracteristics[unit]
  const effects = pattern.effect ?? []
  const steps = new Set(effects.map(effectStep))
  const owner = item.location?.player
  const inMyKingdom = item.location?.type === LocationType.PlayerUnitBoard && owner === me && itemIndex !== undefined
  const tokens = inMyKingdom ? new AgeTokens(rules).count(itemIndex) : 0
  const front = item.location?.y === 0
  const strength = inMyKingdom ? new War(rules.game).getUnitPower(item, itemIndex) : pattern.power
  const dying = inMyKingdom && new AgeHelper(rules.game, owner!).isUnitDying(item, itemIndex)
  const resourceCondition = effects.find(isChangeWarPower)?.ifResource?.[0]
  const produced = resourceCondition !== undefined && owner !== undefined ? new ResourcesHelper(rules.game, owner).getResource(resourceCondition) : 0
  const conditional = effects.some(isChangeWarPower)

  const timeline: TimelineStep[] = [
    { text: t('help.unit.draft', 'Received at the draft.') },
    { on: steps.has(1), text: t('help.unit.reveal', { defaultValue: 'Revealed: you pay {cost} gold.', cost: pattern.cost }) },
    {
      on: steps.has(2),
      text: steps.has(2)
        ? t('help.unit.war.rule', 'Only the strength of the Front units counts, against each of your neighbours.')
        : t('help.unit.war.strength', { defaultValue: 'Strength {strength} if it is in the Front.', strength: pattern.power }),
      you: inMyKingdom && steps.has(2) ? <WarLine front={front} strength={strength} resource={resourceCondition} produced={produced} /> : undefined
    },
    { on: steps.has(3) },
    { on: steps.has(4) },
    {
      on: steps.has(5) || tokens > 0,
      text: tokens > 0 ? t('help.unit.age.token', 'It already carries an Age token.') : undefined,
      you: dying ? t('help.unit.age.dies', 'It dies at the end of this turn.') : undefined
    }
  ]
  if (steps.has(6)) timeline.push({ on: true })

  const resources = pattern.resources?.type ?? []
  const liveLines: ReactNode[] = [
    tokens ? (
      <Trans
        i18nKey={front ? 'help.unit.live.front.age' : 'help.unit.live.back.age'}
        defaults={front ? 'In the Front, {tokens} <age/>.' : 'In the Back, {tokens} <age/>.'}
        values={{ tokens }}
        components={helpIconComponents}
      />
    ) : (
      t(front ? 'help.unit.live.front' : 'help.unit.live.back', front ? 'In the Front, no Age token.' : 'In the Back, no Age token.')
    )
  ]
  if (resourceCondition !== undefined) {
    liveLines.push(
      <Trans
        i18nKey="help.unit.live.produces"
        defaults="Your Kingdom produces {count} <res/>."
        values={{ count: produced }}
        components={{ res: <ResourceIcon resource={resourceCondition} /> }}
      />
    )
  }

  return (
    <BookPage
      key={itemIndex}
      name={unitPrintedName(unit)}
      lede={i18n.exists(`unit.effect.${unit}`) ? <Trans i18nKey={`unit.effect.${unit}`} components={helpIconComponents} /> : undefined}
      facts={
        <FactTags
          tags={[
            { label: t('help.unit.cost', 'Cost'), icon: <CoinIcon />, value: pattern.cost },
            { label: t('help.unit.strength', 'Strength'), icon: <StrengthIcon value={`${pattern.power}${conditional ? '*' : ''}`} /> },
            ...(resources.length
              ? [{ label: t('help.unit.resources', 'Produces'), icon: resources.map((resource, index) => <ResourceIcon key={index} resource={resource} />) }]
              : []),
            { label: t('help.unit.copies.label', 'Copies'), value: howManyCardCopies(unit) }
          ]}
        />
      }
    >
      <PhaseTimeline steps={timeline} current={currentPhaseIndex(rules)} />
      {inMyKingdom && (
        <LiveBox title={t('help.live.kingdom', 'In your Kingdom')} lines={liveLines}>
          {chooseWhereToPlaceTokenMove && <PlayMoveButton css={tableButtonCss} move={chooseWhereToPlaceTokenMove} />}
        </LiveBox>
      )}
    </BookPage>
  )
}

const WarLine: FC<{ front: boolean; strength: number; resource?: Resources; produced: number }> = ({ front, strength, resource, produced }) => {
  if (!front) return <Trans i18nKey="help.unit.war.back" defaults="In the Back, it does not fight." />
  if (resource !== undefined) {
    return (
      <Trans
        i18nKey="help.unit.war.you.resource"
        defaults="Your Kingdom produces {count} <res/>: it counts for {strength}."
        values={{ count: produced, strength }}
        components={{ res: <ResourceIcon resource={resource} /> }}
      />
    )
  }
  return <Trans i18nKey="help.unit.war.you" defaults="It counts for {strength}." values={{ strength }} />
}
