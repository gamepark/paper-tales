import { Artifact } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { DeployCostHelper } from '@gamepark/paper-tales/rules/helpers/DeployCostHelper'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { artifactPrintedContent } from './book/artifactPrinted'
import { BookPage } from './book/BookPage'
import { FactTags } from './book/FactTags'
import { helpIconComponents } from './book/helpIconComponents'
import { LiveBox } from './book/LiveBox'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'

/**
 * The help of a Legendary Artifact (rulebook p.11), as a page of the story book like the units: what it does, and in my
 * hand what it would cost me now.
 */
export const ArtifactHelp: FC<MaterialHelpProps & { actions?: ReactNode[] }> = ({ item, itemIndex, actions }) => {
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const artifact = item.id as Artifact
  const { name, lines, facts, steps } = artifactPrintedContent(artifact, i18n)
  const owner = item.location?.player
  const inHand = item.location?.type === LocationType.PlayerUnitHand && owner !== undefined
  const live = inHand ? [<Trans key="cost" i18nKey="help.artifact.cost.now" defaults="Costs you <gold/> {cost} if deployed now." values={{ cost: new DeployCostHelper(rules.game, owner).costOf(artifact) }} components={helpIconComponents} />] : []
  return (
    <BookPage key={itemIndex} name={name} lede={<PrintedText lines={lines} />} facts={<FactTags tags={facts} />} actions={actions?.length ? actions : undefined}>
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
      {live.length > 0 && <LiveBox title={t('help.live.now', 'For you, now')} lines={live} />}
    </BookPage>
  )
}
