import { isChangeWarPower, isWarFromBacklane } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { CustomMoveType, GainAgeTokenOnChosenUnitEffect } from '@gamepark/paper-tales/rules/CustomMoveType'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { MaterialHelpProps, PlayMoveButton, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType, MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { tableButtonCss } from '../../theme/tableTheme'
import { BookPage } from './book/BookPage'
import { FactTags } from './book/FactTags'
import { HiddenUnitHelp } from './HiddenUnitHelp'
import { helpIconComponents } from './book/helpIconComponents'
import { ResourceIcon, StrengthIcon } from './book/HelpIcons'
import { LiveBox } from './book/LiveBox'
import { PrintedText } from './book/PrintedText'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline } from './book/PhaseTimeline'
import { unitPrintedContent } from './book/unitPrinted'

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
  if (unit === undefined) return <HiddenUnitHelp {...props} />

  const pattern = unitCardCaracteristics[unit]
  const effects = pattern.effect ?? []
  const owner = item.location?.player
  const inKingdom = item.location?.type === LocationType.PlayerUnitBoard && owner !== undefined && itemIndex !== undefined
  const tokens = inKingdom ? new AgeTokens(rules).count(itemIndex) : 0
  const front = item.location?.y === 0
  const strength = inKingdom ? new War(rules.game).getUnitPower(item, itemIndex) : pattern.power
  const dying = inKingdom && new AgeHelper(rules.game, owner!).isUnitDying(item, itemIndex)
  const resourceCondition = effects.find(isChangeWarPower)?.ifResource?.[0]
  const produced = resourceCondition !== undefined && owner !== undefined ? new ResourcesHelper(rules.game, owner).getResource(resourceCondition) : 0

  // What the card says whatever the game, then what it means in the game now on the war and the aging steps
  const { name, lines, facts, steps } = unitPrintedContent(unit, i18n)
  if (inKingdom) {
    steps[2].you = <WarLine front={front || effects.some(isWarFromBacklane)} strength={strength} resource={resourceCondition} produced={produced} />
  }
  if (tokens > 0) {
    steps[5].on = true
    steps[5].text ??= t('help.unit.age.token', 'Already carries an Age token.')
  }
  if (dying) steps[5].you = t('help.unit.age.dies', 'Dies at the end of this turn.')

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
    <BookPage key={itemIndex} name={name} lede={<PrintedText lines={lines} />} facts={<FactTags tags={facts} />}>
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
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
