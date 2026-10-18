import { css } from '@emotion/react'
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { DialogNavigationProps } from '@gamepark/react-game'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { bookEm, coverMargin } from './book'
import { cutLine, paperFont, paperMuted, rust } from './tableTheme'

/** The dog-eared corners of the pages turn to the previous and the next item; the folio counts them */
export const PageCornerNavigation: FC<DialogNavigationProps> = ({ onPrevious, onNext, currentIndex, total }) => {
  const { t } = useTranslation()
  return (
    <>
      {onPrevious && (
        <button css={[cornerCss, previousCss]} data-page-corner onClick={onPrevious} title={t('dialog.previous', 'Previous')}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <span css={folioCss}>
        {currentIndex + 1} / {total}
      </span>
      {onNext && (
        <button css={[cornerCss, nextCss]} data-page-corner onClick={onNext} title={t('dialog.next', 'Next')}>
          <FontAwesomeIcon icon={faChevronRight} />
        </button>
      )}
    </>
  )
}

const cornerCss = css`
  position: absolute;
  bottom: ${coverMargin.bottom};
  z-index: 5;
  width: ${bookEm(3.4)};
  height: ${bookEm(3.4)};
  border: 0;
  padding: 0;
  background: none;
  cursor: pointer;
  filter: drop-shadow(${bookEm(-0.12)} ${bookEm(-0.12)} 0 #0003);

  &::before {
    content: '';
    position: absolute;
    inset: 0;
  }

  > svg {
    position: absolute;
    top: 0.55em;
    color: ${rust};
    font-size: ${bookEm(1.1)};
  }
`

const previousCss = css`
  left: ${coverMargin.side};

  &::before {
    background: linear-gradient(45deg, transparent 50%, ${paperMuted} 50%);
  }

  > svg {
    right: 0.55em;
  }
`

const nextCss = css`
  right: ${coverMargin.side};

  &::before {
    background: linear-gradient(315deg, transparent 50%, ${paperMuted} 50%);
  }

  > svg {
    left: 0.55em;
  }
`

/** The folio, centred under the item on the left page (in em of the mockup, the font size of the folio) */
const folioCss = css`
  position: absolute;
  bottom: ${0.9 + 1.2}em;
  left: 13.4em;
  transform: translateX(-50%);
  font-family: ${paperFont};
  font-weight: 700;
  font-size: ${bookEm(1)};
  color: ${cutLine}99;
`