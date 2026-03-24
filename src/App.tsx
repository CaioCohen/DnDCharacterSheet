import { Header } from './components/Header/Header';
import { CharacterSheet } from './components/CharacterSheet/CharacterSheet';
import './styles/variables.css';
import './styles/global.css';

function App() {
  return (
    <div className="app">
      <Header onImport={() => {}} />
      <CharacterSheet />
    </div>
  );
}

export default App;
