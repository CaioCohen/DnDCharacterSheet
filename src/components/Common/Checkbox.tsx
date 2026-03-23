import { FC, InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: FC<CheckboxProps> = ({ label, ...props }) => {
  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        className={styles.input}
        {...props}
      />
      {label && <label className={styles.label}>{label}</label>}
    </div>
  );
};
