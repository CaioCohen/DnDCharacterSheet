// Interface for spells loaded from dnd spells.json
export interface DndSpell {
  name: string;
  level: number;
  school: string;
  classes: string[];
  actionType: string;
  concentration: boolean;
  ritual: boolean;
  range: string;
  components: string[];
  material?: string;
  duration: string;
  description: string;
  higherLevelSlot?: string;
  cantripUpgrade?: string;
}
