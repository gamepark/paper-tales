/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { ScoreHelper } from '@gamepark/paper-tales/rules/helpers/ScoreHelper'
import { Player } from '@gamepark/react-client'
import { Avatar, PlayerTimer, usePlay, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialMoveBuilder, MaterialRules } from '@gamepark/rules-api'
import { FC, HTMLAttributes, useMemo } from 'react'
import panelBg from '../images/panel-bg.jpg'
import pawn_black from '../images/pawns/pawn_black.png'
import pawn_blue from '../images/pawns/pawn_blue.png'
import pawn_green from '../images/pawns/pawn_green.png'
import pawn_purple from '../images/pawns/pawn_purple.png'
import pawn_red from '../images/pawns/pawn_red.png'
import pawn_white from '../images/pawns/pawn_white.png'
import pawn_yellow from '../images/pawns/pawn_yellow.png'
import wood from '../images/ressources/ressources_bois.png'
import diamond from '../images/ressources/ressources_minerai.png'
import food from '../images/ressources/ressources_viande.png'
import shield from '../images/tokens/bouclier_rouge.png'
import gold from '../images/tokens/Gold1.jpg'

type PaperTalesPlayerPanelProps = {
  player: Player<PlayerColor>
  index: number
  isViewed: boolean
} & HTMLAttributes<HTMLDivElement>

const pawnImages: Record<PlayerColor, string> = {
  [PlayerColor.Red]: pawn_red,
  [PlayerColor.Blue]: pawn_blue,
  [PlayerColor.Green]: pawn_green,
  [PlayerColor.Yellow]: pawn_yellow,
  [PlayerColor.Purple]: pawn_purple,
  [PlayerColor.White]: pawn_white,
  [PlayerColor.Black]: pawn_black
}

const playerAccent: Record<PlayerColor, string> = {
  [PlayerColor.Red]: '#b34234',
  [PlayerColor.Blue]: '#3a6a99',
  [PlayerColor.Green]: '#5a8a4a',
  [PlayerColor.Yellow]: '#c8993a',
  [PlayerColor.Purple]: '#7a4a8a',
  [PlayerColor.White]: '#d8c8a0',
  [PlayerColor.Black]: '#3a322a'
}

const playerAccentDeep: Record<PlayerColor, string> = {
  [PlayerColor.Red]: '#7a2820',
  [PlayerColor.Blue]: '#1f3a5a',
  [PlayerColor.Green]: '#365229',
  [PlayerColor.Yellow]: '#7a5510',
  [PlayerColor.Purple]: '#4a2a5a',
  [PlayerColor.White]: '#8a7a55',
  [PlayerColor.Black]: '#1a1612'
}

export const PaperTalesPlayerPanel: FC<PaperTalesPlayerPanelProps> = (props) => {
  const { player, isViewed, index: _index, ...rest } = props
  const rules = useRules<MaterialRules>()!
  const play = usePlay()
  const playerName = usePlayerName(player.id)
  const scoreHelper = useMemo(() => new ScoreHelper(rules.game, player.id), [rules.game, player.id])
  const resourcesHelper = useMemo(() => new ResourcesHelper(rules.game, player.id), [rules.game, player.id])
  const buildHelper = useMemo(() => new BuildHelper(rules.game, player.id), [rules.game, player.id])
  const war = useMemo(() => new War(rules.game), [rules.game])

  const isActive = rules.isTurnToPlay(player.id)
  const onClick = () => play(MaterialMoveBuilder.changeView(player.id), { transient: true })

  const accent = playerAccent[player.id]
  const accentDeep = playerAccentDeep[player.id]

  return (
    <div onClick={onClick} css={[outerCss, isViewed && viewedScaleCss]} {...rest}>
      <div css={cardCss(accent, accentDeep, isViewed)}>
        <div css={chevronOverlayCss} />

        <div css={topZoneCss}>
          <div css={avatarFrameCss(accent, isViewed)}>
            {isActive && <div css={activeRingCss} />}
            <Avatar playerId={player.id} css={avatarCss} />
          </div>
          <div css={identityCss}>
            <span css={nameBannerCss}>{playerName}</span>
            <div css={metaCss}>
              <PlayerTimer playerId={player.id} css={timerCss} />
            </div>
          </div>
          <ScoreSeal pawn={pawnImages[player.id]} value={scoreHelper.score} />
        </div>

        <div css={resourcesStripCss}>
          <ResourceCell img={wood} value={resourcesHelper.getResource(Resources.Wood)} />
          <ResourceCell img={food} value={resourcesHelper.getResource(Resources.Food)} />
          <ResourceCell img={diamond} value={resourcesHelper.getResource(Resources.Diamond)} />
          <ResourceCell img={gold} value={buildHelper.gold} round />
          <ResourceCell img={shield} value={war.getPlayerPower(player.id)} />
        </div>
      </div>
    </div>
  )
}

const ScoreSeal: FC<{ pawn: string; value: number }> = ({ pawn, value }) => (
  <div css={scoreSealCss}>
    <img src={pawn} css={scorePawnCss} alt="" />
    <span css={scoreValueCss}>{value}</span>
  </div>
)

const ResourceCell: FC<{ img: string; value: number; round?: boolean }> = ({ img, value, round }) => (
  <div css={resourceCellCss}>
    <img src={img} css={resourceImgCss(round)} alt="" />
    <span css={resourceValueCss}>{value}</span>
  </div>
)

// ──────────────────────────────────────────────────────────────────────────────
// Palette Paper Tales
const paper = '#f5ecd6'
const paperLight = '#fbf5e4'
const paperDeep = '#e9dcb8'
const paperShadow = '#c9b88a'
const ink = '#3a2515'
const inkSoft = '#6b4a2b'
const rougeLaque = '#a23529'
const rougeDeep = '#6e1e16'
const or = '#c89a3a'
const orLight = '#f0c660'
const orDeep = '#7a5510'
const bark = '#6b4628'
const barkDeep = '#3f2814'

// ──────────────────────────────────────────────────────────────────────────────
const outerCss = css`
  position: relative;
  width: 22em;
  cursor: pointer;
  transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.3, 1);
  &:active {
    transition: transform 0.08s ease-out;
  }
`

const viewedScaleCss = css`
  transform: scale(1.05);
`

const cardCss = (accent: string, accentDeep: string, isViewed: boolean) => css`
  position: relative;
  border-radius: 0.7em;
  background:
    linear-gradient(180deg, ${accent} 0%, ${accentDeep} 100%),
    url(${panelBg}) center top / cover;
  background-blend-mode: multiply, normal;
  box-shadow:
    inset 0 0 0 0.1em ${ink},
    inset 0 0 0 0.22em ${paper},
    inset 0 0 0 0.32em ${isViewed ? or : ink},
    ${isViewed ? `inset 0 0 0 0.4em ${ink},` : ''}
    0 0.3em 0.7em rgba(0, 0, 0, 0.5);
  color: ${ink};
`

const chevronOverlayCss = css`
  position: absolute;
  inset: 0;
  border-radius: 0.7em;
  background: url(${panelBg}) center top / cover;
  mix-blend-mode: overlay;
  opacity: 0.9;
  pointer-events: none;
`

const topZoneCss = css`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 0.6em;
  padding: 0.7em 0.75em 0.55em 0.7em;
  min-height: 4.8em;
`

// Avatar — médaillon papier + double anneau
const avatarFrameCss = (accent: string, isViewed: boolean) => css`
  position: relative;
  flex-shrink: 0;
  width: 4em;
  height: 4em;
  border-radius: 50%;
  background: ${paperLight};
  padding: 0.18em;
  box-shadow:
    inset 0 0 0 0.08em ${ink},
    0 0 0 0.12em ${paper},
    0 0 0 0.22em ${isViewed ? or : accent},
    0 0 0 0.3em ${ink},
    0 0.2em 0.35em rgba(0, 0, 0, 0.45);
`

const avatarCss = css`
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  display: block;
  background: ${paperLight};
  box-shadow: inset 0 0 0 0.06em ${ink};
`

// Active ring — fidèle au framework GamePark (disque dégradé qui tourne)
const ringSpin = keyframes`
  from { transform: rotateZ(360deg); }
  to   { transform: rotateZ(0); }
`

const activeRingCss = css`
  position: absolute;
  inset: -0.2em;
  border-radius: 50%;
  background-image: linear-gradient(to bottom, ${orLight} 0%, ${orDeep} 100%);
  animation: ${ringSpin} 1s infinite linear;
  z-index: 2;
  pointer-events: none;
`

// Identité — nom + timer
const identityCss = css`
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 0.25em;
  padding-top: 0.1em;
`

const nameBannerCss = css`
  position: relative;
  background: linear-gradient(180deg, ${rougeLaque} 0%, ${rougeDeep} 100%);
  color: ${paper};
  font-family: 'Cormorant SC', 'Cinzel', Georgia, serif;
  font-weight: 700;
  font-size: 1.3em;
  letter-spacing: 0.04em;
  padding: 0.1em 0.6em 0.15em;
  border-radius: 0.2em;
  box-shadow:
    inset 0 0.1em 0.12em rgba(255, 200, 180, 0.4),
    inset 0 -0.1em 0.1em rgba(0, 0, 0, 0.4),
    inset 0 0 0 0.05em ${ink},
    0 0.1em 0.18em rgba(0, 0, 0, 0.4);
  text-shadow: 0 0.05em 0.05em rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.25;
`

const metaCss = css`
  display: flex;
  align-items: center;
  gap: 0.5em;
`

const timerCss = css`
  background: rgba(255, 250, 230, 0.9);
  border: 0.05em solid ${ink};
  border-radius: 0.25em;
  padding: 0.1em 0.6em;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: ${ink};
  letter-spacing: 0.04em;
  font-size: 1.15em;
  box-shadow: 0 0.08em 0.15em rgba(0, 0, 0, 0.4);
`

// Sceau de score — médaillon parchemin doré, pawn en filigrane + chiffre encré
const scoreSealCss = css`
  position: relative;
  flex-shrink: 0;
  width: 3.6em;
  height: 3.6em;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, ${paperLight} 0%, ${paperDeep} 55%, ${paperShadow} 100%);
  box-shadow:
    inset 0 0 0 0.08em ${ink},
    inset 0 0 0 0.18em ${paper},
    inset 0 0 0 0.22em ${orDeep},
    inset 0 0 0 0.32em ${or},
    inset 0 0 0 0.38em ${ink},
    0 0.2em 0.35em rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
`

const scorePawnCss = css`
  position: absolute;
  inset: 0.75em;
  width: calc(100% - 1.5em);
  height: calc(100% - 1.5em);
  object-fit: contain;
  opacity: 0.9;
  filter: drop-shadow(0 0 0.08em rgba(0, 0, 0, 0.55)) drop-shadow(0 0.06em 0.1em rgba(0, 0, 0, 0.4));
  z-index: 0;
`

const scoreValueCss = css`
  position: relative;
  z-index: 1;
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-style: italic;
  color: ${paperLight};
  font-size: 1.8em;
  line-height: 1;
  text-shadow:
    0 0 0.15em rgba(0, 0, 0, 0.9),
    0.04em 0.04em 0 ${ink},
    -0.04em 0.04em 0 ${ink},
    0.04em -0.04em 0 ${ink},
    -0.04em -0.04em 0 ${ink},
    0 0.06em 0.08em rgba(0, 0, 0, 0.8);
  font-variant-numeric: tabular-nums;
  transform: translateY(0.05em);
`

// Bottom strip — bandeau écorce + cellules ressources
const resourcesStripCss = css`
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.3em;
  padding: 0.4em 0.55em 0.5em;
  background: linear-gradient(180deg, ${bark} 0%, ${barkDeep} 100%);
  border-top: 0.08em solid ${ink};
  border-radius: 0 0 0.6em 0.6em;
  box-shadow:
    inset 0 0.08em 0.15em rgba(0, 0, 0, 0.4),
    inset 0 -0.05em 0.1em rgba(255, 240, 200, 0.1);
`

const resourceCellCss = css`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.3em;
  padding: 0.25em 0.35em;
  background: linear-gradient(180deg, ${paperLight} 0%, ${paperDeep} 100%);
  border: 0.06em solid ${ink};
  border-radius: 0.28em;
  box-shadow:
    inset 0 0.1em 0.15em rgba(255, 250, 230, 0.8),
    inset 0 -0.08em 0.15em rgba(201, 184, 138, 0.4),
    0 0.1em 0.2em rgba(0, 0, 0, 0.4);
`

const resourceImgCss = (round?: boolean) => css`
  width: 1.5em;
  height: 1.5em;
  object-fit: contain;
  ${round ? 'border-radius: 50%;' : ''}
  filter: drop-shadow(0 0 0.05em rgba(0, 0, 0, 0.6)) drop-shadow(0 0.06em 0.08em rgba(0, 0, 0, 0.4));
`

const resourceValueCss = css`
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 800;
  font-size: 1.3em;
  color: ${ink};
  line-height: 1;
  font-variant-numeric: tabular-nums;
  min-width: 0.7em;
  text-align: center;
`

export const _paperTalesPalette = { paper, paperShadow, ink, inkSoft, or, orLight, orDeep, rougeLaque, rougeDeep }
