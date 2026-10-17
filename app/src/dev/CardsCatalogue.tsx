import { DevToolEntry, Dialog } from '@gamepark/react-game'
import { FC, lazy, Suspense, useState } from 'react'
import { contentCss, dialogCss } from './catalogue.css'

// Loaded on demand: the catalogue reads the card descriptions, which depend on the table layout, which depends on them.
// Importing it with the table would evaluate the descriptions before the layout is ready.
const CatalogueContent = lazy(() => import('./CatalogueContent'))

/**
 * Development only: every card of the game with everything the code knows about it (descriptor, printed text in each
 * language, image of each edition), and the issues found (missing text, unknown icon, missing image), to check the
 * material at a glance.
 */
export const CardsCatalogue: FC = () => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <DevToolEntry icon="🂡" label="Cartes" desc="Toutes les cartes et leurs infos" onClick={() => setOpen(true)} />
      <Dialog open={open} onBackdropClick={() => setOpen(false)} css={dialogCss}>
        {/* The text is scaled inside: on the dialog itself, it would scale the book cover too */}
        <div css={contentCss}>
          {open && (
            <Suspense fallback={null}>
              <CatalogueContent close={() => setOpen(false)} />
            </Suspense>
          )}
        </div>
      </Dialog>
    </>
  )
}
