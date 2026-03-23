import { FC } from 'react';
import { useCharacterSheet } from '../../../hooks/useCharacterSheet';
import { NumberInput } from '../../Common/NumberInput';
import styles from './TopHeader.module.css';

export const TopHeader: FC = () => {
  const { character, dispatch } = useCharacterSheet();

  const handleInputChange = (field: string, value: string | number) => {
    dispatch({
      type: 'UPDATE_CHARACTER_INFO',
      payload: { [field]: value }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.nameSection}>
          <input
            type="text"
            value={character.name}
            onChange={(event) => handleInputChange('name', event.target.value)}
            className={styles.nameInput}
            placeholder="Character Name"
            aria-label="Character name"
          />
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.label}>Class</label>
            <input
              type="text"
              value={character.class}
              onChange={(event) => handleInputChange('class', event.target.value)}
              placeholder="e.g., Fighter"
              className={styles.textInput}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Level</label>
            <NumberInput
              value={character.level}
              min={1}
              max={20}
              onChange={(event) => handleInputChange('level', parseInt(event.target.value) || 1)}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Race</label>
            <input
              type="text"
              value={character.race}
              onChange={(event) => handleInputChange('race', event.target.value)}
              placeholder="e.g., Human"
              className={styles.textInput}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Background</label>
            <input
              type="text"
              value={character.background}
              onChange={(event) => handleInputChange('background', event.target.value)}
              placeholder="e.g., Soldier"
              className={styles.textInput}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Alignment</label>
            <input
              type="text"
              value={character.alignment}
              onChange={(event) => handleInputChange('alignment', event.target.value)}
              placeholder="e.g., Lawful Good"
              className={styles.textInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
