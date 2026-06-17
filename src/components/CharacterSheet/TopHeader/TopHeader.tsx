import { ChangeEvent, FC, useEffect, useRef, useState } from 'react';
import { useCharacterSheet } from '@/hooks/useCharacterSheet';
import { NumberInput } from '@/components/Common//NumberInput';
import { processCharacterImage } from '@/utils/imageProcessing';
import styles from './TopHeader.module.css';

export const TopHeader: FC = () => {
  const { character, dispatch } = useCharacterSheet();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string | number) => {
    dispatch({
      type: 'UPDATE_CHARACTER_INFO',
      payload: { [field]: value }
    });
  };

  useEffect(() => {
    setImageError(null);
  }, [character.image]);

  const handlePortraitUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      setImageError(null);
      const image = await processCharacterImage(file);
      dispatch({
        type: 'UPDATE_CHARACTER_INFO',
        payload: { image }
      });
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Could not process the selected image.');
    }
  };

  const handlePortraitPick = () => {
    fileInputRef.current?.click();
  };

  const handlePortraitAreaClick = () => {
    handlePortraitPick();
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.infoLayout}>
          <div className={styles.infoColumn}>
            <div className={styles.nameSection}>
              <input
                type="text"
                value={character.name}
                onChange={(event) => handleInputChange('name', event.target.value)}
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
                  onChange={(event) => handleInputChange('class', event.target.value)}
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
                  onChange={(event) => handleInputChange('level', parseInt(event.target.value) || 1)}
                />
              </div>

              <div className={styles.infoItem}>
                <label className={styles.label}>Race</label>
                <input
                  type="text"
                  value={character.race}
                  onChange={(event) => handleInputChange('race', event.target.value)}
                  placeholder="e.g., Human"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.infoItem}>
                <label className={styles.label}>Background</label>
                <input
                  type="text"
                  value={character.background}
                  onChange={(event) => handleInputChange('background', event.target.value)}
                  placeholder="e.g., Soldier"
                  className={styles.textInput}
                />
              </div>

              <div className={styles.infoItem}>
                <label className={styles.label}>Alignment</label>
                <input
                  type="text"
                  value={character.alignment}
                  onChange={(event) => handleInputChange('alignment', event.target.value)}
                  placeholder="e.g., Lawful Good"
                  className={styles.textInput}
                />
              </div>
            </div>
          </div>

          <div className={styles.portraitColumn}>
            <div className={styles.portraitCard}>
              <label className={styles.label}>Portrait</label>
              <button
                type="button"
                className={styles.portraitPreviewButton}
                onClick={handlePortraitAreaClick}
                aria-label={character.image ? 'Replace character portrait' : 'Upload character portrait'}
              >
                {character.image?.dataUrl ? (
                  <img
                    src={character.image.dataUrl}
                    alt={character.image.name || 'Character portrait'}
                    className={styles.portraitImage}
                  />
                ) : (
                  <div className={styles.portraitPlaceholder}>
                    Click to upload portrait
                  </div>
                )}
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className={styles.fileInput}
                onChange={handlePortraitUpload}
              />
              {imageError && <p className={styles.errorText}>{imageError}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

