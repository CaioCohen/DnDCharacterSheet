# D&D Character Sheet - Implementation Plan

## Overview
Detailed step-by-step guide for building the D&D Character Sheet application based on the high-level plan. This document provides concrete implementation steps with code examples and specific file contents.

---

## Phase 1: Project Setup & Foundation (2-3 days)

### Step 1.1: Initialize Project
**Goal:** Set up Vite + React + TypeScript project structure

**Tasks:**
```bash
# 1. Create Vite project
npm create vite@latest dnd-character-sheet -- --template react-ts
cd dnd-character-sheet

# 2. Install dependencies
npm install
npm install uuid  # For generating unique IDs

# 3. Verify setup
npm run dev
```

**Expected Result:** Running React dev server at http://localhost:5173/

---

### Step 1.2: Create Folder Structure
**Goal:** Establish the complete project directory hierarchy

**Create these folders:**
```
src/
├── components/
│   ├── Header/
│   ├── CharacterSheet/
│   │   ├── TopHeader/
│   │   ├── LeftColumn/
│   │   ├── CenterColumn/
│   │   ├── RightColumn/
│   │   └── BottomSection/
│   └── Common/
├── hooks/
├── types/
├── utils/
├── styles/
└── context/
```

**Command:**
```bash
# Create directory structure
mkdir -p src/{components/{Header,CharacterSheet/{TopHeader,LeftColumn,CenterColumn,RightColumn,BottomSection},Common},hooks,types,utils,styles,context}
```

---

### Step 1.3: Define TypeScript Interfaces
**File:** `src/types/character.ts`

**Content:**
```typescript
/**
 * Attribute key type for referencing character attributes
 */
export type AttributeKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

/**
 * Core D&D attribute score (ability score)
 */
export interface AttributeScore {
  base: number;        // 3-20
  modifier: number;    // Calculated: (base - 10) / 2, rounded down
  savingThrow: boolean; // Is character proficient in this save?
}

/**
 * Saving throw for a specific attribute
 */
export interface SavingThrow {
  attribute: AttributeKey;
  isProficient: boolean;
}

/**
 * Individual skill with linked attribute and proficiency
 */
export interface Skill {
  name: string;
  attribute: AttributeKey;
  isProficient: boolean;
  expertise: boolean;       // Double proficiency bonus
  bonus: number;            // Calculated from attribute + proficiency
}

/**
 * Hit point tracking
 */
export interface HitPoints {
  max: number;
  current: number;
  temporary: number;
}

/**
 * Hit dice for recovery
 */
export interface HitDice {
  id: string;
  amount: number;           // How many of this type
  type: string;             // d6, d8, d10, d12
  used: number;             // How many have been used
}

/**
 * Death save tracking (0-3 successes/failures)
 */
export interface DeathSaves {
  successes: number;        // 0-3
  failures: number;         // 0-3
}

/**
 * Feature, trait, ability, or class feature
 */
export interface FeatureTrait {
  id: string;
  title: string;
  origin: string;           // e.g., "Class Feature", "Racial Trait", "Feat"
  description: string;
}

/**
 * Inventory item
 */
export interface InventoryItem {
  id: string;
  title: string;
  description: string;
  quantity?: number;
  weight?: number;          // in pounds
  rarity?: string;          // e.g., "Common", "Rare"
}

/**
 * Spell with metadata
 */
export interface Spell {
  id: string;
  title: string;
  level: number;            // 0-9: 0 = cantrip
  school?: string;          // Abjuration, Conjuration, etc.
  description: string;
  components?: string;      // V (Verbal), S (Somatic), M (Material)
  castingTime?: string;     // 1 action, 1 bonus action, etc.
  duration?: string;        // Instantaneous, 1 hour, Concentration, etc.
  range?: string;           // Self, 30 feet, etc.
}

/**
 * Complete D&D character sheet data model
 */
export interface DndCharacter {
  // Character Identity
  name: string;
  class: string;
  level: number;            // 1-20
  background: string;
  race: string;
  alignment: string;        // e.g., "Lawful Good"
  playerName?: string;

  // Core Attributes (6 base ability scores)
  attributes: {
    strength: AttributeScore;
    dexterity: AttributeScore;
    constitution: AttributeScore;
    intelligence: AttributeScore;
    wisdom: AttributeScore;
    charisma: AttributeScore;
  };

  // Proficiencies & Bonuses
  inspiration: number;                // 0-5 (usually)
  proficiencyBonus: number;           // Calculated from level
  savingThrows: SavingThrow[];        // 6 saving throws (one per attribute)
  skills: Skill[];                    // 18 standard skills
  proficienciesLanguages: string;     // Text field for custom entries

  // Combat Stats
  armorClass: number;
  initiative: number;                 // Calculated from DEX modifier
  speed: number;                      // In feet per round
  hitPoints: HitPoints;
  hitDice: HitDice[];
  deathSaves: DeathSaves;

  // Character Content
  featuresTraits: FeatureTrait[];
  inventory: InventoryItem[];
  backstory: string;
  spells: Spell[];

  // Metadata
  createdAt: string;                  // ISO date string
  updatedAt: string;                  // ISO date string
}

/**
 * Export/Import file structure
 */
export interface ExportedCharacter {
  version: string;                    // e.g., "1.0"
  exportedAt: string;                 // ISO date string
  character: DndCharacter;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}
```

**Notes:**
- All IDs for items (features, inventory, spells) should be generated using `uuid`
- Modifiers are calculated automatically from base scores
- Proficiency bonus is calculated from level
- Skill and saving throw bonuses are calculated from attributes + proficiency

---

### Step 1.4: Create Default Character
**File:** `src/utils/defaults.ts`

**Content:**
```typescript
import { DndCharacter, AttributeKey } from '../types/character';

export const DEFAULT_ATTRIBUTE: AttributeKey[] = [
  'strength',
  'dexterity',
  'constitution',
  'intelligence',
  'wisdom',
  'charisma'
];

export const SKILL_NAMES: { name: string; attribute: AttributeKey }[] = [
  { name: 'Acrobatics', attribute: 'dexterity' },
  { name: 'Animal Handling', attribute: 'wisdom' },
  { name: 'Arcana', attribute: 'intelligence' },
  { name: 'Athletics', attribute: 'strength' },
  { name: 'Deception', attribute: 'charisma' },
  { name: 'History', attribute: 'intelligence' },
  { name: 'Insight', attribute: 'wisdom' },
  { name: 'Intimidation', attribute: 'charisma' },
  { name: 'Investigation', attribute: 'intelligence' },
  { name: 'Medicine', attribute: 'wisdom' },
  { name: 'Nature', attribute: 'intelligence' },
  { name: 'Perception', attribute: 'wisdom' },
  { name: 'Performance', attribute: 'charisma' },
  { name: 'Persuasion', attribute: 'charisma' },
  { name: 'Religion', attribute: 'intelligence' },
  { name: 'Sleight of Hand', attribute: 'dexterity' },
  { name: 'Stealth', attribute: 'dexterity' },
  { name: 'Survival', attribute: 'wisdom' }
];

export const DEFAULT_CHARACTER: DndCharacter = {
  name: 'New Character',
  class: 'Fighter',
  level: 1,
  background: 'Peasant',
  race: 'Human',
  alignment: 'Neutral',
  playerName: '',

  attributes: {
    strength: { base: 10, modifier: 0, savingThrow: false },
    dexterity: { base: 10, modifier: 0, savingThrow: false },
    constitution: { base: 10, modifier: 0, savingThrow: false },
    intelligence: { base: 10, modifier: 0, savingThrow: false },
    wisdom: { base: 10, modifier: 0, savingThrow: false },
    charisma: { base: 10, modifier: 0, savingThrow: false }
  },

  inspiration: 0,
  proficiencyBonus: 2,
  savingThrows: [
    { attribute: 'strength', isProficient: false },
    { attribute: 'dexterity', isProficient: false },
    { attribute: 'constitution', isProficient: false },
    { attribute: 'intelligence', isProficient: false },
    { attribute: 'wisdom', isProficient: false },
    { attribute: 'charisma', isProficient: false }
  ],
  skills: SKILL_NAMES.map(skill => ({
    name: skill.name,
    attribute: skill.attribute,
    isProficient: false,
    expertise: false,
    bonus: 0
  })),
  proficienciesLanguages: '',

  armorClass: 10,
  initiative: 0,
  speed: 30,
  hitPoints: { max: 8, current: 8, temporary: 0 },
  hitDice: [{ id: '1', amount: 1, type: 'd8', used: 0 }],
  deathSaves: { successes: 0, failures: 0 },

  featuresTraits: [],
  inventory: [],
  backstory: '',
  spells: [],

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

---

### Step 1.5: Create Utility Functions
**File:** `src/utils/calculations.ts`

**Content:**
```typescript
/**
 * Calculate ability modifier from base score
 * Formula: (score - 10) / 2, rounded down
 */
export const getModifier = (baseScore: number): number => {
  return Math.floor((baseScore - 10) / 2);
};

/**
 * Calculate proficiency bonus from character level
 * Based on D&D 5e rules
 */
export const getProficiencyBonus = (level: number): number => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
};

/**
 * Calculate skill bonus
 * Formula: attribute modifier + (proficiency bonus if proficient) + (other bonuses)
 * If expertise is true, add proficiency bonus twice
 */
export const getSkillBonus = (
  attributeModifier: number,
  isProficient: boolean,
  expertise: boolean,
  proficiencyBonus: number
): number => {
  let bonus = attributeModifier;
  if (expertise) {
    bonus += proficiencyBonus * 2;
  } else if (isProficient) {
    bonus += proficiencyBonus;
  }
  return bonus;
};

/**
 * Calculate saving throw bonus
 * Formula: attribute modifier + (proficiency bonus if proficient)
 */
export const getSavingThrowBonus = (
  attributeModifier: number,
  isProficient: boolean,
  proficiencyBonus: number
): number => {
  let bonus = attributeModifier;
  if (isProficient) {
    bonus += proficiencyBonus;
  }
  return bonus;
};

/**
 * Ensure value is within min/max bounds
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
```

---

### Step 1.6: Create Validation Utilities
**File:** `src/utils/validation.ts`

**Content:**
```typescript
import { DndCharacter, ValidationError } from '../types/character';

/**
 * Validate attribute score (must be 3-20)
 */
export const validateAttributeScore = (score: number): boolean => {
  return score >= 3 && score <= 20;
};

/**
 * Validate character level (must be 1-20)
 */
export const validateLevel = (level: number): boolean => {
  return level >= 1 && level <= 20;
};

/**
 * Validate armor class (reasonable bounds)
 */
export const validateAC = (ac: number): boolean => {
  return ac >= 0 && ac <= 30;
};

/**
 * Validate hit points
 */
export const validateHP = (current: number, max: number): boolean => {
  return current >= 0 && current <= max && max >= 1;
};

/**
 * Validate spell level (0-9, with 0 being cantrip)
 */
export const validateSpellLevel = (level: number): boolean => {
  return level >= 0 && level <= 9;
};

/**
 * Validate death saves (0-3 each)
 */
export const validateDeathSaves = (successes: number, failures: number): boolean => {
  return (
    successes >= 0 && successes <= 3 &&
    failures >= 0 && failures <= 3
  );
};

/**
 * Validate entire character data structure
 */
export const validateCharacter = (character: DndCharacter): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate attributes
  Object.entries(character.attributes).forEach(([key, attr]) => {
    if (!validateAttributeScore(attr.base)) {
      errors.push({
        field: `attributes.${key}.base`,
        message: `${key} score must be between 3 and 20`
      });
    }
  });

  // Validate level
  if (!validateLevel(character.level)) {
    errors.push({
      field: 'level',
      message: 'Level must be between 1 and 20'
    });
  }

  // Validate AC
  if (!validateAC(character.armorClass)) {
    errors.push({
      field: 'armorClass',
      message: 'AC must be between 0 and 30'
    });
  }

  // Validate HP
  if (!validateHP(character.hitPoints.current, character.hitPoints.max)) {
    errors.push({
      field: 'hitPoints',
      message: 'Current HP cannot exceed max HP and max HP must be at least 1'
    });
  }

  // Validate death saves
  if ('deathSaves' in character && character.deathSaves) {
    if (!validateDeathSaves(character.deathSaves.successes, character.deathSaves.failures)) {
      errors.push({
        field: 'deathSaves',
        message: 'Death saves must be between 0 and 3'
      });
    }
  }

  return errors;
};
```

---

### Step 1.7: Create LocalStorage Utilities
**File:** `src/utils/storage.ts`

**Content:**
```typescript
import { DndCharacter } from '../types/character';

const STORAGE_KEY = 'dnd_character_sheet';

/**
 * Save character to localStorage
 */
export const saveCharacterToStorage = (character: DndCharacter): void => {
  try {
    const json = JSON.stringify(character);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save character to localStorage:', error);
    // Handle quota exceeded or other storage errors
  }
};

/**
 * Load character from localStorage
 */
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

/**
 * Clear character from localStorage
 */
export const clearCharacterStorage = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear character from localStorage:', error);
  }
};
```

---

### Step 1.8: Create Export/Import Utilities
**File:** `src/utils/fileOperations.ts`

**Content:**
```typescript
import { DndCharacter, ExportedCharacter } from '../types/character';
import { validateCharacter } from './validation';

/**
 * Export character as JSON file
 */
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

/**
 * Import character from JSON file
 */
export const importCharacterFromJSON = async (file: File): Promise<DndCharacter> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content) as ExportedCharacter;

        // Validate structure
        if (!data.character) {
          throw new Error('Invalid character file: missing character data');
        }

        const character = data.character as DndCharacter;

        // Validate character data
        const errors = validateCharacter(character);
        if (errors.length > 0) {
          console.warn('Character validation warnings:', errors);
          // Don't reject, just warn - allow import with corrections
        }

        // Update timestamps
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
```

---

## Phase 2: State Management & Hooks (2-3 days)

### Step 2.1: Create Character Context
**File:** `src/context/CharacterContext.tsx`

**Content:**
```typescript
import { createContext, ReactNode, useReducer, useEffect, useCallback } from 'react';
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
  | { type: 'LOAD_CHARACTER'; payload: DndCharacter }
  | { type: 'RESET_CHARACTER' };

export interface CharacterContextType {
  character: DndCharacter;
  dispatch: React.Dispatch<CharacterAction>;
  isDirty: boolean;
}

export const CharacterContext = createContext<CharacterContextType | null>(null);

/**
 * Character reducer function
 */
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
      const clampedBase = Math.max(3, Math.min(20, base));
      const modifier = getModifier(clampedBase);

      return {
        ...state,
        attributes: {
          ...state.attributes,
          [attr]: {
            ...state.attributes[attr as keyof typeof state.attributes],
            base: clampedBase,
            modifier
          }
        },
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
      // Clamp current HP to 0-max range
      updated.current = Math.max(0, Math.min(updated.current, updated.max));
      return {
        ...state,
        hitPoints: updated,
        updatedAt: new Date().toISOString()
      };
    }

    case 'UPDATE_DEATH_SAVES': {
      const updated = { ...state.deathSaves, ...action.payload };
      // Clamp to 0-3
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

/**
 * Character provider component
 * Initializes character from localStorage and syncs changes
 */
export const CharacterProvider = ({ children }: CharacterProviderProps) => {
  const [character, dispatch] = useReducer(characterReducer, null, () => {
    const stored = loadCharacterFromStorage();
    return stored || DEFAULT_CHARACTER;
  });

  const [isDirty, setIsDirty] = useCallState(false);

  // Auto-save to localStorage on character changes
  useEffect(() => {
    saveCharacterToStorage(character);
    setIsDirty(true);
  }, [character, setIsDirty]);

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
```

---

### Step 2.2: Create useCharacterSheet Hook
**File:** `src/hooks/useCharacterSheet.ts`

**Content:**
```typescript
import { useContext } from 'react';
import { CharacterContext, CharacterContextType } from '../context/CharacterContext';

/**
 * Hook to use character context
 * Throws if used outside of CharacterProvider
 */
export const useCharacterSheet = (): CharacterContextType => {
  const context = useContext(CharacterContext);

  if (!context) {
    throw new Error('useCharacterSheet must be used within CharacterProvider');
  }

  return context;
};
```

---

### Step 2.3: Create useLocalStorage Hook (Optional)
**File:** `src/hooks/useLocalStorage.ts`

**Content:**
```typescript
import { useState, useEffect } from 'react';

/**
 * Generic hook for localStorage operations
 * Useful for non-character data (e.g., UI preferences)
 */
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading from localStorage for key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error writing to localStorage for key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};
```

---

## Phase 3: UI Components - Basics (3-4 days)

### Step 3.1: Create Common Input Components
**File:** `src/components/Common/NumberInput.tsx`

**Content:**
```typescript
import { FC, InputHTMLAttributes } from 'react';
import styles from './NumberInput.module.css';

interface NumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  min?: number;
  max?: number;
  error?: string;
}

export const NumberInput: FC<NumberInputProps> = ({
  label,
  error,
  ...props
}) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        type="number"
        className={`${styles.input} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
```

**File:** `src/components/Common/NumberInput.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-weight: 500;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.input {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: var(--font-size-base);
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.input.error {
  border-color: #dc3545;
}

.errorText {
  color: #dc3545;
  font-size: 0.875rem;
}
```

**File:** `src/components/Common/Checkbox.tsx`

```typescript
import { FC, InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox: FC<CheckboxProps> = ({ label, ...props }) => {
  return (
    <div className={styles.container}>
      <input
        type="checkbox"
        className={styles.input}
        {...props}
      />
      {label && <label className={styles.label}>{label}</label>}
    </div>
  );
};
```

**File:** `src/components/Common/Checkbox.module.css`

```css
.container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  cursor: pointer;
}

.input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--color-accent);
}

.label {
  cursor: pointer;
  user-select: none;
}
```

**File:** `src/components/Common/TextArea.tsx`

```typescript
import { FC, TextareaHTMLAttributes } from 'react';
import styles from './TextArea.module.css';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const TextArea: FC<TextAreaProps> = ({ label, error, ...props }) => {
  return (
    <div className={styles.container}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={`${styles.textarea} ${error ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
```

**File:** `src/components/Common/TextArea.module.css`

```css
.container {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-weight: 500;
  font-size: var(--font-size-base);
  color: var(--color-text);
}

.textarea {
  padding: var(--spacing-md);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  font-size: var(--font-size-base);
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
}

.textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(139, 0, 0, 0.1);
}

.textarea.error {
  border-color: #dc3545;
}

.errorText {
  color: #dc3545;
  font-size: 0.875rem;
}
```

---

### Step 3.2: Create Modal Component
**File:** `src/components/Common/Modal.tsx`

**Content:**
```typescript
import { FC, ReactNode, useEffect } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export const Modal: FC<ModalProps> = ({ isOpen, title, onClose, children, footer }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>
  );
};
```

**File:** `src/components/Common/Modal.module.css`

```css
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background-color: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.title {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

.closeButton {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  color: var(--color-text);
  transition: color 0.2s ease;
}

.closeButton:hover {
  color: var(--color-accent);
}

.content {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}

.footer {
  padding: var(--spacing-lg);
  border-top: 1px solid var(--color-border);
  display: flex;
  gap: var(--spacing-md);
  justify-content: flex-end;
  flex-shrink: 0;
}
```

---

### Step 3.3: Create Global Styles
**File:** `src/styles/variables.css`

```css
:root {
  /* Colors */
  --color-bg-primary: #f5f5f5;
  --color-bg-secondary: #ffffff;
  --color-border: #d0d0d0;
  --color-text: #333333;
  --color-text-light: #666666;
  --color-accent: #8b0000;
  --color-accent-light: #dc3545;
  --color-success: #28a745;

  /* Typography */
  --font-family: 'Georgia', serif;
  --font-size-base: 14px;
  --font-size-sm: 12px;
  --font-size-lg: 16px;
  --font-size-heading: 20px;
  --font-size-title: 28px;

  /* Spacing (8px grid) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;

  /* Layout */
  --column-gap: 20px;
  --max-width: 1400px;
  --header-height: 60px;

  /* Transitions */
  --transition-fast: 0.15s;
  --transition-normal: 0.3s;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --transition-fast: 0s;
    --transition-normal: 0s;
  }
}

@media print {
  :root {
    --color-bg-primary: transparent;
    --color-bg-secondary: white;
  }
}
```

**File:** `src/styles/global.css`

```css
* {
  box-sizing: border-box;
}

html, body, #root {
  margin: 0;
  padding: 0;
  height: 100%;
}

body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  color: var(--color-text);
  background-color: var(--color-bg-primary);
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  margin: 0;
  font-weight: 600;
}

h1 {
  font-size: var(--font-size-title);
}

h2 {
  font-size: var(--font-size-heading);
}

h3 {
  font-size: var(--font-size-lg);
}

p {
  margin: 0;
}

button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-normal);
}

input[type="text"],
input[type="number"],
textarea,
select {
  font-family: inherit;
}

/* Print styles */
@media print {
  body {
    background: white;
    font-size: 11px;
  }

  header,
  footer,
  .no-print {
    display: none !important;
  }

  .sheet-container {
    max-width: 100%;
    margin: 0;
    padding: 0;
  }
}
```

---

### Step 3.4: Create Header Component
**File:** `src/components/Header/Header.tsx`

**Content:**
```typescript
import { FC } from 'react';
import { useCharacterSheet } from '../../hooks/useCharacterSheet';
import { exportCharacterAsJSON, importCharacterFromJSON } from '../../utils/fileOperations';
import styles from './Header.module.css';

interface HeaderProps {
  onImport: (character: import('../../types/character').DndCharacter) => void;
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
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
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

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>D&D Character Sheet</h1>
      <div className={styles.controls}>
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
```

**File:** `src/components/Header/Header.module.css`

```css
.header {
  position: sticky;
  top: 0;
  background-color: var(--color-bg-secondary);
  border-bottom: 2px solid var(--color-accent);
  padding: var(--spacing-md) var(--spacing-lg);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
  height: var(--header-height);
  z-index: 100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: var(--font-size-title);
  color: var(--color-accent);
  margin: 0;
  flex: 1;
}

.controls {
  display: flex;
  gap: var(--spacing-md);
}

.button {
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-accent);
  color: white;
  border: none;
  border-radius: 4px;
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: all var(--transition-normal);
}

.button:hover {
  background-color: #a01010;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    height: auto;
    padding: var(--spacing-md);
  }

  .title {
    font-size: var(--font-size-heading);
  }

  .controls {
    width: 100%;
  }

  .button {
    flex: 1;
  }
}

@media print {
  .header {
    display: none;
  }
}
```

---

## Phase 4: UI Components - Layout (3-4 days)

### Step 4.1: Create TopHeader Component
**File:** `src/components/CharacterSheet/TopHeader/TopHeader.tsx`

```typescript
import { FC } from 'react';
import { useCharacterSheet } from '../../../hooks/useCharacterSheet';
import { NumberInput } from '../../Common/NumberInput';
import styles from './TopHeader.module.css';

export const TopHeader: FC = () => {
  const { character, dispatch } = useCharacterSheet();

  const handleInputChange = (field: string, value: string | number) => {
    dispatch({
      type: 'UPDATE_CHARACTER_INFO',
      payload: { [field]: value }
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.nameSection}>
          <input
            type="text"
            value={character.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={styles.nameInput}
            placeholder="Character Name"
            aria-label="Character name"
          />
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.label}>Class</label>
            <input
              type="text"
              value={character.class}
              onChange={(e) => handleInputChange('class', e.target.value)}
              placeholder="e.g., Fighter"
              className={styles.textInput}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Level</label>
            <NumberInput
              value={character.level}
              min={1}
              max={20}
              onChange={(e) => handleInputChange('level', parseInt(e.target.value) || 1)}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Race</label>
            <input
              type="text"
              value={character.race}
              onChange={(e) => handleInputChange('race', e.target.value)}
              placeholder="e.g., Human"
              className={styles.textInput}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Background</label>
            <input
              type="text"
              value={character.background}
              onChange={(e) => handleInputChange('background', e.target.value)}
              placeholder="e.g., Soldier"
              className={styles.textInput}
            />
          </div>

          <div className={styles.infoItem}>
            <label className={styles.label}>Alignment</label>
            <input
              type="text"
              value={character.alignment}
              onChange={(e) => handleInputChange('alignment', e.target.value)}
              placeholder="e.g., Lawful Good"
              className={styles.textInput}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
```

**File:** `src/components/CharacterSheet/TopHeader/TopHeader.module.css`

```css
.container {
  padding: var(--spacing-lg);
  background-color: var(--color-bg-secondary);
  border-bottom: 1px solid var(--color-border);
  margin-bottom: var(--spacing-lg);
}

.main {
  max-width: var(--max-width);
  margin: 0 auto;
}

.nameSection {
  margin-bottom: var(--spacing-lg);
}

.nameInput {
  font-size: var(--font-size-title);
  font-weight: bold;
  padding: var(--spacing-md);
  border: 1px solid transparent;
  border-bottom: 2px dashed var(--color-border);
  width: 100%;
  font-family: inherit;
  transition: all var(--transition-normal);
}

.nameInput:focus {
  outline: none;
  border-bottom-color: var(--color-accent);
  background-color: var(--color-bg-primary);
}

.infoGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: var(--spacing-md);
}

.infoItem {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.textInput {
  padding: var(--spacing-sm);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  font-size: var(--font-size-base);
  font-family: inherit;
  transition: all var(--transition-normal);
}

.textInput:focus {
  outline: none;
  border-color: var(--color-accent);
  background-color: var(--color-bg-primary);
}
```

---

### Step 4.2: Create LeftColumn (Attributes) Component
**File:** `src/components/CharacterSheet/LeftColumn/AttributeBlock.tsx`

```typescript
import { FC } from 'react';
import { useCharacterSheet } from '../../../hooks/useCharacterSheet';
import { AttributeKey } from '../../../types/character';
import { NumberInput } from '../../Common/NumberInput';
import { Checkbox } from '../../Common/Checkbox';
import { getModifier } from '../../../utils/calculations';
import styles from './AttributeBlock.module.css';

interface AttributeBlockProps {
  attribute: AttributeKey;
  label: string;
}

export const AttributeBlock: FC<AttributeBlockProps> = ({ attribute, label }) => {
  const { character, dispatch } = useCharacterSheet();
  const attr = character.attributes[attribute];

  const handleBaseChange = (value: number) => {
    dispatch({
      type: 'UPDATE_ATTRIBUTE',
      payload: { attr: attribute, base: value }
    });
  };

  const handleSaveChange = () => {
    dispatch({
      type: 'TOGGLE_SAVING_THROW',
      payload: attribute
    });
  };

  const save = character.savingThrows.find(st => st.attribute === attribute);
  const savingThrowBonus = attr.modifier + (save?.isProficient ? character.proficiencyBonus : 0);

  return (
    <div className={styles.container}>
      <div className={styles.scoreSection}>
        <div className={styles.score}>{attr.base}</div>
        <NumberInput
          type="number"
          value={attr.base}
          min={3}
          max={20}
          onChange={(e) => handleBaseChange(parseInt(e.target.value) || 10)}
          className={styles.input}
          aria-label={`${label} score`}
        />
      </div>

      <div className={styles.modifierSection}>
        <span className={styles.label}>Mod</span>
        <div className={styles.modifier}>
          {attr.modifier > 0 ? '+' : ''}{attr.modifier}
        </div>
      </div>

      <div className={styles.saveSection}>
        <Checkbox
          checked={save?.isProficient || false}
          onChange={handleSaveChange}
          aria-label={`${label} saving throw proficiency`}
        />
        <span className={styles.savelabel}>ST</span>
        <span className={styles.saveBonus}>
          {savingThrowBonus > 0 ? '+' : ''}{savingThrowBonus}
        </span>
      </div>

      <span className={styles.name}>{label}</span>
    </div>
  );
};
```

**File:** `src/components/CharacterSheet/LeftColumn/LeftColumn.tsx`

```typescript
import { FC } from 'react';
import { AttributeBlock } from './AttributeBlock';
import styles from './LeftColumn.module.css';

export const LeftColumn: FC = () => {
  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>Attributes</h3>
      <div className={styles.attributes}>
        <AttributeBlock attribute="strength" label="Strength" />
        <AttributeBlock attribute="dexterity" label="Dexterity" />
        <AttributeBlock attribute="constitution" label="Constitution" />
        <AttributeBlock attribute="intelligence" label="Intelligence" />
        <AttributeBlock attribute="wisdom" label="Wisdom" />
        <AttributeBlock attribute="charisma" label="Charisma" />
      </div>
    </div>
  );
};
```

**File:** `src/components/CharacterSheet/LeftColumn/AttributeBlock.module.css`

```css
.container {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: var(--spacing-md);
  background-color: var(--color-bg-secondary);
  text-align: center;
}

.scoreSection {
  margin-bottom: var(--spacing-md);
}

.score {
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-accent);
  line-height: 1;
}

.input {
  width: 100%;
  margin-top: var(--spacing-xs);
}

.modifierSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  background-color: var(--color-bg-primary);
  border-radius: 3px;
}

.label {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--color-text-light);
  text-transform: uppercase;
}

.modifier {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-text);
}

.saveSection {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm);
  border: 1px dashed var(--color-border);
  border-radius: 3px;
}

.savelabel {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-light);
}

.saveBonus {
  font-size: 1.1rem;
  font-weight: 600;
}

.name {
  font-size: var(--font-size-sm);
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-text-light);
  letter-spacing: 1px;
}
```

**File:** `src/components/CharacterSheet/LeftColumn/LeftColumn.module.css`

```css
.container {
  background-color: var(--color-bg-secondary);
  border-radius: 4px;
  padding: var(--spacing-md);
}

.heading {
  margin-bottom: var(--spacing-md);
  text-align: center;
  color: var(--color-accent);
  font-size: var(--font-size-lg);
}

.attributes {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}
```

---

## Next Phase: Implementation continues in CenterColumn,RightColumn, BottomSection

Due to length constraints, the remaining components (CenterColumn, RightColumn, BottomSection) follow the same pattern:

1. **CenterColumn** - Inspiration, Proficiency, Saving Throws, Skills, Proficiencies
2. **RightColumn** - AC, Initiative, Speed, HP, Death Saves + Hit Dice
3. **BottomSection** - Features/Traits, Inventory, Backstory, Spells

Each section should:
- Use the `useCharacterSheet` hook for state
- Create reusable sub-components
- Use CSS Module styling
- Support the specific UI elements from the high-level plan
- Implement proper accessibility (ARIA labels, semantic HTML)

---

## Testing Checkpoint (Phase 1-4 Complete)

**At this point you should be able to:**

✅ Run the app (`npm run dev`)  
✅ See the layout taking shape  
✅ Update character info (name, class, level, etc.)  
✅ Update attributes and see modifiers calculate  
✅ Export character to JSON  
✅ Reload page and see character restored from localStorage  

**Quick verification:**
```bash
npm run dev
# Visual check in browser:
# - Header with Export/Import buttons
# - Character name input
# - Character info (class, level, race, background)
# - 6 attributes with scores and modifiers
```

---

## Remaining Implementation

### Phase 5: Complete CenterColumn & RightColumn (2-3 days)
- Inspiration & Proficiency inputs
- Saving Throws list
- Skills list with proficiency checkboxes
- Proficiencies & Languages text area
- AC, Initiative, Speed inputs
- HP tracking (max, current, temporary)
- Hit Dice management
- Death Saves counters

### Phase 6: Complete BottomSection (2-3 days)
- Features & Traits accordion with add/edit/delete
- Inventory accordion with add/edit/delete
- Backstory large text area
- Spells accordion grouped by level with add/edit/delete

### Phase 7: Polish & Refinement (1-2 days)
- Final styling and D&D-themed appearance
- Print stylesheet testing
- Mobile responsiveness
- Accessibility audit
- Error handling & edge cases
- Performance optimization

---

## File Checklist (Phase 1-4)

**Created:**
- [ ] Configuration files (vite.config.ts, tsconfig.json)
- [ ] `src/types/character.ts` - All TypeScript interfaces
- [ ] `src/utils/defaults.ts` - Default character data
- [ ] `src/utils/calculations.ts` - Math functions
- [ ] `src/utils/validation.ts` - Validation functions
- [ ] `src/utils/storage.ts` - LocalStorage helpers
- [ ] `src/utils/fileOperations.ts` - Export/Import
- [ ] `src/context/CharacterContext.tsx` - State management
- [ ] `src/hooks/useCharacterSheet.ts` - Hook for context
- [ ] `src/hooks/useLocalStorage.ts` - Generic storage hook
- [ ] `src/components/Common/NumberInput.tsx` + CSS module
- [ ] `src/components/Common/Checkbox.tsx` + CSS module
- [ ] `src/components/Common/TextArea.tsx` + CSS module
- [ ] `src/components/Common/Modal.tsx` + CSS module
- [ ] `src/components/Header/Header.tsx` + CSS module
- [ ] `src/styles/variables.css` - CSS custom properties
- [ ] `src/styles/global.css` - Global styles
- [ ] `src/components/CharacterSheet/TopHeader/TopHeader.tsx` + CSS module
- [ ] `src/components/CharacterSheet/LeftColumn/LeftColumn.tsx` + CSS module
- [ ] `src/components/CharacterSheet/LeftColumn/AttributeBlock.tsx` + CSS module
- [ ] `src/App.tsx` - Main app component
- [ ] `src/index.tsx` - React entry point

**To be organized further based on your development pace**

