import { FC, useState } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { NumberInput } from '@/components/Common//NumberInput';
import { Modal } from '@/components/Common/Modal';
import { FeatureAutocomplete } from '@/components/Common/FeatureAutocomplete';
import styles from './RightColumn.module.css';

export const RightColumn: FC = () => {
  const { character, dispatch } = useCharacterSheet();
  const [customInitiativeModifier, setCustomInitiativeModifier] = useState(0);
  // Custom counters modal state
  const [isCounterModalOpen, setIsCounterModalOpen] = useState(false);
  // Feature modal state
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [counterTitle, setCounterTitle] = useState('');
  const [counterValue, setCounterValue] = useState(0);
  const [editingCounterId, setEditingCounterId] = useState<string | null>(null);

  const dexModifier = character.attributes.dexterity.modifier;
  const calculatedInitiative = dexModifier + customInitiativeModifier;

  const handleAddFeature = (feature: {
    id: string;
    title: string;
    origin: string;
    description: string;
  }) => {
    dispatch({ type: 'ADD_FEATURE', payload: feature });
  };

  const handleCounterSubmit = () => {
    if (!counterTitle.trim()) return;
    const payload = {
      id: editingCounterId ?? crypto.randomUUID(),
      title: counterTitle.trim(),
      value: Number(counterValue) || 0
    } as any;
    if (editingCounterId) {
      dispatch({ type: 'UPDATE_CUSTOM_COUNTER', payload });
    } else {
      dispatch({ type: 'ADD_CUSTOM_COUNTER', payload });
    }
    setCounterTitle('');
    setCounterValue(0);
    setEditingCounterId(null);
    setIsCounterModalOpen(false);
  };

  // Render custom counters grid
  const handleCounterFieldChange = (id: string, field: 'title' | 'value', newVal: string | number) => {
    const existing = character.customCounters?.find(c => c.id === id);
    if (!existing) return;
    const updated = {
      id,
      title: field === 'title' ? (newVal as string) : existing.title,
      value: field === 'value' ? Number(newVal) : existing.value
    } as any;
    dispatch({ type: 'UPDATE_CUSTOM_COUNTER', payload: updated });
  };

  const renderCounters = () => (
    <div className={styles.customCountersGrid}>
      {(character.customCounters || []).map(counter => (
        <div key={counter.id} className={styles.counterItem}>
          <button
            type="button"
            className={styles.deleteButton}
            style={{ position: 'absolute', top: '4px', right: '4px' }}
            onClick={() => dispatch({ type: 'DELETE_CUSTOM_COUNTER', payload: counter.id })}
          >
            ×
          </button>
          <input
            className={styles.input}
            value={counter.title}
            onChange={e => handleCounterFieldChange(counter.id, 'title', e.target.value)}
          />
          <NumberInput
            value={counter.value}
            min={0}
            style={{ width: '80px', margin: '0 auto' }}
            onChange={e => handleCounterFieldChange(counter.id, 'value', parseInt(e.target.value) || 0)}
          />
        </div>
      ))}
    </div>
  );

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

        {/* Feature add button opens modal */}
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsFeatureModalOpen(true)}
        >
          Add Feature
        </button>
        {/* Feature Autocomplete Modal */}
        <FeatureAutocomplete
          isOpen={isFeatureModalOpen}
          onClose={() => setIsFeatureModalOpen(false)}
          onAddFeature={handleAddFeature}
        />
         </div>
       {/* Custom Counters Section */}
      <div className={styles.section}>
        <h3 className={styles.heading}>Custom Counters</h3>
        {renderCounters()}
        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            setEditingCounterId(null);
            setCounterTitle('');
            setCounterValue(0);
            setIsCounterModalOpen(true);
          }}
        >
          Add Custom Counter
        </button>
        <Modal
          isOpen={isCounterModalOpen}
          title={editingCounterId ? 'Edit Counter' : 'Add Custom Counter'}
          onClose={() => {
            setIsCounterModalOpen(false);
            setEditingCounterId(null);
          }}
        >
          <div className={styles.featureForm}>
            <input
              className={styles.input}
              placeholder="Counter title"
              value={counterTitle}
              onChange={e => setCounterTitle(e.target.value)}
            />
            <NumberInput
              value={counterValue}
              min={0}
              onChange={e => setCounterValue(parseInt(e.target.value) || 0)}
            />
          </div>
          <div style={{ marginTop: 'var(--spacing-sm)', textAlign: 'right' }}>
            <button className={styles.addButton} onClick={handleCounterSubmit}>
              Save
            </button>
            <button
              className={styles.addButton}
              style={{ marginLeft: 'var(--spacing-xs)' }}
              onClick={() => {
                setIsCounterModalOpen(false);
                setEditingCounterId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

