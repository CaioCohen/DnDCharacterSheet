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
