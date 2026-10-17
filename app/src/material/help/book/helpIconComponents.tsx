import { Resources } from '@gamepark/paper-tales/material/Resources'
import ageplus from '../../../images/icons/age-plus.webp'
import building1 from '../../../images/icons/building1.webp'
import building2 from '../../../images/icons/building2.webp'
import deploy from '../../../images/icons/deploy.webp'
import { AgeIcon, CoinIcon, GoldValueIcon, LegendIcon, LegendValueIcon, PrintedIcon, ResourceIcon, StrengthIcon } from './HelpIcons'
import { phaseIcons } from './phaseIcons'

const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

/**
 * The icons the texts printed on the cards use, as translation components: <food/>, <wood/>, <crystal/>, <gold/>,
 * <age/>, <ageplus/>, <deploy/>, <b1/>, <b2/>, <phase1/>…<phase6/>, <pl/>, <pl2/> (scroll with 2), <plm3/> (scroll with
 * -3), <g1/> (coin with 1), <s2/> (shield with 2), <sp1/> (shield with +1).
 */
export const helpIconComponents = {
  food: <ResourceIcon resource={Resources.Food} />,
  wood: <ResourceIcon resource={Resources.Wood} />,
  crystal: <ResourceIcon resource={Resources.Diamond} />,
  gold: <CoinIcon />,
  age: <AgeIcon />,
  ageplus: <PrintedIcon src={ageplus} />,
  deploy: <PrintedIcon src={deploy} />,
  b1: <PrintedIcon src={building1} />,
  b2: <PrintedIcon src={building2} />,
  pl: <LegendIcon />,
  ...Object.fromEntries(phaseIcons.map((icon, index) => [`phase${index + 1}`, <PrintedIcon key={index} src={icon} />])),
  ...Object.fromEntries(digits.map((n) => [`s${n}`, <StrengthIcon key={n} value={n} />])),
  ...Object.fromEntries(digits.map((n) => [`sp${n}`, <StrengthIcon key={n} value={`+${n}`} />])),
  ...Object.fromEntries(digits.map((n) => [`pl${n}`, <LegendValueIcon key={n} value={n} />])),
  ...Object.fromEntries(digits.map((n) => [`plm${n}`, <LegendValueIcon key={n} value={-n} />])),
  ...Object.fromEntries(digits.map((n) => [`g${n}`, <GoldValueIcon key={n} value={n} />]))
}
