# D&D Character Sheet - High-Level Implementation Plan

## Overview
Build a fully interactive React web application for creating and editing D&D character sheets with localStorage persistence, import/export functionality, and a layout resembling a traditional character sheet.

---

## 1. Architecture & Folder Structure

```
src/
├── components/
│   ├── Header/
│   │   └── Header.tsx
│   ├── CharacterSheet/
│   │   ├── CharacterSheet.tsx          (main layout container)
│   │   ├── TopHeader/
│   │   │   └── TopHeader.tsx          (character name, class, race, etc.)
│   │   ├── LeftColumn/
│   │   │   ├── LeftColumn.tsx
│   │   │   └── AttributeBlock.tsx
│   │   ├── CenterColumn/
│   │   │   ├── CenterColumn.tsx
│   │   │   ├── SavingThrows.tsx
│   │   │   └── Skills.tsx
│   │   ├── RightColumn/
│   │   │   ├── RightColumn.tsx
│   │   │   ├── HitPoints.tsx
│   │   │   ├── DeathSaves.tsx
│   │   │   └── FeaturesTraits.tsx
│   │   ├── BottomSection/
│   │   │   ├── Inventory.tsx
│   │   │   ├── Backstory.tsx
│   │   │   └── Spells.tsx
│   └── Common/
│       ├── AccordionList.tsx
│       ├── NumberInput.tsx
│       ├── Checkbox.tsx
│       ├── TextArea.tsx
│       └── Modal.tsx
├── hooks/
│   ├── useCharacterSheet.ts           (main state management hook)
│   ├── useLocalStorage.ts             (persistence helper)
│   └── useValidation.ts               (validation logic)
├── types/
│   └── character.ts                   (all TypeScript interfaces)
├── utils/
│   ├── export.ts                      (JSON export logic)
│   ├── import.ts                      (JSON import logic)
│   ├── validation.ts                  (data validation rules)
│   └── defaults.ts                    (default character data)
├── styles/
│   ├── global.css                     (base styling)
│   └── variables.css                  (CSS custom properties)
├── App.tsx
└── index.tsx
```

---

## 2. Data Model (TypeScript Interfaces)

### Core Structure
```typescript
interface DndCharacter {
  // Header Info
  name: string;
  class: string;
  level: number;
  background: string;
  race: string;
  alignment: string;

  // Attributes (6 core stats)
  attributes: {
    strength: AttributeScore;
    dexterity: AttributeScore;
    constitution: AttributeScore;
    intelligence: AttributeScore;
    wisdom: AttributeScore;
    charisma: AttributeScore;
  };

  // Proficiency & Combat
  inspiration: number;
  proficiencyBonus: number;
  savingThrows: SavingThrow[];
  skills: Skill[];
  proficienciesLanguages: string;

  // Combat Stats
  armorClass: number;
  initiative: number;
  speed: number;
  hitPoints: HitPoints;
  hitDice: HitDice[];
  deathSaves: DeathSaves;

  // Content Sections
  featuresTraits: FeatureTrait[];
  inventory: InventoryItem[];
  backstory: string;
  spells: Spell[];
}

interface AttributeScore {
  base: number;            // score (3-20)
  modifier: number;        // calculated from base
  savingThrow: boolean;    // is proficient
}

interface SavingThrow {
  attribute: AttributeKey;
  isProficient: boolean;
}

interface Skill {
  name: string;
  attribute: AttributeKey;
  isProficient: boolean;
  bonus: number;           // calculated
}

interface HitPoints {
  max: number;
  current: number;
  temporary: number;
}

interface HitDice {
  amount: number;
  type: string;            // e.g., "d6", "d8"
  used: number;
}

interface DeathSaves {
  successes: number;       // 0-3
  failures: number;        // 0-3
}

interface FeatureTrait {
  id: string;
  title: string;
  origin: string;          // class, background, race, etc.
  description: string;
}

interface InventoryItem {
  id: string;
  title: string;
  description: string;
  weight?: number;
  quantity?: number;
  rarity?: string;
}

interface Spell {
  id: string;
  title: string;
  level: number;           // 0-9
  school?: string;
  description: string;
  components?: string;
  castingTime?: string;
  duration?: string;
}
```

---

## 3. Component Breakdown

### Page Structure (Infinite Scroll Layout)

```
Header (fixed or sticky)
  └─ Character Controls (Export, Import, Save)

CharacterSheet (main scrollable area)
  │
  ├─ TopHeader (Character Name, Class, Level, Race, Background, Alignment)
  │
  ├─ MainContent (3-column layout)
  │  ├─ LeftColumn
  │  │  └─ AttributeBlock (6 attributes, each showing score, modifier, save checkbox)
  │  │
  │  ├─ CenterColumn
  │  │  ├─ Inspiration & Proficiency Bonus
  │  │  ├─ SavingThrows (6 items, all with proficiency checkbox)
  │  │  ├─ Skills (scrollable accordion list with proficiency checkboxes)
  │  │  └─ Proficiencies & Languages (text area)
  │  │
  │  └─ RightColumn
  │     ├─ AC, Initiative, Speed (3 simple inputs)
  │     ├─ HitPoints (Max, Current, Temporary)
  │     ├─ HitDice (list)
  │     └─ DeathSaves (success/failure counters)
  │
  ├─ FeaturesTraits (collapsible accordion list with add/edit/delete)
  │
  ├─ Inventory (collapsible accordion list with add/edit/delete)
  │
  ├─ Backstory (large text area)
  │
  └─ Spells (accordion list grouped by spell level, editable)
```

### Key Components by Function

**Data Entry Components:**
- `NumberInput` - for attributes, AC, HP, etc. (with min/max validation)
- `TextInput` - for names, titles, class, race, alignment
- `TextArea` - for descriptions, backstory
- `Checkbox` - for proficiencies and skill selection

**Container Components:**
- `AccordionList` - reusable for FeaturesTraits, Inventory, Spells
- `ColumnLayout` - responsive 3-column layout for top sections

**Modal/Dialog:**
- `FeatureModal` - add/edit features (title, origin, description)
- `InventoryModal` - add/edit items
- `SpellModal` - add/edit spells
- `ConfirmationModal` - delete confirmations

---

## 4. State Management Strategy

**Use React Context + useReducer Pattern (no Redux needed)**

```typescript
// Main context for character data
const CharacterContext = createContext<CharacterContextType | null>(null);

// Main hook for using character state
const useCharacterSheet = () => {
  const [character, dispatch] = useReducer(characterReducer, initialState);
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save to localStorage on changes
  useEffect(() => {
    saveToLocalStorage(character);
    setIsDirty(true);
  }, [character]);

  return { character, dispatch, isDirty };
};
```

**Action Types:**
```typescript
type CharacterAction =
  | { type: 'UPDATE_ATTRIBUTE'; payload: { attr: AttributeKey; value: number } }
  | { type: 'UPDATE_SKILL'; payload: { skillName: string; isProficient: boolean } }
  | { type: 'TOGGLE_SAVING_THROW'; payload: { attr: AttributeKey } }
  | { type: 'ADD_FEATURE'; payload: FeatureTrait }
  | { type: 'DELETE_FEATURE'; payload: string }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'ADD_SPELL'; payload: Spell }
  | { type: 'UPDATE_SPELL'; payload: Spell }
  | { type: 'DELETE_SPELL'; payload: string }
  | { type: 'UPDATE_HP'; payload: Partial<HitPoints> }
  | { type: 'LOAD_CHARACTER'; payload: DndCharacter }
  // ... more as needed
```

---

## 5. Data Persistence Strategy

**localStorage Implementation:**
- Key: `dnd_character_sheet`
- On every character state change → auto-save to localStorage
- On app load → restore from localStorage or show empty sheet
- Validation on restore to ensure data integrity

**Export/Import:**
- **Export:** Stringify character object → download as `.json` file
- **Import:** Parse JSON file → validate structure → load into app
- Add version field to JSON for backward compatibility

---

## 6. Styling Strategy

**Approach: Vanilla CSS + CSS Custom Properties**

**Rationale:**
- Traditional sheet styling is simpler with plain CSS
- Tailwind adds unnecessary bundle size
- CSS Modules prevent naming conflicts
- Custom properties enable printable layout variations

**Base Structure:**
```css
:root {
  /* Colors */
  --color-bg-primary: #f5f5f5;
  --color-bg-secondary: #fff;
  --color-border: #d0d0d0;
  --color-text: #333;
  --color-accent: #8b0000;

  /* Typography */
  --font-family: 'Atlanta Pro', 'Georgia', serif;
  --font-size-base: 14px;
  --font-size-heading: 20px;

  /* Spacing (8px grid) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;

  /* Layout */
  --column-gap: 20px;
  --max-width: 1200px;

  /* Print media */
  @media print {
    --color-bg-primary: transparent;
    --color-bg-secondary: white;
  }
}
```

**Component Styling Pattern:**
```typescript
// CharacterSheet.module.css
.container {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1fr;
  gap: var(--column-gap);
  padding: var(--spacing-lg);
  max-width: var(--max-width);
  margin: 0 auto;
}

.leftColumn { /* fixed width for attributes */ }
.centerColumn { /* middle content */ }
.rightColumn { /* combat stats */ }

// Print-friendly queries
@media print {
  .container {
    page-break-inside: avoid;
  }
}
```

---

## 7. Validation Strategy

**Validation Layers:**

1. **Attribute Scores:** 3-20 range with automatic modifier calculation
2. **Numeric Fields:** Min/max constraints (AC 0-30, HP min 1, etc.)
3. **Skill Bonuses:** Calculate from attribute modifier + proficiency bonus
4. **Spell Levels:** 0-9 range
5. **JSON Import:** Validate structure, type-check all fields, strip unknown properties

**Validation Hook:**
```typescript
const useValidation = (character: DndCharacter) => {
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const validate = useCallback(() => {
    const newErrors: ValidationError[] = [];
    
    // Attribute validation
    Object.entries(character.attributes).forEach(([key, attr]) => {
      if (attr.base < 3 || attr.base > 20) {
        newErrors.push({
          field: `attributes.${key}`,
          message: 'Score must be 3-20'
        });
      }
    });

    // HP validation
    if (character.hitPoints.current > character.hitPoints.max) {
      newErrors.push({
        field: 'hitPoints.current',
        message: 'Cannot exceed max HP'
      });
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }, [character]);

  return { errors, validate };
};
```

---

## 8. Export/Import Implementation

**Export Function:**
```typescript
const exportCharacter = (character: DndCharacter) => {
  const data = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    character
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], 
    { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${character.name}-sheet.json`;
  link.click();
};
```

**Import Function:**
```typescript
const importCharacter = async (file: File): Promise<DndCharacter> => {
  const text = await file.text();
  const data = JSON.parse(text);
  
  // Validate structure
  if (!data.character) throw new Error('Invalid character file');
  
  // Validate against schema
  const character = validateCharacterSchema(data.character);
  return character;
};
```

---

## 9. Handle Calculations

**Automatic Calculations:**

```typescript
// Attribute Modifier (from base score)
const getModifier = (score: number) => Math.floor((score - 10) / 2);

// Proficiency Bonus (based on level)
const getProficiencyBonus = (level: number) => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
};

// Skill Bonus
const getSkillBonus = (
  attribute: AttributeScore,
  isProficient: boolean,
  proficiencyBonus: number
) => {
  return attribute.modifier + (isProficient ? proficiencyBonus : 0);
};

// Update these on relevant changes (attributes, level, skill selection)
// Trigger via dispatch in reducer
```

---

## 10. Printable Layout

**Considerations:**

1. **Paper Size:** Design for A4 (210mm × 297mm)
2. **Margins:** Set print margins (1 inch / 25.4mm)
3. **Multi-page Handling:**
   - Sections should page-break gracefully
   - Use `page-break-inside: avoid` for critical blocks (features, spells)
   - Consider separate printable views for long sections

4. **Print Stylesheet:**
```css
@media print {
  body {
    background: white;
    font-size: 12px; /* Smaller for print */
  }
  
  .noprint {
    display: none;
  }
  
  header, .controls {
    display: none;
  }
  
  .container {
    max-width: 100%;
    color: black;
  }
  
  /* Avoid cutting off content */
  .section { page-break-inside: avoid; }
  .accordion { page-break-inside: avoid; }
}
```

5. **Export as PDF:** Recommend using browser's print-to-PDF feature

---

## 11. Accessibility Considerations

1. **ARIA Labels:**
   - All form inputs with explicit labels
   - Sections with `role="region"` and `aria-label`
   - Buttons with clear, descriptive text

2. **Keyboard Navigation:**
   - Tab order follows visual hierarchy
   - Modals trap focus
   - Accordion items keyboard-accessible

3. **Semantic HTML:**
   - Use proper heading hierarchy (h1 → h6)
   - Fieldsets for grouped inputs
   - Tables for structured data (if needed)

4. **Color Contrast:**
   - Min 4.5:1 ratio for text
   - Avoid color-only indicators (pair with icons/patterns)

5. **Focus Indicators:**
   - Visible focus outline on all interactive elements
   - Custom focus styles complement design

---

## 12. Project Milestones (MVP → Advanced)

### Phase 1: MVP (Week 1-2)
- ✅ Project setup (Vite + React + TypeScript)
- ✅ Data model definition
- ✅ Basic character sheet layout (top header, 3-column layout)
- ✅ Core attribute inputs and HP tracking
- ✅ localStorage persistence
- ✅ Basic styling (functional, not polished)

### Phase 2: Full Feature Set (Week 3-4)
- ✅ All form inputs (skills, saving throws, spells)
- ✅ Accordion lists (features, inventory, spells)
- ✅ Modals for adding/editing items
- ✅ Confirmation dialogs for deletion
- ✅ Export/Import functionality
- ✅ Validation across all inputs
- ✅ Auto-calculation (modifiers, bonuses)

### Phase 3: Polish & Refinement (Week 5)
- ✅ Finalized styling (D&D-themed appearance)
- ✅ Print stylesheet & PDF export testing
- ✅ Mobile responsiveness (single-column layout)
- ✅ Accessibility audit & fixes
- ✅ Performance optimization
- ✅ Error handling & edge cases

### Phase 4: Advanced Features (Future)
- Multi-character support
- Character templates/presets
- Spell filtering & search
- Character leveling wizard
- Cloud sync (add backend)
- Dark mode
- Custom themes

---

## 13. Performance Optimizations

1. **React Optimization:**
   - Memoize expensive components (`React.memo`)
   - Use `useCallback` for event handlers
   - Split large forms into smaller sub-components

2. **State Management:**
   - Keep state as shallow as possible
   - Avoid deep nesting
   - Use `useMemo` for derived calculations

3. **Rendering:**
   - Virtual scrolling for long lists (Spells, Skills)
   - Lazy-load modals (only render when open)
   - Debounce input handlers

4. **Bundle Size:**
   - Tree-shake unused code
   - Lazy load pages if multi-page later
   - Minimize external dependencies

---

## 14. Tools & Dependencies

**Minimal Stack:**
- React 18+
- TypeScript
- Vite (build tool)
- CSS Modules (styling)

**Optional (if needed later):**
- `vitest` or `jest` (testing)
- `uuid` (generate IDs for items)
- `react-hook-form` (advanced form handling)
- `recharts` (visualizations, if added)

---

## 15. File Operations (Export/Import)

**Storage Locations:**
- localStorage key: `dnd_character_sheet`
- Export location: Browser's download folder (user-controlled)
- Import: File upload dialog

**JSON Structure on Export:**
```json
{
  "version": "1.0",
  "exportedAt": "2026-03-23T10:30:00Z",
  "character": {
    "name": "Aragorn",
    "class": "Fighter",
    "level": 1,
    ...
  }
}
```

---

## 16. Layout Breakdown (Visual Hierarchy)

**Top Header (Full Width):**
- Large character name (h1)
- Inline: Class/Level, Race, Background, Alignment
- Sticky or floating controls (Export, Import, Save)

**Three-Column Main Content:**
- **Left (20%):** Attributes (vertical list)
- **Center (30%):** Inspiration, Proficiency, Saving Throws, Skills, Proficiencies
- **Right (20%):** AC, Initiative, Speed, HP, Death Saves

**Below 3-Column:**
- Features & Traits (full width, collapsed accordion)
- Inventory (full width, collapsed accordion)
- Backstory (full width, large text area)
- Spells (full width, collapsed accordion grouped by level)

**Spacing:**
- Clear visual separation between major sections
- Consistent padding/margins (8px grid)
- Borders or background colors to define sections

---

## 17. Error Handling

**Scenarios to Handle:**
1. **localStorage Full:** Warn user, offer to clear old data
2. **Invalid JSON on Import:** Show error message, prevent load
3. **Corrupted Data:** Offer to reset or restore from backup
4. **Browser Compatibility:** Graceful fallback
5. **Network (future):** Handle sync failures

**User Feedback:**
- Toast notifications for save/export success
- Error messages in modals
- Validation error messages inline with fields

---

## 18. Testing Strategy (Optional for MVP)

**Unit Tests:**
- Validation functions
- Calculation functions (modifiers, bonuses)
- Reducer logic

**Integration Tests:**
- Add/edit/delete feature flow
- Import/export round-trip
- State persistence

**E2E Tests (Optional):**
- Full character creation workflow
- Export and reimport
- Print preview

---

## Next Steps

1. Create project structure & install dependencies
2. Define TypeScript interfaces in `types/character.ts`
3. Implement `useCharacterSheet` hook with reducer
4. Build basic layout components (TopHeader, LeftColumn, etc.)
5. Implement form inputs (NumberInput, TextArea, etc.)
6. Add localStorage integration
7. Add export/import logic
8. Style components
9. Add validation
10. Test on printable layout
11. Polish and optimize

