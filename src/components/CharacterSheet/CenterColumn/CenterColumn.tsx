import { FC } from 'react';
import { useCharacterSheet } from '../../../hooks/useCharacterSheet';
import { NumberInput } from '../../Common/NumberInput';
import styles from './CenterColumn.module.css';

export const CenterColumn: FC = () => {
  const { character, dispatch } = useCharacterSheet();

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.heading}>Inspiration</h3>
        <NumberInput
          value={character.inspiration}
          min={0}
          max={5}
          onChange={(event) => {
            dispatch({
              type: 'UPDATE_CHARACTER_INFO',
              payload: { inspiration: parseInt(event.target.value) || 0 }
            });
          }}
        />
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Proficiency Bonus</h3>
        <div className={styles.staticValue}>{character.proficiencyBonus > 0 ? '+' : ''}{character.proficiencyBonus}</div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Saving Throws</h3>
        <div className={styles.savingThrowsList}>
          {character.savingThrows.map(st => (
            <label key={st.attribute} className={styles.savingThrowItem}>
              <input
                type="checkbox"
                checked={st.isProficient}
                onChange={() => dispatch({ type: 'TOGGLE_SAVING_THROW', payload: st.attribute })}
              />
              <span className={styles.savingThrowName}>
                {st.attribute.charAt(0).toUpperCase() + st.attribute.slice(1)}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Proficiencies & Languages</h3>
        <textarea
          className={styles.textarea}
          value={character.proficienciesLanguages}
          onChange={(event) => {
            dispatch({
              type: 'UPDATE_CHARACTER_INFO',
              payload: { proficienciesLanguages: event.target.value }
            });
          }}
          placeholder="Enter proficiencies and languages..."
        />
      </div>
    </div>
  );
};
