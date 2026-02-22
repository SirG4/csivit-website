'use client';
import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import styles from './EventsMobile1.module.css';

const EventsMobile1 = () => {
  const [selectedIndex, setSelectedIndex] = useState(2);
  const [showDetails, setShowDetails] = useState(false);
  
  // Swipe gesture states
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  const timelineRef = useRef(null);
  const ITEM_WIDTH = 160; 

  const memories = [
    {
      year: '24 SEP 2025',
      title: 'FILM FIESTA 5.0',
      image: '/Events/poster2.jpeg',
      alt: 'Film Fiesta 5.0 Poster',
      sync: 100,
      location: 'VIT Auditorium — 4 PM onwards',
      desc: 'CSI-VIT presents Film Fiesta 5.0! Catch screenings of Arrival, Jojo Rabbit, Ford v Ferrari, and Superman back-to-back. Contact: Gautami Kamble: 75065 63517 | Varun Singh: 75883 05192',
    },
    {
      year: '27 SEP 2025',
      title: 'CYBERFRAT',
      image: '/Events/poster3.jpeg',
      alt: 'Cyberfrat Cybersecurity Symposium Poster',
      sync: 100,
      location: 'VIT Auditorium — 11:00 AM to 3:00 PM',
      desc: 'CSI-VIT in collaboration with Cyberfrat presents a Cybersecurity Symposium: "Securing the Digital Future." Featuring industry leaders from Equifax, SBI, Cyberfrat, LTIMindtree, Cutsight & VIT Mumbai. Contact: Varun Singh: 75883 05192 | Gautami Kamble: 75065 63517',
    },
    {
      year: '21 OCT 2025',
      title: 'DATA BEYOND DASHBOARD',
      image: '/Events/poster1.jpeg',
      alt: 'Data Beyond Dashboard Poster',
      sync: 100,
      location: 'Live on YouTube — 4 PM to 6 PM',
      desc: 'A special alumni episode featuring Rujuta Lanke, Data Analyst at American Express, New York — sharing her journey beyond VIT. Contact: Gautami Kamble: 75065 63517 | Varun Singh: 75883 05192',
    },
    {
      year: '7 FEB 2026',
      title: 'CLOUD NATIVE MUMBAI',
      image: '/Events/poster4.jpeg',
      alt: 'Cloud Native Now in Mumbai Poster',
      sync: 100,
      location: 'VIT Auditorium, Wadala — 10 AM to 2 PM',
      desc: 'Cloud Native Now in Mumbai! An inaugural meeting: "From Local Trains to Global Code." Empowering developers through hands-on learning and community-driven growth. Contact: Gautami K.: +91 75065 63517 | Varun S.: +91 75883 05192',
    },
    {
      year: '12 MAR 2026',
      title: 'BUG AUCTION',
      image: '/Events/poster5.jpeg',
      alt: 'Bug Auction — Enthusia Poster',
      sync: 78,
      location: 'VIT Mumbai — Details TBA',
      desc: 'CSI-VIT Enthusia presents Bug Auction — "Gotta patch \'em all!" Hunt bugs, bid your way to the top, and claim your reward. Stay tuned for venue and timing details.',
    },
  ];

  // --- Swipe Gesture Logic ---
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isUpSwipe = distance > minSwipeDistance;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isUpSwipe && !showDetails) setShowDetails(true);
    if (isDownSwipe && showDetails) setShowDetails(false);
  };

  // --- Scroll Logic ---
  const handleScroll = (e) => {
    if (!e.target || showDetails) return; // Disable changing while reading details
    const scrollLeft = e.target.scrollLeft;
    const newIndex = Math.round(scrollLeft / ITEM_WIDTH);
    
    if (newIndex >= 0 && newIndex < memories.length && newIndex !== selectedIndex) {
      setSelectedIndex(newIndex);
    }
  };

  const handleItemClick = (index) => {
    if (showDetails) setShowDetails(false); // Close details if clicking a new item
    if (timelineRef.current) {
      timelineRef.current.scrollTo({ left: index * ITEM_WIDTH, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = selectedIndex * ITEM_WIDTH;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeMemory = memories[selectedIndex];

  return (
    <div className={styles.pageWrapper}>
      
      {/* Central Poster View (Swipe Area) */}
      <div 
        className={styles.displayPanel}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div className={styles.displayContent}>
          {activeMemory?.image ? (
            <div className={styles.imageWrapper}>
              <Image
                src={activeMemory.image}
                alt={activeMemory.alt}
                fill
                className={`${styles.memoryImage} ${showDetails ? styles.imageBlurred : ''}`}
                priority
              />
              
              {/* The "Swipe Up" prompt that vanishes when details are open */}
              <div className={`${styles.imageOverlay} ${showDetails ? styles.hidden : ''}`}>
                <div className={styles.swipeIndicator}>
                  <span className={styles.swipeArrow}>^</span>
                  <span className={styles.swipeText}>SWIPE UP FOR DATA</span>
                </div>
                <h3 className={styles.displayTitle}>{activeMemory.title}</h3>
                <p className={styles.displayYear}>{activeMemory.year}</p>
              </div>

              {/* DETAILS PANEL - Assassin's Creed Light Theme */}
              <div className={`${styles.detailsPanel} ${showDetails ? styles.detailsActive : ''}`}>
                <div className={styles.acHeaderContainer}>
                  <div className={styles.acHeaderSmall}>DATA FRAGMENT</div>
                  <div className={styles.acHeaderLarge}>{activeMemory.title}</div>
                </div>

                <div className={styles.acContentBox}>
                  {/* Sync Bar Area */}
                  <div className={styles.acSection}>
                    <div className={styles.acFlexRow}>
                      <span className={styles.acLabelDark}>{activeMemory.sync}%</span>
                      <div className={styles.acProgressBar}>
                        <div 
                          className={styles.acProgressFill} 
                          style={{ width: `${activeMemory.sync}%` }}
                        ></div>
                        <div className={styles.acProgressMarker}></div>
                      </div>
                      <span className={styles.acLabelSmall}>SYNC</span>
                    </div>
                  </div>

                  {/* Info Sections */}
                  <div className={styles.acSection}>
                    <p className={styles.acSectionTitle}>Location</p>
                    <p className={styles.acSectionData}>{activeMemory.location}</p>
                  </div>

                  <div className={styles.acSection}>
                    <p className={styles.acSectionTitle}>Temporal Coordinates</p>
                    <p className={styles.acSectionData}>{activeMemory.year}</p>
                  </div>

                  <div className={styles.acSection}>
                    <p className={styles.acSectionTitle}>Animus Description</p>
                    <p className={styles.acSectionData}>{activeMemory.desc}</p>
                  </div>
                  
                  {/* Clickable Fallback Button */}
                  <div 
                    className={styles.acCloseButton}
                    onClick={() => setShowDetails(false)}
                  >
                    [ CLOSE DATA STREAM ]
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className={styles.noImage}>
              <p className={styles.altText}>{activeMemory?.alt}</p>
            </div>
          )}
        </div>
      </div>

      {/* Horizontal Animus Dock */}
      <div className={`${styles.memoriesContainer} ${showDetails ? styles.dockHidden : ''}`}>
        <div className={styles.header}>
          <div className={styles.icon}>
            <Image src="/Events/animus.png" alt="Animus" width={24} height={24} className={styles.animusIcon} />
          </div>
          <h2 className={styles.title}>MEMORIES</h2>
        </div>

        <div className={styles.timeline} ref={timelineRef} onScroll={handleScroll}>
          {memories.map((memory, index) => {
            const distanceFromCenter = Math.abs(index - selectedIndex);
            const isVisible = distanceFromCenter <= 1;

            return (
              <div
                key={index}
                className={`${styles.memoryItem} ${index === selectedIndex ? styles.selected : ''}`}
                onClick={() => handleItemClick(index)}
                style={{
                  transform: `scale(${isVisible ? (index === selectedIndex ? 1 : 0.85) : 0.8})`,
                  opacity: isVisible ? (index === selectedIndex ? 1 : 0.4) : 0,
                  pointerEvents: isVisible ? 'auto' : 'none',
                }}
              >
                <div className={styles.yearLabel}>{memory.year}</div>
                <div className={styles.memoryTitle}>{memory.title}</div>
                {index === selectedIndex && (
                  <div className={styles.selectionIndicator}>
                    <div className={styles.dockArrow}>↑</div>
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