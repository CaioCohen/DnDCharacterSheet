import { DndCharacter, ExportedCharacter } from '../types/character';
import { validateCharacter } from './validation';

export const exportCharacterAsJSON = (character: DndCharacter): void => {
  const exportData: ExportedCharacter = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    character
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name.replace(/\s+/g, '_')}-sheet.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importCharacterFromJSON = async (file: File): Promise<DndCharacter> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as ExportedCharacter;

        if (!data.character) {
          throw new Error('Invalid character file: missing character data');
        }

        const character = data.character as DndCharacter;

        const errors = validateCharacter(character);
        if (errors.length > 0) {
          console.warn('Character validation warnings:', errors);
        }

        character.updatedAt = new Date().toISOString();

        resolve(character);
      } catch (error) {
        reject(new Error(`Failed to parse character file: ${error instanceof Error ? error.message : String(error)}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};
