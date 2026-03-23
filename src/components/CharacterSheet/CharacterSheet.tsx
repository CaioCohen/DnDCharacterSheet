import { FC } from 'react';
import { TopHeader } from './TopHeader/TopHeader';
import { LeftColumn } from './LeftColumn/LeftColumn';
import { CenterColumn } from './CenterColumn/CenterColumn';
import { SkillsColumn } from './SkillsColumn/SkillsColumn';
import { RightColumn } from './RightColumn/RightColumn';
import { BottomSection } from './BottomSection/BottomSection';
import styles from './CharacterSheet.module.css';

export const CharacterSheet: FC = () => {
  return (
    <main className={styles.wrapper}>
      <TopHeader />

      <div className={styles.mainContent}>
        <div className={styles.columnsContainer}>
          <div className={styles.leftColumn}>
            <LeftColumn />
          </div>

          <div className={styles.centerColumn}>
            <CenterColumn />
          </div>

          <div className={styles.skillsColumn}>
            <SkillsColumn />
          </div>

          <div className={styles.rightColumn}>
            <RightColumn />
          </div>
        </div>
      </div>

      <div className={styles.bottomSection}>
        <BottomSection />
      </div>
    </main>
  );
};
