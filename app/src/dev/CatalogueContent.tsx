import { Building } from '@gamepark/paper-tales/material/Building'
import { Unit } from '@gamepark/paper-tales/material/Unit'
import { getEnumValues } from '@gamepark/rules-api'
import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BuildingCatalogueEntry } from './BuildingCatalogueEntry'
import { buildingIssues, unitIssues } from './cardIssues'
import { headerCss, listCss, summaryCss, toggleCss } from './catalogue.css'
import { UnitCatalogueEntry } from './UnitCatalogueEntry'

type Kind = 'units' | 'buildings'
const languages = ['fr', 'en']

/**
 * The content of the cards catalogue: the kind and language toggles, the count of issues, and one entry per card.
 * Loaded when the catalogue opens: the card descriptions it reads are initialised by then.
 */
const CatalogueContent: FC<{ close: () => void }> = ({ close }) => {
  const { i18n } = useTranslation()
  const [kind, setKind] = useState<Kind>('units')
  const [lng, setLng] = useState(i18n.language)
  const [loaded, setLoaded] = useState(i18n.language)

  // The texts of the other language are fetched on demand
  useEffect(() => {
    let cancelled = false
    i18n.loadLanguages(lng).then(() => !cancelled && setLoaded(lng))
    return () => {
      cancelled = true
    }
  }, [lng, i18n])

  const units = getEnumValues(Unit)
  const buildings = getEnumValues(Building)
  const issues = kind === 'units' ? units.flatMap((unit) => unitIssues(i18n, loaded, unit)) : buildings.flatMap((building) => buildingIssues(i18n, loaded, building))

  return (
    <>
      <div css={headerCss}>
        <h2>Cartes</h2>
        <span css={toggleCss}>
          <button data-active={kind === 'units'} onClick={() => setKind('units')}>
            Unités ({units.length})
          </button>
          <button data-active={kind === 'buildings'} onClick={() => setKind('buildings')}>
            Bâtiments ({buildings.length})
          </button>
        </span>
        <span css={toggleCss}>
          {languages.map((language) => (
            <button key={language} data-active={lng === language} onClick={() => setLng(language)}>
              {language}
            </button>
          ))}
        </span>
        <button onClick={close}>✕</button>
      </div>
      <p css={summaryCss} data-ok={issues.length === 0}>
        {issues.length ? `${issues.length} problème(s)` : 'Aucun problème'}
      </p>
      <div css={listCss}>
        {kind === 'units' && units.map((unit) => <UnitCatalogueEntry key={unit} unit={unit} lng={loaded} i18n={i18n} />)}
        {kind === 'buildings' && buildings.map((building) => <BuildingCatalogueEntry key={building} building={building} lng={loaded} i18n={i18n} />)}
      </div>
    </>
  )
}

export default CatalogueContent
