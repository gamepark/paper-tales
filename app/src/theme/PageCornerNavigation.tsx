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
        <button css={[cornerCss, previousCss]} onClick={onPrevious} title={t('dialog.previous', 'Previous')}>
          <FontAwesomeIcon icon={faChevronLeft} />
        </button>
      )}
      <span css={folioCss}>
        {currentIndex + 1} / {total}
      </span>
      {onNext && (
        <button css={[cornerCss, nextCss]} onClick={onNext} title={t('dialog.next', 'Next')}>
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
    top: ${bookEm(0.55)};
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
    right: ${bookEm(0.55)};
  }
`

const nextCss = css`
  right: ${coverMargin.side};

  &::before {
    background: linear-gradient(315deg, transparent 50%, ${paperMuted} 50%);
  }

  > svg {
    left: ${bookEm(0.55)};
  }
`

const folioCss = css`
  position: absolute;
  bottom: ${bookEm(0.9 + 1.2)};
  left: ${bookEm(0.55 + 3.4 + 1)};
  font-family: ${paperFont};
  font-weight: 700;
  font-size: ${bookEm(1)};
  color: ${cutLine}99;
`
