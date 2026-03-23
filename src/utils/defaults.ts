import { DndCharacter, AttributeKey } from '../types/character';

export const DEFAULT_ATTRIBUTES: AttributeKey[] = [
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
  spellSlots: {
    1: { current: 0, max: 0 },
    2: { current: 0, max: 0 },
    3: { current: 0, max: 0 },
    4: { current: 0, max: 0 },
    5: { current: 0, max: 0 },
    6: { current: 0, max: 0 },
    7: { current: 0, max: 0 },
    8: { current: 0, max: 0 },
    9: { current: 0, max: 0 }
  },

  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
