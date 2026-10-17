import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { MaterialHelpProps, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { BookPage } from './book/BookPage'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'

/**
 * The help of a Unit card whose face is hidden: the deck, the discard (rulebook p.3 and 5), or the hand of another
 * Monarch. The page is about the pile or the hand the card belongs to.
 */
export const HiddenUnitHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const location = item.location!
  const owner = location.player
  const ownerName = usePlayerName(owner)
  const count = rules.material(MaterialType.Unit).location(location.type).player(owner).length
  const current = currentPhaseIndex(rules)
  // The 6 phases, the given ones active
  const timeline = (...active: [number, TimelineStep][]): TimelineStep[] => {
    const steps: TimelineStep[] = [{}, {}, {}, {}, {}, {}]
    for (const [index, step] of active) steps[index] = step
    return steps
  }

  if (location.type === LocationType.Deck) {
    const steps = timeline([
      0,
      {
        on: true,
        text: t(
          'help.deck.recruit',
          'Each Monarch receives 5 cards from the deck (9 with 2 players). If the deck runs out during the deal, the discard is shuffled into a new deck.'
        )
      }
    ])
    return (
      <BookPage
        name={t('help.deck.name', 'Deck')}
        lede={<PrintedText lines={[{ text: t('help.deck.lede', { defaultValue: 'The Unit cards, face down. Cards left: {count}.', count }) }]} rule={false} />}
      >
        <PhaseTimeline steps={steps} current={current} />
      </BookPage>
    )
  }
  if (location.type === LocationType.Discard) {
    const steps = timeline(
      [
        1,
        {
          on: true,
          text: t('help.discard.deploy', 'The Units you remove from your Kingdom, the ones you cannot pay for, and the cards of your hand you do not keep.')
        }
      ],
      [5, { on: true, text: t('help.discard.aging', 'The Units that die, with their Age tokens.') }]
    )
    return (
      <BookPage
        name={t('help.discard.name', 'Discard')}
        lede={
          <PrintedText
            lines={[{ text: t('help.discard.lede', { defaultValue: 'The discarded cards, always face down. Cards: {count}.', count }) }]}
            rule={false}
          />
        }
      >
        <PhaseTimeline steps={steps} current={current} />
      </BookPage>
    )
  }
  // The hand of another Monarch, during the draft or before the deployment
  const steps =
    location.type === LocationType.PlayerDraftHand
      ? timeline([
          0,
          { on: true, text: t('help.hand.draft', { defaultValue: '{player} keeps one card and passes the others to a neighbour.', player: ownerName }) }
        ])
      : timeline([
          1,
          {
            on: true,
            text: t('help.hand.deploy', {
              defaultValue: '{player} may put these Units into play, keep a single one for the next turn and discard the rest.',
              player: ownerName
            })
          }
        ])
  return (
    <BookPage
      name={t('help.hand.name', { defaultValue: 'Hand of {player}', player: ownerName })}
      lede={<PrintedText lines={[{ text: t('help.hand.lede', { defaultValue: 'Cards, face down for you: {count}.', count }) }]} rule={false} />}
    >
      <PhaseTimeline steps={steps} current={current} />
    </BookPage>
  )
}
