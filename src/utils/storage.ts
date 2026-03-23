import { DndCharacter } from '@/types/character';

const STORAGE_KEY = 'dnd_character_sheet';

export const saveCharacterToStorage = (character: DndCharacter): void => {
  try {
    const json = JSON.stringify(character);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save character to localStorage:', error);
  }
};

export const loadCharacterFromStorage = (): DndCharacter | null => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;
    return JSON.parse(json) as DndCharacter;
  } catch (error) {
    console.error('Failed to load character from localStorage:', error);
    return null;
  }
};

export const clearCharacterStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear character from localStorage:', error);
  }
};

