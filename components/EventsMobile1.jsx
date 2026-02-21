'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './EventsMobile1.module.css';

const EventsMobile1 = () => {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const timelineRef = useRef(null);
  
  // Define a fixed height for items to make scroll math perfect
  const ITEM_HEIGHT = 80; 

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

  // Actively update selected item based on scroll position
  const handleScroll = (e) => {
    if (!e.target) return;
    const scrollTop = e.target.scrollTop;
    // Divide current scroll position by item height to find the centered item
    const newIndex = Math.round(scrollTop / ITEM_HEIGHT);
    
    if (newIndex >= 0 && newIndex < memories.length && newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  // Allow clicking an item to scroll it to the center
  const handleItemClick = (index) => {
    if (timelineRef.current) {
      timelineRef.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: 'smooth'
      });
    }
  };

  // Center the default selected item on mount
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = selectedIndex * ITEM_HEIGHT;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.displayPanel}>
        <div className={styles.displayContent}>
          {memories[selectedIndex]?.image ? (
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
              <p className={styles.altText}>{memories[selectedIndex]?.alt}</p>
            </div>
          )}
            </div>
        </div>

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

            <div
              className={styles.timeline}
              ref={timelineRef}
              onScroll={handleScroll}
            >
              {memories.map((memory, index) => {
                const distanceFromCenter = Math.abs(index - selectedIndex);
                const widthReduction = distanceFromCenter * 8;
                
                // Only show the center item and the one directly above/below it
                const isVisible = distanceFromCenter <= 1;

                return (
                  <div
                    key={index}
                    className={`${styles.memoryItem} ${
                      index === selectedIndex ? styles.selected : ''
                    }`}
                    onClick={() => handleItemClick(index)}
                    style={{
                      width: `calc(100% - ${widthReduction}%)`,
                      opacity: isVisible ? 1 : 0,
                      pointerEvents: isVisible ? 'auto' : 'none',
                    }}
                  >
                    <div className={styles.yearLabel}>{memory.year}</div>
                    <div className={styles.memoryTitle}>{memory.title}</div>
                    {index === selectedIndex && (
                      <div className={styles.selectionIndicator}>
                        <div className={styles.arrow}>→</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

  );
};

export default EventsMobile1;