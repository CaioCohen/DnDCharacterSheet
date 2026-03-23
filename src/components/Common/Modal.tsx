import { FC, ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children, footer }) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};
