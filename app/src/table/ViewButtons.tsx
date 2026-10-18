import { css, Interpolation, Theme } from '@emotion/react'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { PlayMoveButton, useMaterialContext, usePlayerName } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { FC, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { getMe, getNeighboursView, getViewedPlayer, getWarCenter, isSpectator, isWarView, SIDE_COLUMN_WIDTH, viewsPosition } from '../locators/TableLayout'
import { CrownIcon, NeighboursIcon } from '../material/icons/PaperIcons'
import { scoreTokenDescription } from '../material/ScoreTokenDescription'
import { cutLine, paper, paperCss, paperMuted, rust, tableButtonCss } from '../theme/tableTheme'
import { TableAnchor } from './TableAnchor'

/**
 * The views of the table, written in words under the turn. A Monarch always has their kingdom and their neighbours;
 * when they look at another kingdom (by clicking its panel), that kingdom and its neighbours are added, with the pawn
 * of its Monarch, on one row (the neighbours as a square button) so that the views never run into the deck. A spectator
 * has no kingdom of their own: they get the kingdom and the neighbours of the Monarch they look at, on two full lines.
 * The displayed view is on rust paper; the others are paler slips that play a transient changeView.
 */
export const ViewButtons: FC = () => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const me = getMe(context)
  const spectator = isSpectator(context)
  const war = isWarView(context)
  // The Monarch the views are about: the center of the neighbours view, else the displayed kingdom
  const subject = war ? getWarCenter(context) : getViewedPlayer(context)
  return (
    <TableAnchor position={viewsPosition} css={listCss}>
      {!spectator && (
        <>
          <ViewLine view={me} current={!war && subject === me} icon={<CrownIcon />}>
            {t('view.my-kingdom', 'My kingdom')}
          </ViewLine>
          <ViewLine view={getNeighboursView(context, me)} current={war && subject === me} icon={<NeighboursIcon />}>
            {t('view.neighbours', 'My neighbours')}
          </ViewLine>
        </>
      )}
      {(spectator || subject !== me) && <OtherPlayerLines player={subject} war={war} compact={!spectator} />}
    </TableAnchor>
  )
}

const OtherPlayerLines: FC<{ player: PlayerColor; war: boolean; compact: boolean }> = ({ player, war, compact }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const name = usePlayerName(player)
  const neighbours = t('view.player.neighbours', { defaultValue: 'Neighbours of {player}', player: name })
  const kingdom = (
    <ViewLine view={player} current={!war} icon={<img src={scoreTokenDescription.images[player]} alt="" css={pawnCss} />} rowCss={compact && wideCss}>
      {t('view.player', { defaultValue: 'Kingdom of {player}', player: name })}
    </ViewLine>
  )
  if (compact) {
    return (
      <div css={rowCss}>
        {kingdom}
        <ViewLine view={getNeighboursView(context, player)} current={war} icon={<NeighboursIcon />} rowCss={squareCss} title={neighbours} />
      </div>
    )
  }
  return (
    <>
      {kingdom}
      <ViewLine view={getNeighboursView(context, player)} current={war} icon={<NeighboursIcon />}>
        {neighbours}
      </ViewLine>
    </>
  )
}

/** A view: its icon, then its name on up to 2 lines (a long player name wraps, then is cut) */
const ViewLine: FC<{ view: number; current: boolean; icon: ReactNode; children?: ReactNode; rowCss?: Interpolation<Theme>; title?: string }> = ({
  view,
  current,
  icon,
  children,
  rowCss,
  title
}) => {
  const content = (
    <>
      {icon}
      {children && <span css={labelCss}>{children}</span>}
    </>
  )
  return current ? (
    <div css={[currentCss, lineCss, rowCss]} title={title}>
      {content}
    </div>
  ) : (
    <PlayMoveButton css={[otherCss, lineCss, rowCss]} move={MaterialMoveBuilder.changeView(view)} transient title={title}>
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

/** The kingdom and its neighbours on one row: the kingdom takes the room, the neighbours a square */
const rowCss = css`
  grid-column: 1 / -1;
  display: flex;
  gap: 0.35em;
`

const wideCss = css`
  flex: 1;
  min-width: 0;
  display: flex;
  justify-content: center;
  gap: 0.5em;
`

const squareCss = css`
  flex: none;
  display: grid;
  place-items: center;
  width: 2.6em;
  padding: 0.3em 0 0.2em;

  > svg {
    grid-column: auto;
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
