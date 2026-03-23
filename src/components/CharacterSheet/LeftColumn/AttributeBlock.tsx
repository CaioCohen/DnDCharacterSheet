import React, { FC, useState } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { AttributeKey } from '@/types/character';
import { NumberInput } from '@/components/Common//NumberInput';
import { Checkbox } from '@/components/Common//Checkbox';
import styles from './AttributeBlock.module.css';

interface AttributeBlockProps {
  attribute: AttributeKey;
  label: string;
}

export const AttributeBlock: FC<AttributeBlockProps> = ({ attribute, label }) => {
  const { character, dispatch } = useCharacterSheet();
  const attr = character.attributes[attribute];
  const [inputValue, setInputValue] = useState<string>(attr.base.toString());

  const handleBaseChange = (value: number) => {
    dispatch({
      type: 'UPDATE_ATTRIBUTE',
      payload: { attr: attribute, base: value }
    });
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    
    if (value !== '') {
      const numValue = parseInt(value);
      if (!isNaN(numValue)) {
        handleBaseChange(numValue);
      }
    }
  };

  // Sync input value when attr.base changes
  React.useEffect(() => {
    setInputValue(attr.base.toString());
  }, [attr.base]);

  const handleSaveChange = () => {
    dispatch({
      type: 'TOGGLE_SAVING_THROW',
      payload: attribute
    });
  };

  const save = character.savingThrows.find(st => st.attribute === attribute);

  return (
    <div className={styles.container}>
      <div className={styles.scoreSection}>
        <NumberInput
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          className={styles.input}
          aria-label={`${label} score`}
        />
      </div>

      <div className={styles.modifierSection}>
        <div className={styles.modLabelGroup}>
          <span className={styles.modLabel}>Mod</span>
          <div className={styles.modifier}>
            {attr.modifier > 0 ? '+' : ''}{attr.modifier}
          </div>
        </div>

        <Checkbox
          checked={save?.isProficient || false}
          onChange={handleSaveChange}
          aria-label={`${label} saving throw proficiency`}
          className={styles.saveCheckbox}
        />
      </div>

      <span className={styles.name}>{label}</span>
    </div>
  );
};

