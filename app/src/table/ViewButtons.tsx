import { css } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton, useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getMe, getViewedPlayer, isWarView, NEIGHBOURS_VIEW, SIDE_COLUMN_WIDTH, viewsPosition } from '../locators/TableLayout'
import { CrownIcon, NeighboursIcon } from '../material/icons/PaperIcons'
import { scoreTokenDescription } from '../material/ScoreTokenDescription'
import { cutLine, paper, paperCss, paperMuted, rust, tableButtonCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * The views of the table, written in words under the turn: my kingdom and my neighbours, always listed, and the
 * kingdom of the player I look at (by clicking their panel), with their pawn. The displayed view is on rust paper;
 * the others are paler slips that play a transient changeView.
 */
export const ViewButtons: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = getMe(context)
  const war = isWarView(context)
  const viewed = war ? undefined : getViewedPlayer(context)
  return (
    <TableAnchor position={viewsPosition} css={listCss}>
      <ViewLine view={me} current={viewed === me} icon={<CrownIcon />}>
        {t('view.my-kingdom', 'My kingdom')}
      </ViewLine>
      <ViewLine view={NEIGHBOURS_VIEW} current={war} icon={<NeighboursIcon />}>
        {t('view.neighbours', 'My neighbours')}
      </ViewLine>
      {viewed !== undefined && viewed !== me && <OtherPlayerLine player={viewed} />}
    </TableAnchor>
  )
}

const OtherPlayerLine: FC<{ player: PlayerColor }> = ({ player }) => {
  const { t } = useTranslation()
  const name = usePlayerName(player)
  return (
    <ViewLine view={player} current icon={<img src={scoreTokenDescription.images[player]} alt="" css={pawnCss} />}>
      {t('view.player', { defaultValue: 'Kingdom of {player}', player: name })}
    </ViewLine>
  )
}

/** A view: its icon, then its name on up to 2 lines (a long player name wraps, then is cut) */
const ViewLine: FC<{ view: number; current: boolean; icon: ReactNode; children: ReactNode }> = ({ view, current, icon, children }) => {
  const content = (
    <>
      {icon}
      <span css={labelCss}>{children}</span>
    </>
  )
  return current ? (
    <div css={[currentCss, lineCss]}>{content}</div>
  ) : (
    <PlayMoveButton css={[otherCss, lineCss]} move={MaterialMoveBuilder.changeView(view)} transient>
      {content}
    </PlayMoveButton>
  )
}

/**
 * One grid for all the lines: an icon column and a name column shared by every line (subgrid), between two elastic
 * margins. The icons stand one under the other, right before their names, and the group is centred in the buttons.
 */
const listCss = css`
  width: ${SIDE_COLUMN_WIDTH}em;
  display: grid;
  grid-template-columns: 1fr auto minmax(0, auto) 1fr;
  row-gap: 0.45em;
`

const lineCss = css`
  box-sizing: border-box;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: subgrid;
  align-items: center;
  column-gap: 0.5em;
  min-height: 2.4em;
  padding: 0.3em 0.8em 0.2em;
  font-size: 1em;
  white-space: normal;

  > svg,
  > img {
    grid-column: 2;
    justify-self: center;
  }

  /* each name centred in the shared name column: the names share an axis, the icons theirs */
  > span {
    grid-column: 3;
    justify-self: center;
  }

  svg {
    flex-shrink: 0;
    width: 1.45em;
    height: 1.45em;
    margin-top: -0.1em;
  }
`

const labelCss = css`
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.1;
  text-align: center;
  overflow-wrap: anywhere;
`

const pawnCss = css`
  flex-shrink: 0;
  height: 1.45em;
  object-fit: contain;
  /* a cream outline: the pawn stands on rust paper, whatever its colour */
  filter: drop-shadow(0 0 0.06em ${paper}) drop-shadow(0 0 0.06em ${paper});
`

const currentCss = paperCss(rust, paper)

const otherCss = css`
  ${tableButtonCss};

  &::before {
    background: ${paperMuted};
  }

  color: ${cutLine};
`
