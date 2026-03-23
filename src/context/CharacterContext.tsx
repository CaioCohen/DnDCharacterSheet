import { createContext, ReactNode, useReducer, useEffect, useState } from 'react';
import { DndCharacter } from '../types/character';
import { DEFAULT_CHARACTER } from '../utils/defaults';
import { loadCharacterFromStorage, saveCharacterToStorage } from '../utils/storage';
import { getModifier, getProficiencyBonus } from '../utils/calculations';

export type CharacterAction =
  | { type: 'UPDATE_CHARACTER_INFO'; payload: Partial<DndCharacter> }
  | { type: 'UPDATE_ATTRIBUTE'; payload: { attr: string; base: number } }
  | { type: 'TOGGLE_SAVING_THROW'; payload: string }
  | { type: 'TOGGLE_SKILL_PROFICIENCY'; payload: string }
  | { type: 'TOGGLE_SKILL_EXPERTISE'; payload: string }
  | { type: 'UPDATE_HP'; payload: Partial<DndCharacter['hitPoints']> }
  | { type: 'UPDATE_DEATH_SAVES'; payload: Partial<DndCharacter['deathSaves']> }
  | { type: 'ADD_FEATURE'; payload: DndCharacter['featuresTraits'][number] }
  | { type: 'UPDATE_FEATURE'; payload: DndCharacter['featuresTraits'][number] }
  | { type: 'DELETE_FEATURE'; payload: string }
  | { type: 'ADD_INVENTORY_ITEM'; payload: DndCharacter['inventory'][number] }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: DndCharacter['inventory'][number] }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'ADD_SPELL'; payload: DndCharacter['spells'][number] }
  | { type: 'UPDATE_SPELL'; payload: DndCharacter['spells'][number] }
  | { type: 'DELETE_SPELL'; payload: string }
  | { type: 'UPDATE_SPELL_SLOTS'; payload: { level: number; current: number; max: number } }
  | { type: 'LOAD_CHARACTER'; payload: DndCharacter }
  | { type: 'RESET_CHARACTER' };

export interface CharacterContextType {
  character: DndCharacter;
  dispatch: React.Dispatch<CharacterAction>;
  isDirty: boolean;
}

export const CharacterContext = createContext<CharacterContextType | null>(null);

const characterReducer = (state: DndCharacter, action: CharacterAction): DndCharacter => {
  switch (action.type) {
    case 'UPDATE_CHARACTER_INFO': {
      const newLevel = action.payload.level ?? state.level;
      return {
        ...state,
        ...action.payload,
        proficiencyBonus: getProficiencyBonus(newLevel),
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_ATTRIBUTE': {
      const { attr, base } = action.payload;
      const modifier = getModifier(base);

      const updates: Partial<DndCharacter> = {
        attributes: {
          ...state.attributes,
          [attr]: {
            ...state.attributes[attr as keyof typeof state.attributes],
            base,
            modifier
          }
        }
      };

      // Auto-calculate initiative from dexterity modifier
      if (attr === 'dexterity') {
        updates.initiative = modifier;
      }

      return {
        ...state,
        ...updates,
        updatedAt: new Date().toISOString()
      };
    }

    case 'TOGGLE_SAVING_THROW': {
      const attr = action.payload;
      return {
        ...state,
        savingThrows: state.savingThrows.map(st =>
          st.attribute === attr
            ? { ...st, isProficient: !st.isProficient }
            : st
        ),
        updatedAt: new Date().toISOString()
      };
    }

    case 'TOGGLE_SKILL_PROFICIENCY': {
      const skillName = action.payload;
      return {
        ...state,
        skills: state.skills.map(skill =>
          skill.name === skillName
            ? { ...skill, isProficient: !skill.isProficient }
            : skill
        ),
        updatedAt: new Date().toISOString()
      };
    }

    case 'TOGGLE_SKILL_EXPERTISE': {
      const skillName = action.payload;
      return {
        ...state,
        skills: state.skills.map(skill =>
          skill.name === skillName
            ? { ...skill, expertise: !skill.expertise }
            : skill
        ),
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_HP': {
      const updated = { ...state.hitPoints, ...action.payload };
      updated.current = Math.max(0, Math.min(updated.current, updated.max));
      return {
        ...state,
        hitPoints: updated,
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_DEATH_SAVES': {
      const updated = { ...state.deathSaves, ...action.payload };
      updated.successes = Math.max(0, Math.min(3, updated.successes));
      updated.failures = Math.max(0, Math.min(3, updated.failures));
      return {
        ...state,
        deathSaves: updated,
        updatedAt: new Date().toISOString()
      };
    }

    case 'ADD_FEATURE': {
      return {
        ...state,
        featuresTraits: [...state.featuresTraits, action.payload],
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_FEATURE': {
      return {
        ...state,
        featuresTraits: state.featuresTraits.map(f =>
          f.id === action.payload.id ? action.payload : f
        ),
        updatedAt: new Date().toISOString()
      };
    }

    case 'DELETE_FEATURE': {
      return {
        ...state,
        featuresTraits: state.featuresTraits.filter(f => f.id !== action.payload),
        updatedAt: new Date().toISOString()
      };
    }

    case 'ADD_INVENTORY_ITEM': {
      return {
        ...state,
        inventory: [...state.inventory, action.payload],
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_INVENTORY_ITEM': {
      return {
        ...state,
        inventory: state.inventory.map(item =>
          item.id === action.payload.id ? action.payload : item
        ),
        updatedAt: new Date().toISOString()
      };
    }

    case 'DELETE_INVENTORY_ITEM': {
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload),
        updatedAt: new Date().toISOString()
      };
    }

    case 'ADD_SPELL': {
      return {
        ...state,
        spells: [...state.spells, action.payload],
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_SPELL': {
      return {
        ...state,
        spells: state.spells.map(spell =>
          spell.id === action.payload.id ? action.payload : spell
        ),
        updatedAt: new Date().toISOString()
      };
    }

    case 'DELETE_SPELL': {
      return {
        ...state,
        spells: state.spells.filter(spell => spell.id !== action.payload),
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_SPELL_SLOTS': {
      const { level, current, max } = action.payload;
      return {
        ...state,
        spellSlots: {
          ...state.spellSlots,
          [level]: { current, max }
        },
        updatedAt: new Date().toISOString()
      };
    }

    case 'LOAD_CHARACTER': {
      return {
        ...action.payload,
        updatedAt: new Date().toISOString()
      };
    }

    case 'RESET_CHARACTER': {
      return {
        ...DEFAULT_CHARACTER,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    }

    default:
      return state;
  }
};

export interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider = ({ children }: CharacterProviderProps) => {
  const [character, dispatch] = useReducer(characterReducer, null, () => {
    const stored = loadCharacterFromStorage();
    return stored || DEFAULT_CHARACTER;
  });

  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    saveCharacterToStorage(character);
    setIsDirty(true);
  }, [character]);

  const value: CharacterContextType = {
    character,
    dispatch,
    isDirty
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};
