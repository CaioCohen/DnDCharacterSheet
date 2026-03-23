import { FC, TextareaHTMLAttributes } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: FC<TextAreaProps> = ({ label, error, ...props }) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={`${styles.textarea} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
