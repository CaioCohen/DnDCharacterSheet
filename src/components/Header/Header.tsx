import { FC } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { exportCharacterAsJSON, importCharacterFromJSON } from '@/utils/fileOperations';
import { DndCharacter } from '@/types/character';
import styles from './Header.module.css';

interface HeaderProps {
  onImport: (character: DndCharacter) => void;
}

export const Header: FC<HeaderProps> = ({ onImport }) => {
  const { character, dispatch } = useCharacterSheet();

  const handleExport = () => {
    exportCharacterAsJSON(character);
  };

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const imported = await importCharacterFromJSON(file);
        dispatch({ type: 'LOAD_CHARACTER', payload: imported });
        onImport(imported);
      } catch (error) {
        alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    };
    input.click();
  };

  const handleSave = () => {
    // Since auto-save is already happening, this just confirms the save
    alert('Character saved!');
  };

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>D&D Character Sheet</h1>
      <div className={styles.controls}>
        <button className={styles.button} onClick={handleSave}>
          💾 Save
        </button>
        <button className={styles.button} onClick={handleExport}>
          📥 Export
        </button>
        <button className={styles.button} onClick={handleImportClick}>
          📤 Import
        </button>
        <button className={styles.button} onClick={() => dispatch({ type: 'RESET_CHARACTER' })}>
          🔄 New Sheet
        </button>
      </div>
    </header>
  );
};



