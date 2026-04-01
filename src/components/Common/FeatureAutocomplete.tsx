import { FC, useState, useEffect, useRef } from 'react';
import { Modal } from './Modal';
import { TextArea } from './TextArea';
import { DndFeature } from '@/types/dndFeature';
import featuresData from '@/assets/features.json';
import styles from './SpellAutocomplete.module.css'; // Reuse the same styles

interface FeatureFormData {
  title: string;
  origin: string;
  description: string;
}

interface FeatureAutocompleteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFeature: (feature: {
    id: string;
    title: string;
    origin: string;
    description: string;
  }) => void;
}

const features = featuresData as DndFeature[];

export const FeatureAutocomplete: FC<FeatureAutocompleteProps> = ({ isOpen, onClose, onAddFeature }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFeatures, setFilteredFeatures] = useState<DndFeature[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [formData, setFormData] = useState<FeatureFormData>({
    title: '',
    origin: '',
    description: ''
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
      const filtered = features.filter(feature =>
        feature.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 10);
      setFilteredFeatures(filtered);
      setShowDropdown(true);
    } else {
      setFilteredFeatures([]);
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

  const handleFeatureSelect = (feature: DndFeature) => {
    setFormData({
      title: feature.name,
      origin: feature.origin,
      description: feature.description
    });
    setSearchTerm(feature.name);
    setShowDropdown(false);
  };

  const handleSubmit = () => {
    if (!formData.title.trim()) return;
    onAddFeature({
      id: crypto.randomUUID(),
      title: formData.title.trim(),
      origin: formData.origin.trim(),
      description: formData.description.trim()
    });
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setSearchTerm('');
    setFormData({
      title: '',
      origin: '',
      description: ''
    });
    setFilteredFeatures([]);
    setShowDropdown(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} title="Add Feature" onClose={handleClose}>
      <div className={styles.autocompleteWrapper} ref={dropdownRef}>
        <label className={styles.label}>Search Feature</label>
        <input
          ref={inputRef}
          type="text"
          className={styles.searchInput}
          placeholder="Type feature name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (filteredFeatures.length > 0) setShowDropdown(true);
          }}
        />
        {showDropdown && filteredFeatures.length > 0 && (
          <div className={styles.dropdown}>
            {filteredFeatures.map((feature, index) => (
              <div
                key={index}
                className={styles.dropdownItem}
                onClick={() => handleFeatureSelect(feature)}
              >
                <span className={styles.spellName}>{feature.name}</span>
                <span className={styles.spellLevel}>{feature.origin}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Feature Name</label>
          <input
            type="text"
            className={styles.input}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Origin</label>
          <input
            type="text"
            className={styles.input}
            value={formData.origin}
            onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Description</label>
          <TextArea
            className={styles.textArea}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 'var(--spacing-sm)', textAlign: 'right' }}>
          <button
            className={styles.addButton}
            onClick={handleSubmit}
          >
            Save
          </button>
          <button
            className={styles.addButton}
            style={{ marginLeft: 'var(--spacing-xs)' }}
            onClick={handleClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};