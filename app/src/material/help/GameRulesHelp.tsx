import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { BookPage } from './book/BookPage'
import { ExpansionRulesHelp, Section } from './ExpansionRulesHelp'

/**
 * What this game adds to the rules: those for 2 players (rulebook p.8), then the expansions played. Read at the start of
 * the game (see GameRulesIntro), then whenever a Monarch asks for it (see GameRulesButton).
 */
export const GameRulesHelp: FC = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  return (
    <BookPage name={t('game-rules.name', 'The rules of this game')}>
      {rules.players.length === 2 && (
        <Section
          title={t('two-players.title', 'With 2 players')}
          items={[
            t(
              'two-players.recruit',
              'Recruitment: each Monarch receives 9 Unit cards instead of 5. Each time a card is kept, another one is chosen and discarded before the rest is passed to the opponent.'
            ),
            t('two-players.war', 'Wars: a strength equal to or greater than the opponent’s wins 1 War, a strength equal to or greater than twice theirs wins 2.')
          ]}
        />
      )}
      <ExpansionRulesHelp />
    </BookPage>
  )
}
