import { css } from '@emotion/react'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { War } from '@gamepark/paper-tales/rules/3_War/War'
import { BuildHelper } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { ResourcesHelper } from '@gamepark/paper-tales/rules/helpers/ResourcesHelper'
import { ScoreHelper } from '@gamepark/paper-tales/rules/helpers/ScoreHelper'
import { Avatar, PlayerTimer, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { FC, HTMLAttributes, ReactNode, useMemo } from 'react'
import wood from '../images/ressources/ressources_bois.png'
import diamond from '../images/ressources/ressources_minerai.png'
import food from '../images/ressources/ressources_viande.png'
import shield from '../images/tokens/bouclier_rouge.png'
import gold from '../images/tokens/Gold1.jpg'
import { PANEL_HEIGHT } from '../locators/TableLayout'
import { scoreTokenDescription } from '../material/ScoreTokenDescription'
import { unitCardDescription } from '../material/UnitCardDescription'
import { cutLine, paper, paperFont, patchTornClip, roundImageCss, rust, sheetTornClip } from '../theme/tableTheme'
import { getColor } from '../utils/color'
import { DeltaBubble } from './DeltaBubble'
import { useValueDelta } from './useValueDelta'

type PaperTalesPlayerPanelProps = {
  player: PlayerColor
} & HTMLAttributes<HTMLDivElement>

/**
 * A compact panel, so that 7 of them fit in the column at the left of the table. It carries what a player may need to
 * read of another one without opening their area: the score, the gold (never hidden, rulebook p.3), the strength of the
 * front row and the cards in hand, then the resources the kingdom produces (p.4).
 * Cut paper: a torn sheet of the player's colour, the counters on a piece of cream paper cut to their size.
 */
export const PaperTalesPlayerPanel: FC<PaperTalesPlayerPanelProps> = ({ player, ...props }) => {
  const rules = useRules<MaterialRules>()!
  const name = usePlayerName(player)
  const scoreHelper = useMemo(() => new ScoreHelper(rules.game, player), [rules.game, player])
  const resourcesHelper = useMemo(() => new ResourcesHelper(rules.game, player), [rules.game, player])
  const buildHelper = useMemo(() => new BuildHelper(rules.game, player), [rules.game, player])
  const war = useMemo(() => new War(rules.game), [rules.game])
  const cardsInHand = rules
    .material(MaterialType.Unit)
    .location((location) => location.type === LocationType.PlayerUnitHand || location.type === LocationType.PlayerDraftHand)
    .player(player).length
  const color = getColor(player).substring(0, 7)
  const light = player === PlayerColor.White || player === PlayerColor.Yellow
  // On the white sheet, the cream paper and the white pawn need an ink outline to stand out
  const pale = player === PlayerColor.White

  return (
    <div css={[panelCss(color, light), rules.isTurnToPlay(player) && activeCss]} {...props}>
      <Avatar playerId={player} css={avatarCss} />
      <div css={headCss}>
        <span css={nameCss}>{name}</span>
        <PlayerTimer playerId={player} css={timerCss} />
      </div>
      <div css={[patchCss, pale && palePatchCss]}>
        <div css={countersCss}>
          <DeltaCounter image={scoreTokenDescription.images[player]} value={scoreHelper.score} outlined={pale} />
          <DeltaCounter image={gold} value={buildHelper.gold} round />
          <Counter image={shield} value={war.getPlayerPower(player)} />
          <Counter image={unitCardDescription.backImage} value={cardsInHand} />
        </div>
        <div css={countersCss}>
          <Counter image={wood} value={resourcesHelper.getResource(Resources.Wood)} />
          <Counter image={food} value={resourcesHelper.getResource(Resources.Food)} />
          <Counter image={diamond} value={resourcesHelper.getResource(Resources.Diamond)} />
        </div>
      </div>
    </div>
  )
}

type CounterProps = { image: string; value: number; round?: boolean; outlined?: boolean }

const Counter: FC<CounterProps & { children?: ReactNode }> = ({ image, value, round, outlined, children }) => (
  <span css={counterCss}>
    <img src={image} alt="" css={[round && roundImageCss, outlined && outlinedImageCss]} />
    {value}
    {children}
  </span>
)

/** A counter whose gains and losses show in a bubble: the score (wars, effects) and the gold (income, costs) */
const DeltaCounter: FC<CounterProps> = (props) => {
  const delta = useValueDelta(props.value)
  return (
    <Counter {...props}>
      <DeltaBubble delta={delta} />
    </Counter>
  )
}

/** A torn sheet of the player's colour, laid on the table with an offset shadow */
const panelCss = (color: string, light: boolean) => css`
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: 3.2em 1fr;
  grid-template-rows: auto 1fr;
  column-gap: 0.45em;
  align-items: center;
  box-sizing: border-box;
  height: ${PANEL_HEIGHT}em;
  padding: 0.25em 0.45em;
  color: ${light ? cutLine : 'white'};
  filter: drop-shadow(0.16em 0.2em 0 #00000059);
  transition: filter 0.3s;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${color};
    clip-path: ${sheetTornClip};
  }
`

/** The player whose turn it is: a rust shadow and a warm glow */
const activeCss = css`
  filter: drop-shadow(0.16em 0.2em 0 ${rust}) drop-shadow(0 0 0.35em #e9b53499);
`

const avatarCss = css`
  position: relative;
  grid-row: span 2;
  width: 3.2em;
  height: 3.2em;
  border-radius: 50%;
  background: ${paper};
  box-shadow: 0 0 0 0.14em ${paper};
`

const headCss = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5em;
  min-width: 0;
`

const nameCss = css`
  font-family: ${paperFont};
  font-size: 1.15em;
  font-weight: 800;
  line-height: 1.1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const timerCss = css`
  font-size: 0.85em;
  font-weight: 700;
`

/** The counters, on a piece of cream paper cut to their size and laid a little askew */
const patchCss = css`
  position: relative;
  isolation: isolate;
  justify-self: start;
  display: grid;
  gap: 0.12em;
  padding: 0.24em 0.8em;
  color: ${cutLine};
  transform: rotate(-1.2deg);
  filter: drop-shadow(0.08em 0.1em 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paper};
    clip-path: ${patchTornClip};
  }
`

const palePatchCss = css`
  filter: drop-shadow(0 0 0.04em ${cutLine}) drop-shadow(0 0 0.04em ${cutLine}) drop-shadow(0.08em 0.1em 0 #00000059);
`

const countersCss = css`
  display: flex;
  gap: 0.45em;
`

const counterCss = css`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  font-size: 0.92em;
  font-weight: 800;
  line-height: 1.2;

  img {
    display: block;
    height: 1.1em;
    margin-top: -0.08em;
    object-fit: contain;
  }
`

const outlinedImageCss = css`
  filter: drop-shadow(0 0 0.05em ${cutLine}) drop-shadow(0 0 0.05em ${cutLine});
`
