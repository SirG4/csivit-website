'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './EventsMobile.module.css';

const EventsMobile = () => {
  const [selectedIndex, setSelectedIndex] = useState(2);

  const memories = [
    { year: '221 BCE', title: 'ANCIENT TIMES', image: '/Events/poster1.jpeg', alt: 'Ancient civilizations' },
    { year: '431 BCE', title: 'ODYSSEY', image: '/Events/poster2.jpeg', alt: 'Greek Odyssey' },
    { year: '49 BCE', title: 'ORIGINS', image: '/Events/poster3.jpeg', alt: 'Ancient Origins' },
    { year: '861 CE', title: 'MIRAGE', image: '/Events/poster4.jpeg', alt: 'Desert Mirage' },
    { year: '872 CE', title: 'VALHALLA', image: '/Events/poster5.jpeg', alt: 'Norse Valhalla' },
    { year: '1579 CE', title: 'SHADOWS', image: '/e1.jpg', alt: 'Shadows of the Past' },
    { year: '1868 CE', title: 'SYNDICATE', image: '/e2.jpg', alt: 'Industrial Revolution' },
    { year: '1920 CE', title: 'CHRONICLES', image: '/e3.jpg', alt: 'Modern Chronicles' },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.displayPanel}>
        <div className={styles.displayContent}>
          {memories[selectedIndex].image ? (
            <div className={styles.imageWrapper}>
              <Image
                src={memories[selectedIndex].image}
                alt={memories[selectedIndex].alt}
                fill
                className={styles.memoryImage}
                priority
              />
              <div className={styles.imageOverlay}>
                <h3 className={styles.displayTitle}>{memories[selectedIndex].title}</h3>
                <p className={styles.displayYear}>{memories[selectedIndex].year}</p>
              </div>
            </div>
          ) : (
            <div className={styles.noImage}>
              <p className={styles.altText}>{memories[selectedIndex].alt}</p>
            </div>
          )}

          <div className={styles.memoriesContainer}>
            <div className={styles.header}>
              <div className={styles.icon}>
                <Image
                  src="/Events/animus.png"
                  alt="Animus"
                  width={28}
                  height={28}
                  className={styles.animusIcon}
                />
              </div>
              <h2 className={styles.title}>MEMORIES</h2>
            </div>

            <div className={styles.timeline}>
              {/* Slot 1: item above selected (or blank) */}
              {selectedIndex > 0 ? (
                <div
                  className={styles.memoryItem}
                  onClick={() => setSelectedIndex(selectedIndex - 1)}
                  style={{ width: 'calc(100% - 8%)' }}
                >
                  <div className={styles.yearLabel}>{memories[selectedIndex - 1].year}</div>
                  <div className={styles.memoryTitle}>{memories[selectedIndex - 1].title}</div>
                </div>
              ) : (
                <div className={styles.memoryItemBlank} />
              )}

              {/* Slot 2: currently selected item */}
              <div
                className={`${styles.memoryItem} ${styles.selected}`}
                style={{ width: '100%' }}
              >
                <div className={styles.selectionIndicator}>
                  <div className={styles.arrow}>→</div>
                </div>
                <div className={styles.yearLabel}>{memories[selectedIndex].year}</div>
                <div className={styles.memoryTitle}>{memories[selectedIndex].title}</div>
              </div>

              {/* Slot 3: item below selected (or blank) */}
              {selectedIndex < memories.length - 1 ? (
                <div
                  className={styles.memoryItem}
                  onClick={() => setSelectedIndex(selectedIndex + 1)}
                  style={{ width: 'calc(100% - 8%)' }}
                >
                  <div className={styles.yearLabel}>{memories[selectedIndex + 1].year}</div>
                  <div className={styles.memoryTitle}>{memories[selectedIndex + 1].title}</div>
                </div>
              ) : (
                <div className={styles.memoryItemBlank} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsMobile;