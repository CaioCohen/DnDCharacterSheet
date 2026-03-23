import { useState } from 'react';
import { Header } from './components/Header/Header';
import { CharacterSheet } from './components/CharacterSheet/CharacterSheet';
import { DndCharacter } from './types/character';
import './styles/variables.css';
import './styles/global.css';

function App() {
  const [, setLastImported] = useState<DndCharacter | null>(null);

  const handleImport = (character: DndCharacter) => {
    setLastImported(character);
  };

  return (
    <div className="app">
      <Header onImport={handleImport} />
      <CharacterSheet />
    </div>
  );
}

export default App;
