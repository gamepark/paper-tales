import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { MaterialLogProps } from '@gamepark/react-game'
import { MaterialGame } from '@gamepark/rules-api'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import legendScroll from '../images/icons/legend-scroll.webp'
import { phaseIcons } from '../material/help/book/phaseIcons'
import { teal } from '../theme/journal'
import { cutLine } from '../theme/tableTheme'
import { asideCss, phaseBannerCss } from './logs.css'
import { WarDuels } from './WarLog'

/** The colours of the arrow banners of the rulebook, by phase (p.5 to 8) */
const bannerColors = ['#5a8a6a', teal, '#b5481f', '#7b4a24', '#7b4a24', '#3f8f99']

/** The arrow banner of the rulebook, with an icon */
const Banner: FC<{ color: string; icon: string; label: string }> = ({ color, icon, label }) => (
  <span css={phaseBannerCss(color)}>
    <img src={icon} alt="" />
    {label}
  </span>
)

/** A phase begins: the banner with the icon and the name of the phase (index 0 to 5) */
const PhaseBanner: FC<{ phase: number }> = ({ phase }) => {
  const { t } = useTranslation()
  return <Banner color={bannerColors[phase]} icon={phaseIcons[phase]} label={t(`phase.${phase + 1}`)} />
}

/**
 * The recruitment begins: the banner, then the cards dealt to each Monarch and where the hands pass (rulebook p.5), read
 * on the game once the cards are dealt. What each Monarch keeps is secret: nothing else is told.
 */
const RecruitPhase: FC<{ game: MaterialGame }> = ({ game }) => {
  const { t } = useTranslation()
  const rules = new PaperTalesRules(game)
  const count = rules.material(MaterialType.Unit).location(LocationType.PlayerDraftHand).player(rules.players[0]).length
  const turn = rules.remind<number>(Memory.Time)
  const pass =
    rules.players.length === 2
      ? t('log.draft.two-players', 'keep one, discard one, pass the others')
      : turn % 2 === 1
        ? t('header.pass.left', 'The cards pass to the left')
        : t('header.pass.right', 'The cards pass to the right')
  return (
    <>
      <PhaseBanner phase={0} />
      <span css={asideCss}>
        {t('log.draft.dealt', { defaultValue: '{count} cards each', count })} · {pass}
      </span>
    </>
  )
}

export const RecruitPhaseLog: FC<MaterialLogProps> = ({ context }) => <RecruitPhase game={context.game} />

/** The recruitment of the first turn begins with the game: a line of the setup */
export const RecruitPhaseSetupLog: FC<{ game: MaterialGame }> = ({ game }) => <RecruitPhase game={game} />

export const DeployPhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={1} />
export const IncomePhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={3} />
export const BuildPhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={4} />
export const AgePhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={5} />

/** The end of the game: the points of the buildings, the relics and the Legendary Artifacts are added (rulebook p.8) */
export const EndPhaseLog: FC<MaterialLogProps> = () => {
  const { t } = useTranslation()
  return <Banner color={cutLine} icon={legendScroll} label={t('log.end', 'Final scoring')} />
}

/** The wars begin: the banner, then each war with both strengths and who wins */
export const WarPhaseLog: FC<MaterialLogProps> = ({ context }) => (
  <>
    <PhaseBanner phase={2} />
    <WarDuels game={context.game} />
  </>
)
