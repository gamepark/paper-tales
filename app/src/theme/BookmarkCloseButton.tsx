import { css } from '@emotion/react'
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { bookEm, crimson } from './book'
import { paper } from './tableTheme'

/** The ribbon bookmark of the story book closes the window */
export const BookmarkCloseButton: FC<{ onClick: () => void }> = ({ onClick }) => {
  const { t } = useTranslation()
  return (
    <button css={bookmarkCss} onClick={onClick} title={t('dialog.close', 'Close')}>
      <FontAwesomeIcon icon={faXmark} />
    </button>
  )
}

const bookmarkCss = css`
  position: absolute;
  top: ${bookEm(-0.3)};
  right: ${bookEm(2.2)};
  z-index: 100;
  width: ${bookEm(2.4)};
  height: ${bookEm(3.6)};
  padding: ${bookEm(0.8)} 0 0;
  display: grid;
  place-items: start center;
  border: 0;
  background: ${crimson};
  color: ${paper};
  cursor: pointer;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%);

  > svg {
    font-size: ${bookEm(1.05)};
  }

  &:hover {
    background: #7d2340;
  }
`
