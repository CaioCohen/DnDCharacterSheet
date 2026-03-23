import { FC, useState } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { NumberInput } from '@/components/Common//NumberInput';
import { TextArea } from '@/components/Common//TextArea';
import styles from './RightColumn.module.css';

export const RightColumn: FC = () => {
  const { character, dispatch } = useCharacterSheet();
  const [featureTitle, setFeatureTitle] = useState('');
  const [featureOrigin, setFeatureOrigin] = useState('');
  const [featureDescription, setFeatureDescription] = useState('');
  const [customInitiativeModifier, setCustomInitiativeModifier] = useState(0);

  const dexModifier = character.attributes.dexterity.modifier;
  const calculatedInitiative = dexModifier + customInitiativeModifier;

  const addFeature = () => {
    if (!featureTitle.trim()) return;
    dispatch({
      type: 'ADD_FEATURE',
      payload: {
        id: crypto.randomUUID(),
        title: featureTitle.trim(),
        origin: featureOrigin.trim(),
        description: featureDescription.trim()
      }
    });
    setFeatureTitle('');
    setFeatureOrigin('');
    setFeatureDescription('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.combatStats}>
        <div className={styles.stat}>
          <label className={styles.label}>Armor Class</label>
          <NumberInput
            value={character.armorClass}
            min={0}
            max={30}
            onChange={(event) => {
              dispatch({
                type: 'UPDATE_CHARACTER_INFO',
                payload: { armorClass: parseInt(event.target.value) || 10 }
              });
            }}
          />
        </div>

        <div className={styles.stat}>
          <label className={styles.label}>Initiative</label>
          <div className={styles.staticValue}>
            {calculatedInitiative > 0 ? '+' : ''}{calculatedInitiative}
          </div>
        </div>

        <div className={styles.stat}>
          <label className={styles.label}>Custom Initiative Modifier</label>
          <NumberInput
            value={customInitiativeModifier}
            onChange={(event) => {
              const value = parseInt(event.target.value);
              setCustomInitiativeModifier(isNaN(value) ? 0 : value);
            }}
          />
        </div>

        <div className={styles.stat}>
          <label className={styles.label}>Speed (ft)</label>
          <NumberInput
            value={character.speed}
            onChange={(event) => {
              dispatch({
                type: 'UPDATE_CHARACTER_INFO',
                payload: { speed: parseInt(event.target.value) || 30 }
              });
            }}
          />
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Hit Points</h3>
        <div className={styles.hpGrid}>
          <div className={styles.hpItem}>
            <label className={styles.label}>Max</label>
            <NumberInput
              value={character.hitPoints.max}
              min={1}
              onChange={(event) => {
                dispatch({
                  type: 'UPDATE_HP',
                  payload: { max: parseInt(event.target.value) || 1 }
                });
              }}
            />
          </div>
          <div className={styles.hpItem}>
            <label className={styles.label}>Current</label>
            <NumberInput
              value={character.hitPoints.current}
              min={0}
              onChange={(event) => {
                dispatch({
                  type: 'UPDATE_HP',
                  payload: { current: parseInt(event.target.value) || 0 }
                });
              }}
            />
          </div>
          <div className={styles.hpItem}>
            <label className={styles.label}>Temp</label>
            <NumberInput
              value={character.hitPoints.temporary}
              min={0}
              onChange={(event) => {
                dispatch({
                  type: 'UPDATE_HP',
                  payload: { temporary: parseInt(event.target.value) || 0 }
                });
              }}
            />
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Death Saves</h3>
        <div className={styles.deathSavesContainer}>
          <div className={styles.deathSaveColumn}>
            <label className={styles.label}>Successes</label>
            <div className={styles.deathSaveButtons}>
              {[0, 1, 2].map(num => (
                <button
                  key={`success-${num}`}
                  className={`${styles.deathSaveButton} ${character.deathSaves.successes > num ? styles.active : ''}`}
                  onClick={() => {
                    dispatch({
                      type: 'UPDATE_DEATH_SAVES',
                      payload: { successes: character.deathSaves.successes > num ? num : num + 1 }
                    });
                  }}
                >
                  {num + 1}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.deathSaveColumn}>
            <label className={styles.label}>Failures</label>
            <div className={styles.deathSaveButtons}>
              {[0, 1, 2].map(num => (
                <button
                  key={`failure-${num}`}
                  className={`${styles.deathSaveButton} ${styles.failure} ${character.deathSaves.failures > num ? styles.active : ''}`}
                  onClick={() => {
                    dispatch({
                      type: 'UPDATE_DEATH_SAVES',
                      payload: { failures: character.deathSaves.failures > num ? num : num + 1 }
                    });
                  }}
                >
                  {num + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.heading}>Features & Traits</h3>

        <div className={styles.accordionList}>
          {character.featuresTraits.length === 0 && <div className={styles.emptyMessage}>No features yet.</div>}

          {character.featuresTraits.map(feature => (
            <details key={feature.id} className={styles.accordionItem}>
              <summary className={styles.accordionSummary}>{feature.title} <span>({feature.origin})</span></summary>
              <div className={styles.accordionContent}>
                <p>{feature.description}</p>
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() => dispatch({ type: 'DELETE_FEATURE', payload: feature.id })}
                >
                  Delete
                </button>
              </div>
            </details>
          ))}
        </div>

        <div className={styles.featureForm}>
          <input
            className={styles.input}
            placeholder="Feature title"
            value={featureTitle}
            onChange={(e) => setFeatureTitle(e.target.value)}
          />
          <input
            className={styles.input}
            placeholder="Origin (class/race/etc.)"
            value={featureOrigin}
            onChange={(e) => setFeatureOrigin(e.target.value)}
          />
          <TextArea
            className={styles.textArea}
            placeholder="Description"
            value={featureDescription}
            onChange={(e) => setFeatureDescription(e.target.value)}
          />
          <button type="button" className={styles.addButton} onClick={addFeature}>
            Add Feature
          </button>
        </div>
      </div>
    </div>
  );
};

