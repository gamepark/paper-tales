import { css } from '@emotion/react'
import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCaracteristics } from '@gamepark/paper-tales/material/BuildingCaracteristics'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { BuildAction, BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { MaterialHelpProps, PlayMoveButton, useLegalMove, usePlayerId, useRules } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import building1 from '../../images/icons/printed-building-1.webp'
import building2 from '../../images/icons/printed-building-2.webp'
import { tableButtonCss } from '../../theme/tableTheme'
import { BookPage } from './book/BookPage'
import { EffectLines } from './book/EffectLines'
import { effectStep } from './book/effectStep'
import { FactTags } from './book/FactTags'
import { helpIconComponents } from './book/helpIconComponents'
import { CoinIcon, PrintedIcon, ResourceIcon } from './book/HelpIcons'
import { LiveBox } from './book/LiveBox'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { PrintedLine, PrintedText } from './book/PrintedText'

const levelIcons = [building1, building2]

/** A cost printed on the card: its resources, gold coins written as one coin with their number */
const Cost: FC<{ cost: Resources[] }> = ({ cost }) => {
  const gold = cost.filter((resource) => resource === Resources.Gold).length
  return (
    <>
      {cost
        .filter((resource) => resource !== Resources.Gold)
        .map((resource, index) => (
          <ResourceIcon key={index} resource={resource} />
        ))}
      {gold > 0 && helpIconComponents[`g${gold}` as keyof typeof helpIconComponents]}
    </>
  )
}

const CostOptions: FC<{ cost: Resources[]; alternate?: Resources[] }> = ({ cost, alternate }) => (
  <>
    <Cost cost={cost} />
    {alternate && (
      <>
        {' / '}
        <Cost cost={alternate} />
      </>
    )}
  </>
)

/**
 * The help of a building, as a page of the story book (validated mockup docs/mockups/help-book.html, Tavern): both
 * faces on the left page; on the right the costs of both levels, each printed effect in the line of its phase, and
 * what the player can build now, with the button.
 */
export const BuildingBookHelp: FC<MaterialHelpProps> = ({ item, itemIndex, closeDialog }) => {
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId()
  const building = item.id as Building
  const pattern = buildingCardCaracteristics[building]
  const owner = item.location?.player
  const mine = owner !== undefined && owner === me
  const built = item.location?.type === LocationType.PlayerBuildingBoard
  const level2 = built && !!item.location?.rotation

  const moveTo = (rotation: boolean, fromBoard: boolean) => (move: MaterialMove) =>
    isMoveItemType(MaterialType.Building)(move) &&
    move.itemIndex === itemIndex &&
    move.location.type === LocationType.PlayerBuildingBoard &&
    !!move.location.rotation === rotation &&
    built === fromBoard
  const buildLevel1 = useLegalMove(moveTo(false, false))
  const buildLevel2 = useLegalMove(moveTo(true, false))
  const upgrade = useLegalMove(moveTo(true, true))

  // The printed text of each level: an effect in the line of its phase, the production scroll at the top
  const effectTexts: ReactNode[][] = [[], [], [], [], [], [], []]
  const printedLines: PrintedLine[] = []
  ;[pattern.effect1, pattern.effect2].forEach((effects, level) => {
    const effect = effects?.[0]
    const key = `building.effect.${building}.${level + 1}`
    if (!effect || !i18n.exists(key)) return
    const step = effectStep(effect)
    const text = (
      <span key={key}>
        <PrintedIcon src={levelIcons[level]} /> <Trans i18nKey={key} components={helpIconComponents} />
      </span>
    )
    if (step === undefined) printedLines.push({ text })
    else effectTexts[step].push(text)
  })
  // The productions of both levels on one scroll line, each after the icon of its level
  const productions = [pattern.resources1, pattern.resources2].flatMap((resources, level) =>
    resources?.length ? [{ level, resources }] : []
  )
  if (productions.length) {
    printedLines.push({
      production: true,
      text: (
        <>
          {productions.map(({ level, resources }) => (
            <span key={level} css={productionLevelCss}>
              <PrintedIcon src={levelIcons[level]} />
              {resources.map((resource, index) => (
                <ResourceIcon key={index} resource={resource} />
              ))}
            </span>
          ))}
        </>
      )
    })
  }
  const printed = (step: number) => (effectTexts[step].length ? <EffectLines lines={effectTexts[step]} /> : undefined)

  const timeline: TimelineStep[] = [
    {},
    { text: t('help.building.slot', 'A level 2 Building gives a 5th spot, in the Front.') },
    { on: effectTexts[2].length > 0, text: printed(2) },
    { on: effectTexts[3].length > 0, text: printed(3) },
    {
      on: true,
      text: t(
        'help.building.rule',
        'One action: build at level 1, directly at level 2 (both costs) or upgrade (level 2 cost, no Landcost). Landcost: 2 gold per Building you have.'
      )
    },
    {},
    { on: true, text: <Trans i18nKey="help.building.end" defaults="<pl1/> at level 1, <pl3/> at level 2." components={helpIconComponents} /> }
  ]

  return (
    <BookPage
      key={itemIndex}
      name={t(`building.${building}`)}
      lede={<PrintedText lines={printedLines} rule={false} />}
      facts={
        <FactTags
          tags={[
            { label: t('help.building.cost1', 'Level 1'), icon: <CostOptions cost={pattern.cost1} alternate={pattern.cost1Alternate} /> },
            { label: t('help.building.cost2', 'Level 2'), icon: <CostOptions cost={pattern.cost2} alternate={pattern.cost2Alternate} /> }
          ]}
        />
      }
    >
      <PhaseTimeline steps={timeline} current={currentPhaseIndex(rules)} />
      {mine && !level2 && (
        <BuildLiveBox
          building={building}
          player={owner}
          built={built}
          buttons={[buildLevel1, buildLevel2, upgrade]}
          onBuild={closeDialog}
        />
      )}
    </BookPage>
  )
}

/** What the player can build now: the Landcost, their gold, and each construction with its price or what it lacks */
const BuildLiveBox: FC<{ building: Building; player: number; built: boolean; buttons: (MaterialMove | undefined)[]; onBuild?: () => void }> = ({
  onBuild,
  building,
  player,
  built,
  buttons: [buildLevel1, buildLevel2, upgrade]
}) => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const helper = new BuildHelper(rules.game, player)
  const produced = new ResourcesHelper(rules.game, player)
  const pattern = buildingCardCaracteristics[building]

  const missing = (cost: Resources[]) => {
    const counts = new Map<Resources, number>()
    for (const resource of cost) if (resource !== Resources.Gold) counts.set(resource, (counts.get(resource) ?? 0) + 1)
    return [...counts].flatMap(([resource, count]) => Array(Math.max(0, count - produced.getResource(resource))).fill(resource) as Resources[])
  }
  const line = (action: BuildAction, label: string, cost: Resources[], move?: MaterialMove) => {
    const gold = helper.getGoldToPay(building, action)
    if (gold !== undefined) {
      return (
        <span>
          {t(label, { gold })}
          {move && (
            <>
              {' '}
              <PlayMoveButton css={tableButtonCss} move={move} onPlay={onBuild}>
                {t('help.building.do', 'Build')}
              </PlayMoveButton>
            </>
          )}
        </span>
      )
    }
    const lacking = missing(cost)
    return lacking.length ? (
      <Trans
        i18nKey="help.building.lacking"
        defaults="{what}: you lack <res/>."
        values={{ what: t(`${label}.short`) }}
        components={{ res: <Cost cost={lacking} /> }}
      />
    ) : (
      t('help.building.no-gold', { defaultValue: '{what}: not enough gold.', what: t(`${label}.short`) })
    )
  }

  const lines: ReactNode[] = [
    built ? (
      <Trans key="gold" i18nKey="help.building.gold.upgrade" defaults="You have {gold} <coin/>. An upgrade pays no Landcost." values={{ gold: helper.gold }} components={{ coin: <CoinIcon /> }} />
    ) : (
      <Trans key="gold" i18nKey="help.building.gold" defaults="Landcost {land} gold. You have {gold} <coin/>." values={{ land: helper.fieldCost, gold: helper.gold }} components={{ coin: <CoinIcon /> }} />
    )
  ]
  if (built) lines.push(line(BuildAction.Upgrade, 'help.building.upgrade', pattern.cost2, upgrade))
  else {
    lines.push(line(BuildAction.BuildLevel1, 'help.building.level1', pattern.cost1, buildLevel1))
    lines.push(line(BuildAction.BuildLevel2, 'help.building.level2', [...pattern.cost1, ...pattern.cost2], buildLevel2))
  }
  return <LiveBox title={t('help.live.now', 'For you, now')} lines={lines} />
}

const productionLevelCss = css`
  & + & {
    margin-left: 0.8em;
  }
`
