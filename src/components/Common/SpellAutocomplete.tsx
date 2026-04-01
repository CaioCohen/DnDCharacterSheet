import { FC, useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { TextArea } from './TextArea';
import { DndSpell } from '@/types/dndSpell';
import dndSpellsData from '@/assets/dnd spells.json';
import styles from './SpellAutocomplete.module.css';

interface SpellFormData {
  title: string;
  level: number;
  school: string;
  description: string;
  components: string;
  castingTime: string;
  duration: string;
  range: string;
}

interface SpellAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSpell: (spell: {
    id: string;
    title: string;
    level: number;
    school?: string;
    description: string;
    components?: string;
    castingTime?: string;
    duration?: string;
    range?: string;
    checked?: boolean;
  }) => void;
}

const dndSpells = dndSpellsData as DndSpell[];

export const SpellAutocomplete: FC<SpellAutocompleteProps> = ({ isOpen, onClose, onAddSpell }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSpells, setFilteredSpells] = useState<DndSpell[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState<SpellFormData>({
    title: '',
    level: 0,
    school: '',
    description: '',
    components: '',
    castingTime: '',
    duration: '',
    range: ''
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTerm.trim().length >= 1) {
      const filtered = dndSpells.filter(spell =>
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
      setFilteredSpells(filtered);
      setShowDropdown(true);
    } else {
      setFilteredSpells([]);
      setShowDropdown(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSpellSelect = (spell: DndSpell) => {
    let description = spell.description;
    if (spell.higherLevelSlot) {
      description = description + ' ' + spell.higherLevelSlot;
    }
    if (spell.cantripUpgrade) {
      description = description + ' ' + spell.cantripUpgrade;
    }

    setFormData({
      title: spell.name,
      level: spell.level,
      school: spell.school,
      description: description,
      components: spell.components.join(', '),
      castingTime: spell.actionType,
      duration: spell.duration,
      range: spell.range
    });
    setSearchTerm(spell.name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onAddSpell({
      id: crypto.randomUUID(),
      title: formData.title.trim(),
      level: formData.level,
      school: formData.school.trim() || undefined,
      description: formData.description.trim(),
      components: formData.components.trim() || undefined,
      castingTime: formData.castingTime.trim() || undefined,
      duration: formData.duration.trim() || undefined,
      range: formData.range.trim() || undefined,
      checked: false
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSearchTerm('');
    setFormData({
      title: '',
      level: 0,
      school: '',
      description: '',
      components: '',
      castingTime: '',
      duration: '',
      range: ''
    });
    setFilteredSpells([]);
    setShowDropdown(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} title="Add Spell" onClose={handleClose}>
      <div className={styles.autocompleteWrapper} ref={dropdownRef}>
        <label className={styles.label}>Search Spell</label>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Type spell name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (filteredSpells.length > 0) setShowDropdown(true);
          }}
        />
        {showDropdown && filteredSpells.length > 0 && (
          <div className={styles.dropdown}>
            {filteredSpells.map((spell, index) => (
              <div
                key={index}
                className={styles.dropdownItem}
                onClick={() => handleSpellSelect(spell)}
              >
                <span className={styles.spellName}>{spell.name}</span>
                <span className={styles.spellLevel}>
                  {spell.level === 0 ? 'Cantrip' : `Level ${spell.level}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.form}>
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Spell Name</label>
            <input
              type="text"
              className={styles.input}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Level</label>
            <select
              className={styles.select}
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
            >
              <option value={0}>Cantrip</option>
              {Array.from({ length: 9 }, (_, i) => (
                <option key={i + 1} value={i + 1}>Level {i + 1}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>School</label>
          <input
            type="text"
            className={styles.input}
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Casting Time</label>
            <input
              type="text"
              className={styles.input}
              value={formData.castingTime}
              onChange={(e) => setFormData({ ...formData, castingTime: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Range</label>
            <input
              type="text"
              className={styles.input}
              value={formData.range}
              onChange={(e) => setFormData({ ...formData, range: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Components</label>
            <input
              type="text"
              className={styles.input}
              value={formData.components}
              onChange={(e) => setFormData({ ...formData, components: e.target.value })}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.label}>Duration</label>
            <input
              type="text"
              className={styles.input}
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <TextArea
            className={styles.textArea}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.submitButton} onClick={handleSubmit}>
            Add Spell
          </button>
          <button type="button" className={styles.cancelButton} onClick={handleClose}>
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};
