import { DndCharacter, ValidationError } from '../types/character';

export const validateAttributeScore = (score: number): boolean => {
  return score >= 3 && score <= 20;
};

export const validateLevel = (level: number): boolean => {
  return level >= 1 && level <= 20;
};

export const validateAC = (ac: number): boolean => {
  return ac >= 0 && ac <= 30;
};

export const validateHP = (current: number, max: number): boolean => {
  return current >= 0 && current <= max && max >= 1;
};

export const validateSpellLevel = (level: number): boolean => {
  return level >= 0 && level <= 9;
};

export const validateDeathSaves = (successes: number, failures: number): boolean => {
  return (
    successes >= 0 && successes <= 3 &&
    failures >= 0 && failures <= 3
  );
};

export const validateCharacter = (character: DndCharacter): ValidationError[] => {
  const errors: ValidationError[] = [];

  Object.entries(character.attributes).forEach(([key, attr]) => {
    if (!validateAttributeScore(attr.base)) {
      errors.push({
        field: `attributes.${key}.base`,
        message: `${key} score must be between 3 and 20`
      });
    }
  });

  if (!validateLevel(character.level)) {
    errors.push({
      field: 'level',
      message: 'Level must be between 1 and 20'
    });
  }

  if (!validateAC(character.armorClass)) {
    errors.push({
      field: 'armorClass',
      message: 'AC must be between 0 and 30'
    });
  }

  if (!validateHP(character.hitPoints.current, character.hitPoints.max)) {
    errors.push({
      field: 'hitPoints',
      message: 'Current HP cannot exceed max HP and max HP must be at least 1'
    });
  }

  if (character.deathSaves) {
    if (!validateDeathSaves(character.deathSaves.successes, character.deathSaves.failures)) {
      errors.push({
        field: 'deathSaves',
        message: 'Death saves must be between 0 and 3'
      });
    }
  }

  return errors;
};
