import { Card, isArtifact, isUnit } from '@gamepark/paper-tales/material/Artifact'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { unitCardCaracteristics } from '@gamepark/paper-tales/material/UnitCaracteristics'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { ReactivateUnitData } from '@gamepark/paper-tales/rules/CustomMoveType'
import { DeployCostHelper } from '@gamepark/paper-tales/rules/helpers/DeployCostHelper'
import { MaterialLogProps } from '@gamepark/react-game'
import { CreateItem, CustomMove, MaterialGame, MoveItem } from '@gamepark/rules-api'
import { FC } from 'react'
import { Trans } from 'react-i18next'
import { GoldValueIcon } from '../material/help/book/HelpIcons'
import { CardLink, CardList, EffectSourceLink } from './CardLink'
import { asideLineCss } from './logs.css'
import { cardAt, isAgeTokenOf, isRevealOf, nothingDeployed, revealedCard, runFrom } from './logHelpers'
import { Who } from './Who'

/** The cards a Monarch keeps in hand for the next turn: the others were discarded face down (rulebook p.5) */
const keptCards = (game: MaterialGame, player: PlayerColor) =>
  new PaperTalesRules(game).material(MaterialType.Unit).location(LocationType.PlayerUnitHand).player(player).length

/**
 * The cards a Monarch reveals, told as one line at the first one: their faces were hidden to the others until now, the
 * moves reveal them. With the gold they cost, paid right after (read on the game once they are revealed), and the card
 * kept in hand for the next turn.
 */
export const DeployLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = cardAt(context.game, move.itemIndex).location.player as PlayerColor
  const reveals = runFrom(context, isRevealOf(player, context.game)) ?? [move]
  const revealed = new PaperTalesRules(structuredClone(context.game))
  for (const reveal of reveals) revealed.play(reveal)
  const cards = reveals.map((reveal) => revealedCard(reveal) ?? cardAt(revealed.game, reveal.itemIndex).id)
  const cost = new DeployCostHelper(revealed.game, player).placedCost
  const kept = keptCards(context.game, player)
  const components = { who: <Who player={player} />, cards: <CardList cards={cards} />, g: <GoldValueIcon value={cost} /> }
  const key = `log.deploy${cost ? '.paid' : ''}${kept ? '.kept' : ''}`
  return <Trans i18nKey={key} defaults={deployDefaults[key]} values={{ kept }} components={components} />
}

const deployDefaults: Record<string, string> = {
  'log.deploy': '<who/> deploys <cards/>',
  'log.deploy.kept': '<who/> deploys <cards/> and keeps {kept, plural, one {# card} other {# cards}} in hand',
  'log.deploy.paid': '<who/> deploys <cards/> for <g/>',
  'log.deploy.paid.kept': '<who/> deploys <cards/> for <g/> and keeps {kept, plural, one {# card} other {# cards}} in hand'
}

/** The Monarchs who reveal no card this turn, told when the kingdoms are revealed */
export const NothingDeployedLog: FC<MaterialLogProps> = ({ context }) => (
  <>
    {nothingDeployed(context.game).map((player) => {
      const kept = keptCards(context.game, player)
      return (
        <span key={player} css={asideLineCss}>
          {kept ? (
            <Trans
              i18nKey="log.deploy.none.kept"
              defaults="<who/> deploys nothing and keeps {kept, plural, one {# card} other {# cards}} in hand"
              values={{ kept }}
              components={{ who: <Who player={player} /> }}
            />
          ) : (
            <Trans i18nKey="log.deploy.none" defaults="<who/> deploys nothing" components={{ who: <Who player={player} /> }} />
          )}
        </span>
      )
    })}
  </>
)

/** A unit of a previous turn a Monarch takes out of their kingdom while deploying, to free its space (rulebook p.5) */
export const RemovedUnitLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const item = cardAt(context.game, move.itemIndex)
  return (
    <Trans
      i18nKey="log.deploy.removed"
      defaults="<who/> removes <card/> from their kingdom"
      components={{ who: <Who player={item.location.player} />, card: <CardLink card={item.id} /> }}
    />
  )
}

/**
 * A card drawn by a "when revealed" effect, face up: the unit of cost 3 or less that takes the place of the Shapeshifter,
 * the Legendary Artifact the Court Jester finds, and the cards they draw and discard on the way (rulebook p.12)
 */
export const DrawnLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const player = move.location.player as PlayerColor
  const card = drawnCard(move, context.game)
  const components = { who: <Who player={player} />, card: <CardLink card={card} />, source: <EffectSourceLink game={context.game} player={player} /> }
  if (!isKeptDraw(move, card)) return <Trans i18nKey="log.drawn.discarded" defaults="<who/> draws and discards <card/> with <source/>" components={components} />
  if (isArtifact(card)) return <Trans i18nKey="log.drawn.artifact" defaults="<who/> finds <card/> thanks to <source/>" components={components} />
  return <Trans i18nKey="log.drawn.unit" defaults="<who/> replaces <source/> with <card/>" components={components} />
}

/** The card a move draws: the deck is hidden, the move reveals the card */
const drawnCard = (move: MoveItem, game: MaterialGame): Card => revealedCard(move) ?? cardAt(game, move.itemIndex).id

/** The Court Jester keeps a Legendary Artifact, the Shapeshifter a unit of cost 3 or less; the other cards are discarded */
const isKeptDraw = (move: MoveItem, card: Card) =>
  move.location.type === LocationType.PlayerArtifacts ? isArtifact(card) : isUnit(card) && unitCardCaracteristics[card].cost <= 3

/** The discard shuffled into a new deck, when the deck runs out (rulebook p.5) */
export const DeckRefillLog: FC<MaterialLogProps> = () => <Trans i18nKey="log.deck.refill" defaults="The discard is shuffled into a new deck" />

/** The Shadow applies again the "when revealed" effects of a unit */
export const ReactivateLog: FC<MaterialLogProps<CustomMove>> = ({ move, context }) => {
  const { unitIndex, player } = move.data as ReactivateUnitData
  return (
    <Trans
      i18nKey="log.reactivate"
      defaults="<who/> triggers <card/> again with <source/>"
      components={{
        who: <Who player={player} />,
        card: <CardLink card={cardAt(context.game, unitIndex).id} />,
        source: <EffectSourceLink game={context.game} player={player} />
      }}
    />
  )
}

/**
 * The Age tokens a "when revealed" effect lays, told once for the units that receive them together: on the units of its
 * choice (the Time Master), on the others (the Great Spirit), on the unit that replaces the Shapeshifter…
 */
export const AgeTokenLog: FC<MaterialLogProps<CreateItem>> = ({ move, context }) => {
  const player = move.item.location.player as PlayerColor
  const tokens = runFrom(context, isAgeTokenOf(player)) ?? [move]
  return (
    <Trans
      i18nKey="log.age-token.placed"
      defaults="<who/> places {count, plural, one {# Age token} other {# Age tokens}} on <cards/> with <source/>"
      values={{ count: move.item.quantity ?? 1 }}
      components={{
        who: <Who player={player} />,
        cards: <CardList cards={tokens.map((token) => cardAt(context.game, token.item.location.parent!).id)} />,
        source: <EffectSourceLink game={context.game} player={player} />
      }}
    />
  )
}

/** An Age token moved from a unit to another (the Wizard Apprentice) */
export const MovedAgeTokenLog: FC<MaterialLogProps<MoveItem>> = ({ move, context }) => {
  const token = new PaperTalesRules(context.game).material(MaterialType.Age).getItem(move.itemIndex)
  const player = move.location.player as PlayerColor
  return (
    <Trans
      i18nKey="log.age-token.moved"
      defaults="<who/> moves an Age token with <source/>: <from/> → <to/>"
      components={{
        who: <Who player={player} />,
        source: <EffectSourceLink game={context.game} player={player} />,
        from: <CardLink card={cardAt(context.game, token.location.parent!).id} />,
        to: <CardLink card={cardAt(context.game, move.location.parent!).id} />
      }}
    />
  )
}
