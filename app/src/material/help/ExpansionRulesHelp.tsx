import { css } from '@emotion/react'
import { baseGameBuildings, Building, permanentBuildings } from '@gamepark/paper-tales/material/Building'
import { MaterialType } from '@gamepark/paper-tales/material/MaterialType'
import { PaperTalesOptions } from '@gamepark/paper-tales/PaperTalesOptions'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { useRules } from '@gamepark/react-game'
import { uniq } from 'es-toolkit/compat'
import { artifacts as artifactIds } from '@gamepark/paper-tales/material/Artifact'
import { beyondTheGatesUnits, whatForgesLegendsUnits } from '@gamepark/paper-tales/material/Unit'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { rust, tornClip } from '../../theme/tableTheme'
import { BookPage } from './book/BookPage'
import { ExpansionCards } from './ExpansionCards'
import { helpIconComponents } from './book/helpIconComponents'

/**
 * The rules of the expansions played (rulebook of the complete edition, p.9 to 12): what they add to the game, how the
 * buildings of this game were drawn, the Legendary Artifacts, and the clarifications of the new cards. The new cards are
 * shown under their expansion: a click opens their help.
 */
export const ExpansionRulesHelp: FC = () => {
  const { t } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const options = (rules.game.options ?? {}) as PaperTalesOptions
  const buildings = uniq(
    rules
      .material(MaterialType.Building)
      .getItems<Building>()
      .map((building) => building.id)
  ).sort((a, b) => a - b)
  const names = (list: Building[]) => list.map((building) => t(`building.${building}`)).join(', ')
  const drawn = buildings.filter((building) => !(options.beyondTheGatesBuildings ? permanentBuildings : baseGameBuildings).includes(building))
  const artifacts = !!options.whatForgesLegends
  const lines = (keys: [string, string][]) =>
    keys.map(([key, defaults]) => <Trans key={key} i18nKey={key} defaults={defaults} components={helpIconComponents} />)

  return (
    <BookPage name={t('expansions.name', 'The expansions of this game')}>
      {(options.beyondTheGatesUnits || options.beyondTheGatesBuildings) && (
        <Section
          title={t('expansions.btg', 'Beyond the gates')}
          items={lines([
            ...(options.beyondTheGatesUnits ? [['expansions.btg.units', 'Its 20 new Unit cards are in the deck.'] as [string, string]] : []),
            ...(options.beyondTheGatesBuildings
              ? [
                  [
                    'expansions.btg.buildings',
                    'Buildings: every Monarch has the Mine, the Tavern, the Temple and the Town, plus 3 Buildings drawn at random among the Barracks and the Buildings of the expansions played.'
                  ] as [string, string]
                ]
              : [])
          ])}
        >
          {options.beyondTheGatesUnits && <ExpansionCards type={MaterialType.Unit} ids={beyondTheGatesUnits} />}
        </Section>
      )}
      {artifacts && (
        <Section
          title={t('expansions.wfl', 'What forges legends')}
          items={lines([
            ['expansions.wfl.cards', 'Its 26 new Unit cards and its 18 Legendary Artifacts are shuffled into the deck.'],
            ...(options.beyondTheGatesBuildings
              ? []
              : [
                  [
                    'expansions.wfl.buildings',
                    'Buildings: 2 drawn at random among the Inn, the Sawmill and the Royal Palace are added to the 5 of the base game.'
                  ] as [string, string]
                ])
          ])}
        >
          <ExpansionCards type={MaterialType.Unit} ids={whatForgesLegendsUnits} />
        </Section>
      )}
      {drawn.length > 0 && (
        <div css={drawnCss}>
          {t('expansions.drawn', {
            defaultValue: 'Drawn for this game: {buildings}. Every Monarch has the same {count} Buildings.',
            buildings: names(drawn),
            count: buildings.length
          })}
          <ExpansionCards type={MaterialType.Building} ids={drawn} />
        </div>
      )}
      {artifacts && (
        <Section
          title={t('expansions.artifacts', 'Legendary Artifacts')}
          items={lines([
            [
              'expansions.artifacts.recruit',
              'They are recruited exactly as the Units, and the card kept for the next turn can be an Artifact (still a single card).'
            ],
            [
              'expansions.artifacts.deploy',
              'They are deployed at the same time as the Units, face down, apart from them (at the right of your Buildings). No limit: they do not count among the 4 (then 5) spots of the Units.'
            ],
            [
              'expansions.artifacts.cost',
              'Each Artifact costs <g1/> plus <g1/> for each Artifact already deployed: the 1st of the game costs 1, the 2nd 2, the 3rd 3… Several in one turn are counted one after the other. An Artifact in play is never discarded to lower the cost.'
            ],
            ['expansions.artifacts.effects', 'Their effects act like those of the Units and the Buildings, at every turn.'],
            ['expansions.artifacts.age', 'They never age: no <age/> on them, they stay in play until the end of the game.'],
            ['expansions.artifacts.end', 'At the end of the game, add the <pl/> printed on each of your Artifacts.']
          ])}
        >
          <ExpansionCards type={MaterialType.Unit} ids={artifactIds} />
        </Section>
      )}
      <Section
        title={t('expansions.clarifications', 'Clarifications of the cards')}
        items={lines([
          ...((options.beyondTheGatesUnits
            ? [
                ['expansions.clar.shadow', 'Shadow: it can apply again the effects of a Unit deployed this same turn.'],
                ['expansions.clar.negative', 'Imp, Servile Minion: their negative cost is gold earned, which can pay right away for the other Units deployed.'],
                ['expansions.clar.dryad', 'Dryad: any combination of resources, one for one.']
              ]
            : []) as [string, string][]),
          // Only the Buildings drawn for this game
          ...(buildings.includes(Building.Abbey)
            ? [['expansions.clar.abbey', 'Abbey: a Kingdom that produces 2 <food/>, 1 <wood/> and 1 <crystal/> earns <pl4/>.'] as [string, string]]
            : []),
          ...(buildings.includes(Building.Port)
            ? [['expansions.clar.port', 'Port: <pl2/> for each type of resource produced, whatever the quantity.'] as [string, string]]
            : []),
          ...((artifacts
            ? [
                ['expansions.clar.banner', 'Banner Bearer: each condition is checked on its own; with a Unit of cost 3 or more, it earns <g2/> and <pl2/>.'],
                ['expansions.clar.harvest', 'Relic of Harvest: in the Front with 3 <wood/> and 2 <food/>, it earns <pl5/>; in the Back, nothing.'],
                ['expansions.clar.jester', 'Court Jester: the cards revealed that are not an Artifact are discarded; the Artifact costs nothing.'],
                ['expansions.clar.titan', 'Titan: neither the land cost nor the resources of the level 2 Building are paid.']
              ]
            : []) as [string, string][])
        ])}
      />
    </BookPage>
  )
}

/** A part of the rules: its title, its rules one per line, then the cards it is about */
const Section: FC<{ title: ReactNode; items: ReactNode[]; children?: ReactNode }> = ({ title, items, children }) =>
  items.length ? (
    <section css={sectionCss}>
      <h4 css={titleCss}>{title}</h4>
      <ul css={listCss}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      {children}
    </section>
  ) : null

const sectionCss = css`
  margin-top: 0.9em;
`

const titleCss = css`
  margin: 0 0 0.3em;
  font-family: 'Baloo 2', sans-serif;
  font-weight: 800;
  font-size: 1.25em;
  color: ${rust};
`

const listCss = css`
  margin: 0;
  padding-left: 1.2em;

  li {
    margin: 0.25em 0;
  }

  li::marker {
    color: ${rust};
  }
`

/** The buildings drawn for this game, on a torn slip */
const drawnCss = css`
  position: relative;
  isolation: isolate;
  /* Above what follows: the strip keeps its cards inside it, so a grown card would pass under the icons of the next lines */
  z-index: 1;
  margin: 0.8em 0 0;
  padding: 0.5em 1em;
  font-weight: 700;

  /* The torn paper behind the slip only: cut on the slip itself, it would cut the cards that grow on hover */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: #e9dccb;
    clip-path: ${tornClip};
  }
`
