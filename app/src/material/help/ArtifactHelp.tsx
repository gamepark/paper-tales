import { css } from '@emotion/react'
import { Artifact } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialHelpProps, usePlayerId, useRules } from '@gamepark/react-game'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { artifactCostLocations, getArtifactCost } from '../../locators/artifactCost'
import { artifactPrintedContent } from './book/artifactPrinted'
import { BookPage } from './book/BookPage'
import { FactTags } from './book/FactTags'
import { CoinIcon } from './book/HelpIcons'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'

/**
 * The help of a Legendary Artifact (rulebook p.11), as a page of the story book like the units: what it does, and in my
 * hands what it would cost me now, with how it is computed.
 */
export const ArtifactHelp: FC<MaterialHelpProps & { actions?: ReactNode[] }> = ({ item, itemIndex, actions }) => {
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const artifact = item.id as Artifact
  const { name, lines, facts, steps } = artifactPrintedContent(artifact, i18n)
  const me = usePlayerId()
  // In my hands, the real cost of the moment instead of the rule, which a note under the facts explains
  const inMyHand = item.location?.player === me && artifactCostLocations.includes(item.location?.type as LocationType)
  const cost = inMyHand && itemIndex !== undefined ? getArtifactCost(rules, itemIndex) : undefined
  if (cost !== undefined) facts[0] = { ...facts[0], icon: <CoinIcon />, value: cost }
  const note = cost !== undefined && (
    <p css={noteCss}>{t('help.artifact.cost.note', { defaultValue: 'Cost = 1 + the Artifacts already deployed, here {count}', count: cost - 1 })}</p>
  )
  return (
    <BookPage
      key={itemIndex}
      name={name}
      lede={<PrintedText lines={lines} />}
      facts={
        <>
          <FactTags tags={facts} />
          {note}
        </>
      }
      actions={actions?.length ? actions : undefined}
    >
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
    </BookPage>
  )
}

/** How the cost is computed, under the facts, in the quiet style of the note under the production */
const noteCss = css`
  margin: -0.4em 0 0.8em;
  font-family: 'Mulish', sans-serif;
  font-style: italic;
  font-weight: 500;
  font-size: 0.85em;
  color: #7a6f67;
`
