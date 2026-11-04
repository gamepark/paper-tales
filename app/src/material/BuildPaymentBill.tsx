import { css } from '@emotion/react'
import { Building } from '@gamepark/paper-tales/material/Building'
import { buildingCardCharacteristics } from '@gamepark/paper-tales/material/BuildingCharacteristics'
import { BuildEffect, isIgnoreFieldCost, isIgnoreLevel2Cost, isReplaceResourceByGold, isReplaceResourceByResource } from '@gamepark/paper-tales/material/effects/5_Build'
import { Resources } from '@gamepark/paper-tales/material/Resources'
import { PaperTalesRules } from '@gamepark/paper-tales/PaperTalesRules'
import { PlayerColor } from '@gamepark/paper-tales/PlayerColor'
import { BuildAction, BuildHelper, ConstructionPayment, LevelCost } from '@gamepark/paper-tales/rules/helpers/BuildHelper'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { FC, ReactNode } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useUnitName } from '../logs/useUnitName'
import { cutLine, paper, paperFont, rustDeep, receiptTornClip } from '../theme/tableTheme'
import { Cost } from './help/book/Cost'
import { CoinIcon, ResourceIcon } from './help/book/HelpIcons'

const actionTexts: Record<BuildAction, [string, string]> = {
  [BuildAction.BuildLevel1]: ['build.bill.level1', 'Build at level 1'],
  [BuildAction.BuildLevel2]: ['build.bill.level2', 'Build directly at level 2'],
  [BuildAction.Upgrade]: ['build.bill.upgrade', 'Upgrade to level 2']
}

/**
 * How a construction is paid, shown when its hammer is hovered (on a phone, in the help of the building, see
 * BuildPaymentDetail): the building and the construction, then the detail of the payment
 */
export const BuildPaymentBill: FC<{ building: Building; action: BuildAction }> = ({ building, action }) => {
  const { t } = useTranslation()
  const me = usePlayerId<PlayerColor>()
  const rules = useRules<PaperTalesRules>()!
  if (me === undefined || !new BuildHelper(rules.game, me).getPayment(building, action)) return null
  const [titleKey, titleDefault] = actionTexts[action]
  return (
    <span css={billCss} data-tip>
      <span css={titleCss}>{t(`building.${building}`)}</span>
      <span css={subtitleCss}>{t(titleKey, titleDefault)}</span>
      <BuildPaymentDetail building={building} action={action} player={me} />
    </span>
  )
}

/**
 * The detail of a payment: the land, the printed cost of each level, what the kingdom produces, what another resource
 * or the gold replaces, and the cards that change the price, then the total and the gold left. It is the payment the
 * rules take (BuildHelper.getPayment), never a second count. Nothing when the construction cannot be paid.
 */
export const BuildPaymentDetail: FC<{ building: Building; action: BuildAction; player: PlayerColor }> = ({ building, action, player }) => {
  const { t, i18n } = useTranslation()
  const rules = useRules<PaperTalesRules>()!
  const unitName = useUnitName()
  const helper = new BuildHelper(rules.game, player)
  const payment = helper.getPayment(building, action)
  if (!payment) return null
  const sourcesOf = (predicate: (effect: BuildEffect) => boolean) => {
    const { cards, buildings } = helper.getBuildEffectSources(predicate)
    const names = [...cards.map(unitName), ...buildings.map((id) => t(`building.${id}`))]
    return new Intl.ListFormat(i18n.language, { type: 'conjunction' }).format(names)
  }
  return (
    <>
      <span css={rowsCss}>
        {action !== BuildAction.Upgrade && <LandRow payment={payment} sources={() => sourcesOf(isIgnoreFieldCost)} />}
        {payment.levels.map((level) => (
          <LevelRow key={level.level} building={building} level={level} sources={() => sourcesOf(isIgnoreLevel2Cost)} />
        ))}
        {payment.substituted.map(({ resource, by }, index) => (
          <Row
            key={`s${index}`}
            label={
              <Trans
                i18nKey="build.bill.substituted"
                defaults="<res/> replaced by <by/>"
                components={{ res: <ResourceIcon resource={resource} />, by: <ResourceIcon resource={by} /> }}
              />
            }
            note={sourcesOf(isReplaceResourceByResource)}
            value={<Check />}
          />
        ))}
        {payment.replacedByGold.length > 0 && (
          <Row
            label={<Trans i18nKey="build.bill.gold" defaults="Missing <res/>, paid in gold" components={{ res: <Cost cost={payment.replacedByGold} /> }} />}
            note={sourcesOf(isReplaceResourceByGold)}
            value={<Gold amount={payment.replacedByGold.length} />}
          />
        )}
        <Row total label={t('build.bill.total', 'To pay')} value={<Gold amount={payment.total} />} />
      </span>
      <span css={leftCss}>
        <Trans i18nKey="build.bill.left" defaults="You will have {gold} <coin/> left" values={{ gold: helper.gold - payment.total }} components={{ coin: <CoinIcon /> }} />
      </span>
    </>
  )
}

const LandRow: FC<{ payment: ConstructionPayment; sources: () => string }> = ({ payment, sources }) => {
  const { t } = useTranslation()
  if (payment.fieldIgnored) return <Row label={t('build.bill.land', 'Land')} note={sources()} value={t('build.bill.free', 'free')} />
  const count = payment.field / 2
  return (
    <Row
      label={t('build.bill.land', 'Land')}
      note={t('build.bill.land.built', { count, defaultValue: '{count, plural, one {# building already built} other {# buildings already built}}' })}
      value={<Gold amount={payment.field} />}
    />
  )
}

/** A level: its printed cost (the gold one when the kingdom lacks the resources), the gold it takes or ✓ */
const LevelRow: FC<{ building: Building; level: LevelCost; sources: () => string }> = ({ building, level, sources }) => {
  const { t } = useTranslation()
  const name = t('build.bill.level', { level: level.level, defaultValue: 'Level {level}' })
  if (level.ignored) return <Row label={name} note={sources()} value={t('build.bill.ignored', 'ignored')} />
  const { cost1, cost2 } = buildingCardCharacteristics[building]
  const note = level.alternate ? (
    <Trans i18nKey="build.bill.instead" defaults="instead of <cost/>" components={{ cost: <Cost cost={level.level === 1 ? cost1 : cost2} /> }} />
  ) : undefined
  const gold = level.cost.filter((resource) => resource === Resources.Gold).length
  return (
    <Row
      label={
        <span>
          {name} <Cost cost={level.cost.filter((resource) => resource !== Resources.Gold)} />
        </span>
      }
      note={note}
      value={gold ? <Gold amount={gold} /> : <Check />}
    />
  )
}

/** Produced by the kingdom: nothing to pay, the resources are not spent */
const Check: FC = () => <span css={checkCss}>✓</span>

const Gold: FC<{ amount: number }> = ({ amount }) => (
  <>
    {amount}
    <CoinIcon />
  </>
)

const Row: FC<{ label: ReactNode; note?: ReactNode; value: ReactNode; total?: boolean }> = ({ label, note, value, total }) => (
  <span css={[rowCss, total && totalCss]}>
    <span css={labelCss}>
      {label}
      {note && <span css={noteCss}>{note}</span>}
    </span>
    <span css={valueCss}>{value}</span>
  </span>
)

/** A receipt on a torn slip of paper, under the hammer: it is read, never clicked (the click builds) */
const billCss = css`
  position: absolute;
  top: calc(100% + 0.6em);
  left: 50%;
  width: 15em;
  padding: 0.8em 0.9em 0.8em;
  display: none;
  flex-direction: column;
  isolation: isolate;
  transform: translateX(-50%);
  pointer-events: none;
  color: ${cutLine};
  font-family: Mulish, ${paperFont};
  font-weight: 500;
  font-size: 1.15em;
  line-height: 1.3;
  text-align: left;
  white-space: normal;
  filter: drop-shadow(0.16em 0.2em 0 #00000059);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: ${paper};
    clip-path: ${receiptTornClip};
  }

  button:hover > &,
  button:focus-visible > & {
    display: flex;
  }
`

const titleCss = css`
  font-family: ${paperFont};
  font-weight: 800;
  font-size: 1.25em;
  line-height: 1.1;
  color: ${rustDeep};
`

const subtitleCss = css`
  font-family: ${paperFont};
  font-weight: 600;
  opacity: 0.75;
`

const rowsCss = css`
  display: flex;
  flex-direction: column;
  gap: 0.25em;
  margin-top: 0.5em;
`

const rowCss = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.6em;
`

const totalCss = css`
  margin-top: 0.2em;
  padding-top: 0.35em;
  border-top: 0.12em dashed ${cutLine}66;
  font-size: 1.1em;
`

const labelCss = css`
  display: flex;
  flex-direction: column;
`

const noteCss = css`
  font-size: 0.85em;
  color: #7a716a;
`

const valueCss = css`
  display: inline-flex;
  align-items: center;
  gap: 0.15em;
  white-space: nowrap;
  font-family: ${paperFont};
  font-weight: 800;
  font-size: 1.15em;
`

const checkCss = css`
  color: #2d7a3f;
`

const leftCss = css`
  margin-top: 0.25em;
  align-self: flex-end;
  display: inline-flex;
  align-items: center;
  gap: 0.2em;
  font-size: 0.85em;
  color: #7a716a;
`
