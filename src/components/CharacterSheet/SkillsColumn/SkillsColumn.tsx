import { FC } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { Checkbox } from '@/components/Common//Checkbox';
import { getSkillBonus } from '@/utils/calculations';
import styles from './SkillsColumn.module.css';

export const SkillsColumn: FC = () => {
  const { character, dispatch } = useCharacterSheet();

  const handleSkillToggle = (skillName: string) => {
    dispatch({
      type: 'TOGGLE_SKILL_PROFICIENCY',
      payload: skillName
    });
  };

  const handleExpertiseToggle = (skillName: string) => {
    dispatch({
      type: 'TOGGLE_SKILL_EXPERTISE',
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
        {character.skills.map(skill => {
          const bonus = getSkillBonus(
            character.attributes[skill.attribute].modifier,
            skill.isProficient,
            skill.expertise,
            character.proficiencyBonus
          );

          return (
            <div key={skill.name} className={styles.skillItem}>
              <span className={styles.skillBonus} aria-label={`${skill.name} modifier`}>
                {bonus >= 0 ? '+' : ''}{bonus}
              </span>
              <Checkbox
                checked={skill.isProficient}
                onChange={() => handleSkillToggle(skill.name)}
                aria-label={`${skill.name} proficiency`}
              />
              <span className={styles.skillName}>
                {skill.name} ({getAttributeAbbrev(skill.attribute)})
              </span>
              <button
                type="button"
                className={`${styles.expertiseButton} ${skill.expertise ? styles.expertiseButtonActive : ''}`}
                onClick={() => handleExpertiseToggle(skill.name)}
                disabled={!skill.isProficient}
                aria-pressed={skill.expertise}
                aria-label={`${skill.expertise ? 'Remove' : 'Add'} expertise for ${skill.name}`}
                title={skill.isProficient ? 'Toggle expertise' : 'Select proficiency before adding expertise'}
              >
                E
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
