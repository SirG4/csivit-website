import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useGSAP } from "@gsap/react";
import styles from "./EventsScrolling.module.css";
// import Events from "../Events";
// import Banner from "../Banner";

gsap.registerPlugin(ScrollTrigger);

const EventsScrolling = () => {
  const spotlightRefs = useRef([]);
  spotlightRefs.current = [];

  // 🔹 Refs for cover
  const coverRef = useRef(null);

  // 🔹 Create 20 poster placeholders
  const posterCount = 20;

  // Utility to add refs
  const addToRefs = (el) => {
    if (el && !spotlightRefs.current.includes(el)) {
      spotlightRefs.current.push(el);
    }
  };

  useGSAP(() => {
    // Lenis smooth scroll setup
    const lenis = new Lenis();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Scatter directions for images
    const scatterDirections = [
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: -1, y: 0.0 },
      { x: 1, y: 0.0 },
      { x: 1, y: 0.0 },
    ];

    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const isMobile = screenWidth < 1000;
    // Keep desktop visuals as-is, tune only small screens
    const scatterMultiplier = isMobile ? 1.4 : 0.5;

    // Start + End positions
    const offsetMultiplier = isMobile ? 50 : 100; // Adjust offset amount
    
    const startPositions = scatterDirections.map((dir) => ({
      x: dir.x * offsetMultiplier, // Slight offset based on end direction
      y: 0,
      z: -1000,
      scale: 0,
    }));

    const endPositions = scatterDirections.map((dir) => ({
      x: dir.x * screenWidth * scatterMultiplier*1.5,
      y: dir.y * screenHeight * scatterMultiplier,
      z: 2000,
      scale: 1,
    }));

    // Set initial positions
    spotlightRefs.current.forEach((img, index) => {
      gsap.set(img, startPositions[index]);
    });
    gsap.set(coverRef.current, {
      z: -1000,
      scale: 0,
      x: 0,
      y: 0,
    });

    // ScrollTrigger animation
    ScrollTrigger.create({
      trigger: ".spotlight",
      start: "top top",
      end: `+=${window.innerHeight * (isMobile ? 10 : 15)}px`,
      pin: true,
      scrub: 1,
onUpdate: (self) => {
  const progress = self.progress;

  spotlightRefs.current.forEach((img, index) => { 
    // Pair consecutive placeholders: 0,1 -> 0; 2,3 -> 1; 4,5 -> 2, etc.
    const pairIndex = Math.floor(index / 2);
    const staggerDelay = pairIndex * (isMobile ? 0.04 : 0.2);
    const scaleMultiplier = isMobile ? 2.2 : 2;
    const imageProgress = Math.max(0, (progress - staggerDelay) * (isMobile ? 2 : 2.5)); // Reduced from 3/4 to 2/2.5

    const start = startPositions[index];
    const end = endPositions[index];
    const direction = scatterDirections[index];

    // Calculate opacity - starts at 1, fades to 0 as it moves out
    const opacity = Math.max(0, 2 - imageProgress * 4);

    // Rotation: left posters (x: -1) rotate right (+45deg), right posters (x: 1) rotate left (-45deg)
    const rotationY = direction.x === -1 ? 30 : -30;

    gsap.set(img, {
      z: gsap.utils.interpolate(start.z, end.z, imageProgress),
      scale: gsap.utils.interpolate(start.scale, end.scale, imageProgress * scaleMultiplier),
      x: gsap.utils.interpolate(start.x, end.x, imageProgress),
      y: gsap.utils.interpolate(start.y, end.y, imageProgress),
      rotationY: rotationY,
      opacity: opacity,
    });
  });

  // Cover image - also reduce speed
  const coverProgress = Math.max(0, (progress - (isMobile ? 0.6 : 0.7)) * (isMobile ? 2 : 2.5)); // Reduced from 3/4 to 2/2.5
  gsap.set(coverRef.current, {
    z: -1000 + 2000 * coverProgress,
    scale: Math.min(1, coverProgress * 2),
    x: 0,
    y: 0,
  });
}



    });
  }, []);

  return (
    <div style={{ overflowX: 'hidden', width: '100vw' }}>
      {/* <section className={styles.intro}>
        <h1 className={styles.heading}>Vision That Move Beyond The Surface</h1>
      </section> */}

      <section className={`${styles.spotlight} spotlight`}>
        <div className={`${styles["spotlight-images"]}`}>
          {Array.from({ length: posterCount }, (_, index) => {
            const isEven = index % 2 === 0;
            const pairNumber = Math.floor(index / 2) + 1;
            
            return (
              <div
                key={index}
                ref={addToRefs}
                className={`${styles.posterPlaceholder} ${
                  isEven ? styles.posterImage : styles.posterDetails
                }`}
              >
                {isEven ? (
                  // Poster image side
                  <div className={styles.posterImageContent}>
                    <img 
                      src={`/Team/Icons/poster${pairNumber}.jpg`} 
                      alt={`Event ${pairNumber}`}
                      className={styles.posterImg}
                    />
                  </div>
                ) : (
                  // Details side
                  <div className={styles.posterDetailsContent}>
                    <h3 className={styles.eventTitle}>Event {pairNumber}</h3>
                    <p className={styles.eventDate}>Date: TBA</p>
                    <p className={styles.eventVenue}>Venue: CSI Hall</p>
                    <p className={styles.eventDesc}>Join us for an exciting gaming event!</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>


      </section>


    </div>
  );
};

export default EventsScrolling;
