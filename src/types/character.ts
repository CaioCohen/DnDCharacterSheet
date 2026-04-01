export type AttributeKey = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';

export interface AttributeScore {
  base: number;
  modifier: number;
  savingThrow: boolean;
}

export interface SavingThrow {
  attribute: AttributeKey;
  isProficient: boolean;
}

export interface Skill {
  name: string;
  attribute: AttributeKey;
  isProficient: boolean;
  expertise: boolean;
  bonus: number;
}

export interface HitPoints {
  max: number;
  current: number;
  temporary: number;
}

export interface HitDice {
  id: string;
  amount: number;
  type: string;
  used: number;
}

export interface DeathSaves {
  successes: number;
  failures: number;
}

export interface FeatureTrait {
  id: string;
  title: string;
  origin: string;
  description: string;
}

// Custom counter added by user
export interface CustomCounter {
  id: string;
  title: string;
  value: number;
}

export interface InventoryItem {
  id: string;
  title: string;
  description: string;
  quantity?: number;
  weight?: number;
  rarity?: string;
}

export interface Spell {
  id: string;
  title: string;
  level: number;
  school?: string;
  description: string;
  components?: string;
  castingTime?: string;
  duration?: string;
  range?: string;
  checked?: boolean;
}

export interface DndCharacter {
  name: string;
  class: string;
  level: number;
  background: string;
  race: string;
  alignment: string;
  playerName?: string;

  attributes: {
    strength: AttributeScore;
    dexterity: AttributeScore;
    constitution: AttributeScore;
    intelligence: AttributeScore;
    wisdom: AttributeScore;
    charisma: AttributeScore;
  };

  inspiration: number;
  proficiencyBonus: number;
  savingThrows: SavingThrow[];
  skills: Skill[];
  proficienciesLanguages: string;

  armorClass: number;
  initiative: number;
  speed: number;
  hitPoints: HitPoints;
  hitDice: HitDice[];
  deathSaves: DeathSaves;

  featuresTraits: FeatureTrait[];
  customCounters: CustomCounter[];
  inventory: InventoryItem[];
  backstory: string;
  spells: Spell[];
  spellSlots: Record<number, { current: number; max: number }>;
  // Money fields (copper, silver, gold, platinum)
  money: {
    copper: number;
    silver: number;
    gold: number;
    platinum: number;
  };

  createdAt: string;
  updatedAt: string;
}

export interface ExportedCharacter {
  version: string;
  exportedAt: string;
  character: DndCharacter;
}

export interface ValidationError {
  field: string;
  message: string;
}
