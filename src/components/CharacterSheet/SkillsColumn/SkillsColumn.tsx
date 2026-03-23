import { FC } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { Checkbox } from '@/components/Common//Checkbox';
import styles from './SkillsColumn.module.css';

export const SkillsColumn: FC = () => {
  const { character, dispatch } = useCharacterSheet();

  const handleSkillToggle = (skillName: string) => {
    dispatch({
      type: 'TOGGLE_SKILL_PROFICIENCY',
      payload: skillName
    });
  };

  const getAttributeAbbrev = (attr: string) => {
    switch (attr) {
      case 'strength': return 'Str';
      case 'dexterity': return 'Dex';
      case 'constitution': return 'Con';
      case 'intelligence': return 'Int';
      case 'wisdom': return 'Wis';
      case 'charisma': return 'Cha';
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Skills</h3>
      <div className={styles.skillsList}>
        {character.skills.map(skill => (
          <div key={skill.name} className={styles.skillItem}>
            <Checkbox
              checked={skill.isProficient}
              onChange={() => handleSkillToggle(skill.name)}
              aria-label={`${skill.name} proficiency`}
            />
            <span className={styles.skillName}>
              {skill.name} ({getAttributeAbbrev(skill.attribute)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
