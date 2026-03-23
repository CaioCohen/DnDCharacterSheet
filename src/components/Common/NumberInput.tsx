import { FC, InputHTMLAttributes } from 'react';
import styles from './NumberInput.module.css';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const NumberInput: FC<NumberInputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="number"
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
