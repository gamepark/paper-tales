import { golds } from '@gamepark/paper-tales/material/Gold'
import { LocationType } from '@gamepark/paper-tales/material/LocationType'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { BASE_INCOME } from '@gamepark/paper-tales/rules/4_Income/Income'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { FC } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { BookPage } from './book/BookPage'
import { FactTags } from './book/FactTags'
import { helpIconComponents } from './book/helpIconComponents'
import { CoinIcon } from './book/HelpIcons'
import { LiveBox } from './book/LiveBox'
import { currentPhaseIndex } from './book/phases'
import { PhaseTimeline, TimelineStep } from './book/PhaseTimeline'
import { PrintedText } from './book/PrintedText'

/** Every Monarch starts with 3 gold (rulebook p.3) */
const STARTING_GOLD = 3

/** The help of a gold coin: what gold pays and earns over the turn (rulebook p.5 to 8), and how much the owner has */
export const GoldCoinHelp: FC<MaterialHelpProps> = ({ item }) => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const me = usePlayerId()
  const owner = item.location?.type === LocationType.PlayerGoldStock ? item.location.player : undefined
  const ownerName = usePlayerName(owner)
  const gold = owner !== undefined ? rules.material(MaterialType.Gold).location(LocationType.PlayerGoldStock).player(owner).money(golds).count : 0
  const components = { ...helpIconComponents, coin: <CoinIcon /> }

  const steps: TimelineStep[] = [
    {},
    {
      on: true,
      text: t(
        'help.gold.deploy',
        'Pay the cost of each Unit you reveal. A Unit you cannot pay for is discarded at once; a Unit already in play is never paid again.'
      )
    },
    {},
    {
      on: true,
      text: (
        <Trans
          i18nKey="help.gold.income"
          defaults="You earn {base} <gold/> from the reserve, plus the gold granted by the income effects <phase4/> of your Kingdom."
          values={{ base: BASE_INCOME }}
          components={components}
        />
      )
    },
    {
      on: true,
      text: (
        <Trans
          i18nKey="help.gold.build"
          defaults="Land cost: {cost} <gold/> for each Building you already have. Upgrading a Building costs no land."
          values={{ cost: 2 }}
          components={components}
        />
      )
    },
    {},
    { on: true, text: t('help.gold.end', 'In case of a tie on Legend points, the Monarch with the most Gold wins.') }
  ]
  return (
    <BookPage
      name={t('help.gold.name', 'Gold')}
      lede={
        <PrintedText
          lines={[
            {
              text: t(
                'help.gold.lede',
                'The Gold of the Monarchs is never hidden. It pays the deployment cost of the Units and the land cost of the Buildings.'
              )
            }
          ]}
          rule={false}
        />
      }
      facts={
        <FactTags
          tags={[
            { label: t('help.gold.start', 'Start'), icon: <CoinIcon />, value: STARTING_GOLD },
            { label: t('help.gold.base', 'Base income'), icon: <CoinIcon />, value: BASE_INCOME }
          ]}
        />
      }
    >
      <PhaseTimeline steps={steps} current={currentPhaseIndex(rules)} />
      {owner !== undefined && (
        <LiveBox
          title={
            owner === me ? t('help.live.now', 'For you, now') : t('help.live.kingdom.other', { defaultValue: 'In the Kingdom of {player}', player: ownerName })
          }
          lines={[
            owner === me ? (
              <Trans key="gold" i18nKey="help.building.gold" defaults="You have {gold} <coin/>." values={{ gold }} components={components} />
            ) : (
              <Trans
                key="gold"
                i18nKey="help.gold.other"
                defaults="{player} has {gold} <coin/>."
                values={{ gold, player: ownerName }}
                components={components}
              />
            )
          ]}
        />
      )}
    </BookPage>
  )
}
