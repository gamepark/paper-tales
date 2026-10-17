import { css } from '@emotion/react'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { EndScoreHelper } from '@gamepark/paper-tales/rules/helpers/EndScoreHelper'
import { ScoringDescription } from '@gamepark/react-game'
import { Trans } from 'react-i18next'
import gold from '../images/tokens/Gold1.jpg'
import { AgeIcon, BuildIcon, LegendIcon, NeighboursIcon } from '../material/icons/PaperIcons'
import { ScoringHeader as Header } from './ScoringHeader'

enum ScoringKey {
  /** Wars, deployment and age effects: everything scored during the 4 turns */
  DuringGame = 1,
  Buildings,
  Relics,
  Total,
  /** The tie breaker (rulebook p.8) */
  Gold
}

/**
 * The end screen (rulebook p.8): the points scored during the game, then those added at the end (built buildings,
 * relics), the total, and the gold left that breaks a tie. Every line is headed by the icon of the game it stands
 * for, with its name under it. Everything is computed from the table.
 */
export class PaperTalesScoring implements ScoringDescription<PlayerColor, PaperTalesRules, ScoringKey> {
  getScoringKeys(rules: PaperTalesRules) {
    const relics = rules.players.some((player) => new EndScoreHelper(rules.game, player).relicsPoints > 0)
    return [ScoringKey.DuringGame, ScoringKey.Buildings, ...(relics ? [ScoringKey.Relics] : []), ScoringKey.Total, ScoringKey.Gold]
  }

  getScoringHeader(key: ScoringKey) {
    switch (key) {
      case ScoringKey.DuringGame:
        return (
          <Header icon={<NeighboursIcon />}>
            <Trans i18nKey="scoring.during-game" defaults="Wars and effects" />
          </Header>
        )
      case ScoringKey.Buildings:
        return (
          <Header icon={<BuildIcon />}>
            <Trans i18nKey="scoring.buildings" defaults="Buildings" />
          </Header>
        )
      case ScoringKey.Relics:
        return (
          <Header icon={<AgeIcon />}>
            <Trans i18nKey="scoring.relics" defaults="Relics" />
          </Header>
        )
      case ScoringKey.Total:
        return (
          <Header icon={<LegendIcon />} strong>
            <Trans i18nKey="scoring.total" defaults="Legend points" />
          </Header>
        )
      case ScoringKey.Gold:
        return (
          <Header icon={<img src={gold} alt="" css={coinCss} />} muted>
            <Trans i18nKey="scoring.gold" defaults="Gold left, breaks a tie" />
          </Header>
        )
    }
  }

  getScoringPlayerData(key: ScoringKey, player: PlayerColor, rules: PaperTalesRules) {
    const endScore = new EndScoreHelper(rules.game, player)
    const total = rules.getScore(player)
    switch (key) {
      case ScoringKey.DuringGame:
        return total - endScore.points
      case ScoringKey.Buildings:
        return endScore.buildingsPoints
      case ScoringKey.Relics:
        return endScore.relicsPoints
      case ScoringKey.Total:
        return <span css={totalCss}>{total}</span>
      case ScoringKey.Gold:
        return <span css={mutedCss}>{new BuildHelper(rules.game, player).gold}</span>
    }
  }
}

const totalCss = css`
  font-weight: 800;
`

const mutedCss = css`
  font-style: italic;
  opacity: 0.75;
`

/** The coin, outlined like the paper icons around it: a white fringe, then a dark line */
const coinCss = css`
  width: 1.3em;
  height: 1.3em;
  border-radius: 50%;
  box-shadow:
    0 0 0 0.04em #fffdf8,
    0 0 0 0.09em #2e2a26;
`
