import { css } from '@emotion/react'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons/faArrowLeft'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { bookEm } from './book'
import { paper, rust, rustDeep } from './tableTheme'

/** A second ribbon bookmark, on the left page, goes back to the page opened before: the rules of the expansions for a card */
export const BookmarkBackButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <button css={bookmarkCss} onClick={onClick} title={t('dialog.back', 'Back')}>
      <FontAwesomeIcon icon={faArrowLeft} />
    </button>
  )
}

const bookmarkCss = css`
  position: absolute;
  top: ${bookEm(-0.3)};
  left: ${bookEm(2.2)};
  z-index: 100;
  width: ${bookEm(2.4)};
  height: ${bookEm(3.6)};
  padding: ${bookEm(0.8)} 0 0;
  display: grid;
  place-items: start center;
  border: 0;
  background: ${rust};
  color: ${paper};
  cursor: pointer;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);

  > svg {
    font-size: ${bookEm(1.05)};
  }

  &:hover {
    background: ${rustDeep};
  }
`
