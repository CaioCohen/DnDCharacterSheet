import { FC, useState } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { TextArea } from '@/components/Common/TextArea';
import { Modal } from '@/components/Common/Modal';
import { NumberInput } from '@/components/Common/NumberInput';
import { SpellAutocomplete } from '@/components/Common/SpellAutocomplete';
import styles from './BottomSection.module.css';

export const BottomSection: FC = () => {
  const { character, dispatch } = useCharacterSheet();
  // Spell modal state
  const [isSpellModalOpen, setIsSpellModalOpen] = useState(false);
  // Inventory modal state
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [inventoryTitle, setInventoryTitle] = useState('');
  const [inventoryQuantity, setInventoryQuantity] = useState(0);
  const [inventoryDescription, setInventoryDescription] = useState('');
  const [editingInventoryId, setEditingInventoryId] = useState<string | null>(null);

  const handleAddSpell = (spell: {
    id: string;
    title: string;
    level: number;
    school?: string;
    description: string;
    components?: string;
    castingTime?: string;
    duration?: string;
    range?: string;
  }) => {
    dispatch({ type: 'ADD_SPELL', payload: spell });
  };

  const spellsByLevel = character.spells.reduce((acc, spell) => {
    if (!acc[spell.level]) acc[spell.level] = [];
    acc[spell.level].push(spell);
    return acc;
  }, {} as Record<number, typeof character.spells>);

  return (
    <div className={styles.container}>
      <section className={`${styles.section} ${styles.backstorySection}`}>
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
      {/* Inventory Section */}
      <section className={`${styles.section} ${styles.inventorySection}`}>
        <h2 className={styles.heading}>Inventory</h2>

        <div className={styles.accordionList}>
          {character.inventory.length === 0 && (
            <div className={styles.emptyMessage}>No items yet.</div>
          )}
          {character.inventory.map(item => (
            <details key={item.id} className={styles.accordionItem}>
              <summary className={styles.accordionSummary}>
                {item.title} {item.quantity ? `(${item.quantity})` : ''}
              </summary>
              <div className={styles.accordionContent}>
                <p>{item.description}</p>
                {item.quantity !== undefined && (
                  <div>Quantity: {item.quantity}</div>
                )}
                <button
                  type="button"
                  className={styles.deleteButton}
                  onClick={() =>
                    dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: item.id })
                  }
                >
                  Delete
                </button>
                <button
                  type="button"
                  className={styles.addButton}
                  onClick={() => {
                    setEditingInventoryId(item.id);
                    setInventoryTitle(item.title);
                    setInventoryQuantity(item.quantity ?? 0);
                    setInventoryDescription(item.description);
                    setIsInventoryModalOpen(true);
                  }}
                >
                  Edit
                </button>
              </div>
            </details>
          ))}
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => {
            setEditingInventoryId(null);
            setInventoryTitle('');
            setInventoryQuantity(0);
            setInventoryDescription('');
            setIsInventoryModalOpen(true);
          }}
        >
          Add Item
        </button>

        <Modal
          isOpen={isInventoryModalOpen}
          title={editingInventoryId ? 'Edit Inventory Item' : 'Add Inventory Item'}
          onClose={() => setIsInventoryModalOpen(false)}
        >
          <div className={styles.featureForm}>
            <input
              className={styles.input}
              placeholder="Item name"
              value={inventoryTitle}
              onChange={(e) => setInventoryTitle(e.target.value)}
            />
            <NumberInput
              label="Quantity"
              value={inventoryQuantity}
              min={0}
              onChange={(e) => setInventoryQuantity(parseInt(e.target.value) || 0)}
            />
            <textarea
              className={styles.textArea}
              placeholder="Description"
              value={inventoryDescription}
              onChange={(e) => setInventoryDescription(e.target.value)}
            />
            <div style={{ marginTop: 'var(--spacing-sm)', textAlign: 'right' }}>
              <button
                className={styles.addButton}
                onClick={() => {
                  if (!inventoryTitle.trim()) return;
                  const payload = {
                    id: editingInventoryId ?? crypto.randomUUID(),
                    title: inventoryTitle.trim(),
                    description: inventoryDescription.trim(),
                    quantity: inventoryQuantity
                  } as any;
                  if (editingInventoryId) {
                    dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload });
                  } else {
                    dispatch({ type: 'ADD_INVENTORY_ITEM', payload });
                  }
                  setIsInventoryModalOpen(false);
                  setEditingInventoryId(null);
                }}
              >
                Save
              </button>
              <button
                className={styles.addButton}
                style={{ marginLeft: 'var(--spacing-xs)' }}
                onClick={() => {
                  setIsInventoryModalOpen(false);
                  setEditingInventoryId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      </section>

      {/* Spellcasting Section */}
      <section className={`${styles.section} ${styles.spellcastingSection}`}>
        <h2 className={styles.heading}>Spellcasting</h2>

        {/* Spells List */}
        {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map(level => {
          const spells = spellsByLevel[level] || [];
          return (
            <div key={level} className={styles.spellLevelGroup}>
              <div className={styles.spellLevelHeader}>
                <h3 className={styles.spellLevelHeading}>
                  {level === 0 ? 'Cantrips' : `Level ${level}`}
                </h3>
                {level > 0 && (
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
                      <input
                        type="checkbox"
                        checked={spell.checked ?? false}
                        onChange={(e) => {
                          e.stopPropagation();
                          dispatch({ 
                            type: 'UPDATE_SPELL', 
                            payload: { ...spell, checked: e.target.checked } 
                          });
                        }}
                        style={{ marginRight: '8px', cursor: 'pointer' }}
                      />
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
          );
        })}

        {/* Add Spell Button */}
        <button
          type="button"
          className={styles.addButton}
          onClick={() => setIsSpellModalOpen(true)}
        >
          Add Spell
        </button>

        {/* Spell Autocomplete Modal */}
        <SpellAutocomplete
          isOpen={isSpellModalOpen}
          onClose={() => setIsSpellModalOpen(false)}
          onAddSpell={handleAddSpell}
        />
      </section>
    </div>
  );
};
