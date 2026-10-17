import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { Memory } from '@gamepark/paper-tales/rules/Memory'
import { MaterialHelpProps, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BookPage } from './book/BookPage'
import { helpIconComponents } from './book/helpIconComponents'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'

/** The game lasts 4 turns (rulebook p.4) */
const TURNS = 4

/** The help of the turn counter: the 6 phases of a turn in a few words each (rulebook p.4 to 8), the current one marked */
export const TimeTokenHelp: FC<MaterialHelpProps> = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const turn = rules.remind<number>(Memory.Time)
  const current = currentPhaseIndex(rules)
  // The cards go left on turns 1 and 3, right on turns 2 and 4 (rulebook p.5)
  const direction =
    turn % 2 === 1 ? t('help.turn.1.left', 'This turn, the cards go to the left.') : t('help.turn.1.right', 'This turn, the cards go to the right.')

  const steps: TimelineStep[] = [
    {
      on: true,
      text: t('help.turn.1', 'Each Monarch receives 5 Unit cards (9 with 2 players), keeps one and passes the rest to a neighbour, until they hold 5 cards.'),
      you: current === 0 ? direction : undefined
    },
    { on: true, text: t('help.turn.2', 'The Monarchs put Units from their hand into play face down, then reveal them all at once and pay their cost.') },
    {
      on: true,
      text: (
        <Trans
          i18nKey="help.turn.3"
          defaults="Each Kingdom compares its strength with its two neighbours: each War won (equal or greater strength) grants <pl3/>."
          components={helpIconComponents}
        />
      )
    },
    {
      on: true,
      text: <Trans i18nKey="help.turn.4" defaults="Each Kingdom earns 2 <gold/>, plus the gold of its income effects." components={helpIconComponents} />
    },
    { on: true, text: t('help.turn.5', 'One action: construct a Building (at level 1 or directly at level 2), or upgrade a level 1 Building.') },
    { on: true, text: t('help.turn.6', 'The Units that carry an Age token die; the others get one.') },
    {
      on: true,
      text: t(
        'help.turn.end',
        'At the end of turn 4, each Monarch adds the Legend points of their Buildings. The most points wins; in case of a tie, the most Gold; otherwise victory is shared.'
      )
    }
  ]
  return (
    <BookPage
      name={t('help.turn.name', 'Turn counter')}
      lede={
        <PrintedText
          lines={[
            {
              text: t('help.turn.lede', {
                defaultValue: 'Turn {turn} of {turns}. In each phase, the Monarchs play simultaneously, then move on together to the next phase.',
                turn,
                turns: TURNS
              })
            }
          ]}
          rule={false}
        />
      }
    >
      <PhaseTimeline steps={steps} current={current} />
    </BookPage>
  )
}
