import { isChangeWarPower, isWarFromBacklane } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { howManyCardCopies, Unit } from '@gamepark/paper-tales/material/Unit'
import { LaneType, ResourcesCondition, unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { CustomMoveType, GainAgeTokenOnChosenUnitEffect } from '@gamepark/paper-tales/rules/CustomMoveType'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { MaterialHelpProps, PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { TFunction } from 'i18next'
import { Trans, useTranslation } from 'react-i18next'
import { tableButtonCss } from '../../theme/tableTheme'
import { BookPage } from './book/BookPage'
import { EffectLines } from './book/EffectLines'
import { effectStep } from './book/effectStep'
import { FactTags } from './book/FactTags'
import { helpIconComponents } from './book/helpIconComponents'
import { CoinIcon, ResourceIcon, StrengthIcon } from './book/HelpIcons'
import { LiveBox } from './book/LiveBox'
import { PrintedLine, PrintedText } from './book/PrintedText'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { SymbolLegend } from './book/SymbolLegend'
import { unitPrintedName } from './unitPrintedName'

/**
 * The help of a unit, as a page of the story book (validated mockup docs/mockups/help-book.html): the printed effect,
 * the facts of the card, the life of the card over the turn, and what concerns the player now.
 */
export const UnitHelp: FC<MaterialHelpProps> = (props) => {
  const { item, itemIndex } = props
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId()
  const ownerName = usePlayerName(item.location?.player)
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
  const inKingdom = item.location?.type === LocationType.PlayerUnitBoard && owner !== undefined && itemIndex !== undefined
  const tokens = inKingdom ? new AgeTokens(rules).count(itemIndex) : 0
  const front = item.location?.y === 0
  const strength = inKingdom ? new War(rules.game).getUnitPower(item, itemIndex) : pattern.power
  const dying = inKingdom && new AgeHelper(rules.game, owner!).isUnitDying(item, itemIndex)
  const resourceCondition = effects.find(isChangeWarPower)?.ifResource?.[0]
  const produced = resourceCondition !== undefined && owner !== undefined ? new ResourcesHelper(rules.game, owner).getResource(resourceCondition) : 0
  const conditional = effects.some(isChangeWarPower)

  const resources = pattern.resources?.type ?? []
  // The text printed on the card: an effect of a phase goes in the line of its phase; what is permanent (the production
  // scroll, an effect of no phase) stays at the top
  const effectTexts: ReactNode[][] = [[], [], [], [], [], [], []]
  const effectKeys: string[][] = [[], [], [], [], [], [], []]
  const printedLines: PrintedLine[] = []
  effects.forEach((effect, index) => {
    const key = effects.length > 1 ? `unit.effect.${unit}.${index + 1}` : `unit.effect.${unit}`
    if (!i18n.exists(key)) return
    const text = <Trans key={key} i18nKey={key} components={helpIconComponents} />
    const step = effectStep(effect)
    if (step === undefined) printedLines.push({ text })
    else {
      effectTexts[step].push(text)
      effectKeys[step].push(t(key))
    }
  })
  if (i18n.exists(`unit.production.${unit}`)) {
    printedLines.push({ production: true, text: <Trans i18nKey={`unit.production.${unit}`} components={helpIconComponents} /> })
  } else if (resources.length) {
    const condition = resourceConditionText(pattern.resources?.condition, t)
    printedLines.push({
      production: true,
      text: (
        <>
          {resources.map((resource, index) => (
            <ResourceIcon key={index} resource={resource} />
          ))}
          {condition && <> {condition}</>}
        </>
      )
    })
  }
  const printed = (step: number) =>
    effectTexts[step].length ? (
      <>
        <EffectLines lines={effectTexts[step]} />
        <SymbolLegend texts={effectKeys[step]} />
      </>
    ) : undefined

  // Each step: the printed effect of that phase, and what it means in the game now
  const timeline: TimelineStep[] = [
    { on: steps.has(0), text: printed(0) },
    { on: steps.has(1), text: printed(1) },
    {
      on: steps.has(2),
      text: printed(2),
      you: inKingdom ? <WarLine front={front || effects.some(isWarFromBacklane)} strength={strength} resource={resourceCondition} produced={produced} /> : undefined
    },
    { on: steps.has(3), text: printed(3) },
    { on: steps.has(4), text: printed(4) },
    {
      on: steps.has(5) || tokens > 0,
      text: printed(5) ?? (tokens > 0 ? t('help.unit.age.token', 'Already carries an Age token.') : undefined),
      you: dying ? t('help.unit.age.dies', 'Dies at the end of this turn.') : undefined
    }
  ]
  if (steps.has(6)) timeline.push({ on: true, text: printed(6) })

  // Two separate facts: where the unit stands (does it fight?) and its Age tokens (does it die?)
  const fightsFromBack = effects.some(isWarFromBacklane)
  const place = front ? 'help.unit.live.front' : fightsFromBack ? 'help.unit.live.back.fights' : 'help.unit.live.back'
  const age = !tokens ? 'help.unit.live.age.none' : dying ? 'help.unit.live.age.dies' : 'help.unit.live.age.survives'
  const liveLines: ReactNode[] = [
    t(place, front ? 'In the Front: fights.' : fightsFromBack ? 'In the Back: fights anyway.' : 'In the Back: does not fight.'),
    <Trans
      i18nKey={age}
      defaults={!tokens ? 'No Age token: gets one at the end of the turn.' : dying ? '{tokens} <age/>: dies at the end of the turn.' : '{tokens} <age/>: survives, and gets one more.'}
      values={{ tokens }}
      components={helpIconComponents}
    />
  ]
  return (
    <BookPage
      key={itemIndex}
      name={i18n.exists(`unit.name.${unit}`) ? t(`unit.name.${unit}`) : unitPrintedName(unit)}
      lede={<PrintedText lines={printedLines} />}
      facts={
        <>
          <FactTags
            tags={[
              { label: t('help.unit.cost', 'Cost'), icon: <CoinIcon />, value: pattern.cost },
              { label: t('help.unit.strength', 'Strength'), icon: <StrengthIcon value={`${pattern.power}${conditional ? '*' : ''}`} /> },
              { label: t('help.unit.copies.label', 'Copies'), value: howManyCardCopies(unit) }
            ]}
          />
        </>
      }
    >
      <PhaseTimeline steps={timeline} current={currentPhaseIndex(rules)} />
      {inKingdom && (
        <LiveBox title={owner === me ? t('help.live.kingdom', 'In your Kingdom') : t('help.live.kingdom.other', { defaultValue: 'In the Kingdom of {player}', player: ownerName })} lines={liveLines}>
          {chooseWhereToPlaceTokenMove && <PlayMoveButton css={tableButtonCss} move={chooseWhereToPlaceTokenMove} onPlay={props.closeDialog} />}
        </LiveBox>
      )}
    </BookPage>
  )
}

const WarLine: FC<{ front: boolean; strength: number; resource?: Resources; produced: number }> = ({ front, strength, resource, produced }) => {
  // front: the unit fights (in the Front, or in the Back for the units that fight from there)
  if (!front) return <Trans i18nKey="help.unit.war.back" defaults="In the Back: does not fight." />
  if (resource !== undefined) {
    return (
      <Trans
        i18nKey="help.unit.war.you.resource"
        defaults="The Kingdom produces {count} <res/>: counts for <s/>."
        values={{ count: produced }}
        components={{ res: <ResourceIcon resource={resource} />, s: <StrengthIcon value={strength} /> }}
      />
    )
  }
  return <Trans i18nKey="help.unit.war.you" defaults="Counts for <s/>." components={{ s: <StrengthIcon value={strength} /> }} />
}

/** The condition printed beside the produced resource (the scroll of the card), if any */
const resourceConditionText = (condition: ResourcesCondition | undefined, t: TFunction): string | undefined => {
  if (!condition) return undefined
  if (condition.perAgeToken) return t('help.unit.resources.per-age', 'per Age token')
  if (condition.ifAgeToken) return t('help.unit.resources.if-age', 'with an Age token')
  if (condition.onLane === LaneType.FrontLane) return t('help.unit.resources.front', 'in the Front')
  if (condition.onLane === LaneType.BackLane) return t('help.unit.resources.back', 'in the Back')
  return undefined
}
