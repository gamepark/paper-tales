import { Building } from '@gamepark/paper-tales/material/Building'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { BuildAction, BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { MaterialHelpProps, useLegalMove, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItemType, MaterialMove } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BuildIcon } from '../icons/PaperIcons'
import { BookPage } from './book/BookPage'
import { buildingPrintedContent } from './book/buildingPrinted'
import { Cost } from './book/Cost'
import { FactTags } from './book/FactTags'
import { HelpActionButton } from './book/HelpActionButton'
import { CoinIcon } from './book/HelpIcons'
import { LiveBox } from './book/LiveBox'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'

/**
 * The help of a building, as a page of the story book (validated mockup docs/mockups/help-book.html, Tavern): both
 * faces on the left page; on the right the costs of both levels, each printed effect in the line of its phase, and
 * what the player can build now, with the button.
 */
export const BuildingBookHelp: FC<MaterialHelpProps> = ({ item, itemIndex, closeDialog }) => {
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId()
  const ownerName = usePlayerName(item.location?.player)
  const building = item.id as Building
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

  const { name, lines, facts, steps } = buildingPrintedContent(building, i18n)
  return (
    <BookPage key={itemIndex} name={name} lede={<PrintedText lines={lines} rule={false} />} facts={<FactTags tags={facts} />}>
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
      {mine && (
        <BuildLiveBox
          building={building}
          player={owner}
          built={built}
          level2={level2}
          buttons={[buildLevel1, buildLevel2, upgrade]}
          onBuild={closeDialog}
        />
      )}
      {!mine && owner !== undefined && (
        <LiveBox
          title={t('help.live.kingdom.other', { defaultValue: 'In the Kingdom of {player}', player: ownerName })}
          lines={[t(level2 ? 'help.building.state.2' : built ? 'help.building.state.1' : 'help.building.state.0')]}
        />
      )}
    </BookPage>
  )
}

/** What the player can build now: the Landcost, their gold, and each construction with its price or what it lacks */
const BuildLiveBox: FC<{
  building: Building
  player: number
  built: boolean
  level2: boolean
  buttons: (MaterialMove | undefined)[]
  onBuild?: () => void
}> = ({
  onBuild,
  building,
  player,
  built,
  level2,
  buttons: [buildLevel1, buildLevel2, upgrade]
}) => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const helper = new BuildHelper(rules.game, player)
  const produced = new ResourcesHelper(rules.game, player)

  // The resources a cost lacks (they are never spent: the kingdom must produce them)
  const missing = (cost: Resources[]) => {
    const counts = new Map<Resources, number>()
    for (const resource of cost) if (resource !== Resources.Gold) counts.set(resource, (counts.get(resource) ?? 0) + 1)
    return [...counts].flatMap(([resource, count]) => Array(Math.max(0, count - produced.getResource(resource))).fill(resource) as Resources[])
  }
  const land = built ? 0 : helper.fieldCost
  const lacks = (what: string, options: Resources[][]) => {
    // A way to pay that only lacks gold (the Temple can be paid in gold): say how much gold is missing
    const goldOnly = options.filter((cost) => !missing(cost).length).map((cost) => land + cost.filter((r) => r === Resources.Gold).length - helper.gold)
    const resources = missing(options[0])
    const values = { what, gold: goldOnly.length ? Math.min(...goldOnly) : 0 }
    if (goldOnly.length && resources.length) {
      return <Trans i18nKey="help.building.lacking.or-gold" defaults="{what}: you lack <res/>, or {gold} <coin/>." values={values} components={{ res: <Cost cost={resources} />, coin: <CoinIcon /> }} />
    }
    if (goldOnly.length) return <Trans i18nKey="help.building.lacking.gold" defaults="{what}: you lack {gold} <coin/>." values={values} components={{ coin: <CoinIcon /> }} />
    return <Trans i18nKey="help.building.lacking" defaults="{what}: your Kingdom lacks <res/>." values={values} components={{ res: <Cost cost={resources} /> }} />
  }
  const line = (action: BuildAction, label: string, level: number, move?: MaterialMove) => {
    const what = t(label)
    const gold = helper.getGoldToPay(building, action)
    if (gold === undefined) return lacks(what, helper.getCostOptions(building, action))
    return (
      <span>
        <Trans i18nKey="help.building.price" defaults="{what}: {gold} <coin/> in all." values={{ what, gold }} components={{ coin: <CoinIcon /> }} />
        {move && (
          <>
            {' '}
            <HelpActionButton move={move} icon={<BuildIcon />} level={level} onPlay={onBuild}>
              {t('help.building.do', 'Build')}
            </HelpActionButton>
          </>
        )}
      </span>
    )
  }

  // Where the building stands in the kingdom, then what each construction costs in all
  const state = level2 ? 'help.building.state.2' : built ? 'help.building.state.1' : 'help.building.state.0'
  const lines: ReactNode[] = [
    <Trans key="state" i18nKey={state} defaults={level2 ? 'Built at level 2.' : built ? 'Built at level 1.' : 'Not built yet.'} />,
    <Trans key="gold" i18nKey="help.building.gold" defaults="You have {gold} <coin/>." values={{ gold: helper.gold }} components={{ coin: <CoinIcon /> }} />
  ]
  if (level2) return <LiveBox title={t('help.live.now', 'For you, now')} lines={lines.slice(0, 1)} />
  // The same hammer and level badge as the buttons on the card
  if (built) lines.push(line(BuildAction.Upgrade, 'help.building.upgrade', 2, upgrade))
  else {
    lines.push(line(BuildAction.BuildLevel1, 'help.building.level1', 1, buildLevel1))
    lines.push(line(BuildAction.BuildLevel2, 'help.building.level2', 2, buildLevel2))
  }
  return <LiveBox title={t('help.live.now', 'For you, now')} lines={lines} />
}
