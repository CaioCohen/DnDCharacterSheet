import { useContext } from 'react';
import { CharacterContext, CharacterContextType } from '@/context/CharacterContext';

export const useCharacterSheet = (): CharacterContextType => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error('useCharacterSheet must be used within CharacterProvider');
  }

  return context;
};

