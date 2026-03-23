export const getModifier = (baseScore: number): number => {
  return Math.floor((baseScore - 10) / 2);
};

export const getProficiencyBonus = (level: number): number => {
  if (level <= 4) return 2;
  if (level <= 8) return 3;
  if (level <= 12) return 4;
  if (level <= 16) return 5;
  return 6;
};

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

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};
