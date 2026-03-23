import { FC, useState } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { TextArea } from '@/components/Common/TextArea';
import styles from './BottomSection.module.css';

export const BottomSection: FC = () => {
  const { character, dispatch } = useCharacterSheet();
  const [spellTitle, setSpellTitle] = useState('');
  const [spellLevel, setSpellLevel] = useState(0);
  const [spellSchool, setSpellSchool] = useState('');
  const [spellDescription, setSpellDescription] = useState('');
  const [spellComponents, setSpellComponents] = useState('');
  const [spellCastingTime, setSpellCastingTime] = useState('');
  const [spellDuration, setSpellDuration] = useState('');
  const [spellRange, setSpellRange] = useState('');

  const addSpell = () => {
    if (!spellTitle.trim()) return;
    dispatch({
      type: 'ADD_SPELL',
      payload: {
        id: crypto.randomUUID(),
        title: spellTitle.trim(),
        level: spellLevel,
        school: spellSchool.trim() || undefined,
        description: spellDescription.trim(),
        components: spellComponents.trim() || undefined,
        castingTime: spellCastingTime.trim() || undefined,
        duration: spellDuration.trim() || undefined,
        range: spellRange.trim() || undefined
      }
    });
    setSpellTitle('');
    setSpellLevel(0);
    setSpellSchool('');
    setSpellDescription('');
    setSpellComponents('');
    setSpellCastingTime('');
    setSpellDuration('');
    setSpellRange('');
  };

  const spellsByLevel = character.spells.reduce((acc, spell) => {
    if (!acc[spell.level]) acc[spell.level] = [];
    acc[spell.level].push(spell);
    return acc;
  }, {} as Record<number, typeof character.spells>);

  return (
    <div className={styles.container}>
      <section className={styles.section}>
        <h2 className={styles.heading}>Backstory</h2>
        <TextArea
          value={character.backstory}
          onChange={(event) => {
            dispatch({
              type: 'UPDATE_CHARACTER_INFO',
              payload: { backstory: event.target.value }
            });
          }}
          placeholder="Write your character's backstory here..."
        />
      </section>

      <section className={styles.section}>
        <h2 className={styles.heading}>Spells</h2>

        {Object.keys(spellsByLevel).length === 0 && <div className={styles.emptyMessage}>No spells yet.</div>}

        {Object.entries(spellsByLevel)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, spells]) => (
            <div key={level} className={styles.spellLevelGroup}>
              <div className={styles.spellLevelHeader}>
              <h3 className={styles.spellLevelHeading}>
                {level === '0' ? 'Cantrips' : `Level ${level}`}
              </h3>
              {level !== '0' && (
                <div className={styles.spellSlotControls}>
                  <div className={styles.spellSlotInput}>
                    <label>Current</label>
                    <input
                      type="number"
                      min={0}
                      value={character.spellSlots?.[Number(level)]?.current ?? 0}
                      onChange={(e) => {
                        const nextCurrent = Math.max(0, parseInt(e.target.value) || 0);
                        const currentSlot = character.spellSlots?.[Number(level)] || { current: 0, max: 0 };
                        dispatch({
                          type: 'UPDATE_SPELL_SLOTS',
                          payload: { level: Number(level), current: nextCurrent, max: currentSlot.max }
                        });
                      }}
                    />
                  </div>
                  <div className={styles.spellSlotInput}>
                    <label>Max</label>
                    <input
                      type="number"
                      min={0}
                      value={character.spellSlots?.[Number(level)]?.max ?? 0}
                      onChange={(e) => {
                        const nextMax = Math.max(0, parseInt(e.target.value) || 0);
                        const currentSlot = character.spellSlots?.[Number(level)] || { current: 0, max: 0 };
                        dispatch({
                          type: 'UPDATE_SPELL_SLOTS',
                          payload: { level: Number(level), current: currentSlot.current, max: nextMax }
                        });
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <div className={styles.spellList}>
                {spells.map(spell => (
                  <details key={spell.id} className={styles.accordionItem}>
                    <summary className={styles.accordionSummary}>
                      {spell.title}
                      {spell.school && <span>({spell.school})</span>}
                    </summary>
                    <div className={styles.accordionContent}>
                      <div className={styles.spellMeta}>
                        {spell.castingTime && <span><strong>Casting Time:</strong> {spell.castingTime}</span>}
                        {spell.range && <span><strong>Range:</strong> {spell.range}</span>}
                        {spell.components && <span><strong>Components:</strong> {spell.components}</span>}
                        {spell.duration && <span><strong>Duration:</strong> {spell.duration}</span>}
                      </div>
                      <p>{spell.description}</p>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        onClick={() => dispatch({ type: 'DELETE_SPELL', payload: spell.id })}
                      >
                        Delete
                      </button>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}

        <div className={styles.spellForm}>
          <input
            className={styles.input}
            placeholder="Spell name"
            value={spellTitle}
            onChange={(e) => setSpellTitle(e.target.value)}
          />
          <div className={styles.formRow}>
            <select
              className={styles.select}
              value={spellLevel}
              onChange={(e) => setSpellLevel(Number(e.target.value))}
            >
              <option value={0}>Cantrip</option>
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Level {i + 1}</option>
              ))}
            </select>
            <input
              className={styles.input}
              placeholder="School (optional)"
              value={spellSchool}
              onChange={(e) => setSpellSchool(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <input
              className={styles.input}
              placeholder="Casting time"
              value={spellCastingTime}
              onChange={(e) => setSpellCastingTime(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Range"
              value={spellRange}
              onChange={(e) => setSpellRange(e.target.value)}
            />
          </div>
          <div className={styles.formRow}>
            <input
              className={styles.input}
              placeholder="Components"
              value={spellComponents}
              onChange={(e) => setSpellComponents(e.target.value)}
            />
            <input
              className={styles.input}
              placeholder="Duration"
              value={spellDuration}
              onChange={(e) => setSpellDuration(e.target.value)}
            />
          </div>
          <TextArea
            className={styles.textArea}
            placeholder="Description"
            value={spellDescription}
            onChange={(e) => setSpellDescription(e.target.value)}
          />
          <button type="button" className={styles.addButton} onClick={addSpell}>
            Add Spell
          </button>
        </div>
      </section>
    </div>
  );
};

