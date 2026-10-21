import { isChangeWarPower, isWarFromBacklane } from '@gamepark/paper-tales/material/effects/3_WarEffects'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { Card, isArtifact } from '@gamepark/paper-tales/material/Artifact'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { AgeHelper } from '@gamepark/paper-tales/rules/helpers/AgeHelper'
import { AgeTokens } from '@gamepark/paper-tales/rules/helpers/AgeTokens'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { MaterialHelpProps, useLegalMoves, useMaterialContext, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { isWarView } from '../../locators/TableLayout'
import { UnitActionLabel } from '../actions/UnitActionLabel'
import { getUnitActions, UnitAction, unitActionIcons, unitActions } from '../actions/UnitActions'
import { HelpActionButton } from './book/HelpActionButton'
import { BookPage } from './book/BookPage'
import { FactTags } from './book/FactTags'
import { ArtifactHelp } from './ArtifactHelp'
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
  const context = useMaterialContext()
  const legalMoves = useLegalMoves()
  // The same actions as the buttons on the card, with their icons and words
  const actions = itemIndex !== undefined ? getUnitActions(legalMoves, itemIndex, isWarView(context)) : {}
  const available = unitActions.filter((action) => actions[action])
  const actionButtons = available.map((action) => {
    const Icon = unitActionIcons[action]
    return (
      <HelpActionButton key={action} move={actions[action]!} icon={<Icon />} onPlay={props.closeDialog}>
        <UnitActionLabel action={action} />
      </HelpActionButton>
    )
  })
  const card = item.id as Card | undefined
  if (card === undefined) return <HiddenUnitHelp {...props} />
  if (isArtifact(card)) return <ArtifactHelp {...props} actions={actionButtons} />
  const unit = card

  const pattern = unitCardCaracteristics[unit]
  const effects = pattern.effect ?? []
  const owner = item.location?.player
  const inKingdom = item.location?.type === LocationType.PlayerUnitBoard && owner !== undefined && itemIndex !== undefined
  const tokens = inKingdom ? new AgeTokens(rules).count(itemIndex) : 0
  const front = item.location?.y === 0
  // The unit as it lies in the kingdom, with its location
  const boardItem = inKingdom ? rules.material(MaterialType.Unit).getItem(itemIndex) : undefined
  const strength = inKingdom && boardItem ? new War(rules.game).getUnitPower(boardItem, itemIndex) : pattern.power
  const dying = inKingdom && !!boardItem && new AgeHelper(rules.game, owner!).isUnitDying(boardItem, itemIndex)
  const resourceCondition = effects.find(isChangeWarPower)?.ifResource?.[0]
  const produced = resourceCondition !== undefined && owner !== undefined ? new ResourcesHelper(rules.game, owner).getResource(resourceCondition) : 0

  // What the card says whatever the game, then what it means in the game now on the war and the aging steps
  const { name, lines, facts, steps } = unitPrintedContent(unit, i18n)
  if (inKingdom) {
    steps[2].you = <WarLine front={front || effects.some(isWarFromBacklane)} strength={strength} resource={resourceCondition} produced={produced} />
  }
  if (tokens > 0) {
    steps[5].on = true
    steps[5].text ??= <Trans i18nKey="help.unit.age.token" defaults="Already carries <age/>." components={helpIconComponents} />
  }
  if (dying) steps[5].you = t('help.unit.age.dies', 'Dies in the Aging phase of this turn.')
  return (
    <BookPage
      key={itemIndex}
      name={name}
      lede={<PrintedText lines={lines} />}
      facts={<FactTags tags={facts} />}
      actions={actionButtons}
    >
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
      {actions[UnitAction.AddAge] && (
        <LiveBox title={t('help.live.now', 'For you, now')} lines={[t('help.unit.age.choose', 'The Age tokens of the effect can go on this unit.')]} />
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
