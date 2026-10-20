import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { FC, Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import legendScroll from '../images/icons/legend-scroll.webp'
import { phaseIcons } from '../material/help/book/phaseIcons'
import { teal } from '../theme/journal'
import { cutLine } from '../theme/tableTheme'
import { asideCss, phaseBannerCss } from './logs.css'

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

export const DeployPhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={1} />
export const IncomePhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={3} />
export const BuildPhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={4} />
export const AgePhaseLog: FC<MaterialLogProps> = () => <PhaseBanner phase={5} />

/** The end of the game: the points of the buildings, the relics and the Legendary Artifacts are added (rulebook p.8) */
export const EndPhaseLog: FC<MaterialLogProps> = () => {
  const { t } = useTranslation()
  return <Banner color={cutLine} icon={legendScroll} label={t('log.end', 'Final scoring')} />
}

/** The wars begin: the banner, then the strength of every kingdom read on the game before they are fought */
export const WarPhaseLog: FC<MaterialLogProps> = ({ context }) => {
  const { t } = useTranslation()
  const rules = new PaperTalesRules(context.game)
  const war = new War(context.game)
  return (
    <>
      <PhaseBanner phase={2} />
      <span css={asideCss}>
        {t('log.war.strengths', 'Strengths:')}{' '}
        {rules.players.map((player, index) => (
          <Fragment key={player}>
            {index > 0 && ', '}
            <Strength player={player} power={war.getPlayerPower(player)} />
          </Fragment>
        ))}
      </span>
    </>
  )
}

const Strength: FC<{ player: number; power: number }> = ({ player, power }) => {
  const name = usePlayerName(player)
  return (
    <>
      {name} {power}
    </>
  )
}
