import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useGSAP } from "@gsap/react";
import { ChevronsDown } from "lucide-react";
import styles from "./EventsScrolling.module.css";

// import Events from "../Events";
// import Banner from "../Banner";

gsap.registerPlugin(ScrollTrigger);

// Event Details Map - Only for UPCOMING events
// Events are displayed in reverse order: 6, 5, 4, 3, 2, 1
// Currently: Events 6 & 5 are UPCOMING (show details), Events 4, 3, 2, 1 are PAST (show collage)
// Add your upcoming event information here:
const eventDetails = {
  6: {
    title: "Design Paradox",
    date: "20th March",
    venue: "VIT Mumbai - Details TBA",
    description:
      "CSI-VIT Enthusia presents Design Paradox, a two-round UI and Product Design challenge where teams craft a landing page concept for a fictional energy drink launched by an unexpected legacy brand. Bring bold brand thinking, UX clarity, and visual storytelling to build a launch experience that feels fresh and convincing.",
    sync: 84,
    registrationLink:
      "https://unstop.com/competitions/design-paradox-ui-product-design-challenge-vidyalankar-institute-of-technology-vit-mumbai-1657879",
    registrationInfo:
      "Team-based event. Registration details will be announced soon. Stay tuned on our socials for the registration link and round-wise instructions.",
  },
  5: {
    title: "Bug Auction",
    date: "12th March",
    venue: "VIT Mumbai — Details TBA",
    description: "CSI-VIT Enthusia presents Bug Auction — \"Gotta patch 'em all!\" Hunt bugs, bid your way to the top, and claim your reward. Stay tuned for venue and timing details.",
    sync: 78,
    registrationLink: "/profile",
    registrationInfo: "Team-based event. Registration details will be announced soon. Stay tuned on our socials for the registration link and further instructions.",
  },
  4: {
    title: "Event 4",
    date: "TBA",
    venue: "CSI Hall",
    description: "More details coming soon.",
    sync: 50,
    registrationInfo: "Registration details coming soon.",
  },
  // Events 4, 3, 2, 1 are past events and will show photo collages instead
};

const EventsScrolling = () => {
  const spotlightRefs = useRef([]);
  spotlightRefs.current = [];
  const lenisRef = useRef(null);
  const scrollTriggerRef = useRef(null);
  const [currentPosterIndex, setCurrentPosterIndex] = useState(0);

  // 🔹 Refs for cover
  const coverRef = useRef(null);

  // 🔹 Create poster placeholders (2 placeholders per event)
  const posterCount = 12;
  
  // 🔹 Define event types: 'upcoming' or 'past'
  // Change i < N to mark the first N pairs as upcoming (0 = all past)
  const eventTypes = Array.from({ length: posterCount / 2 }, (_, i) => 
    i < 2 ? 'upcoming' : 'past'
  );

  // Utility to add refs
  const addToRefs = (el) => {
    if (el && !spotlightRefs.current.includes(el)) {
      spotlightRefs.current.push(el);
    }
  };

  useGSAP(() => {
    // Lenis smooth scroll setup
    const lenis = new Lenis();
    lenisRef.current = lenis;
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
    const scatterMultiplier = isMobile ? 0.5 : 0.5;

    // Start + End positions
    const offsetMultiplier = isMobile ? 20 : 100; // Adjust offset amount
    
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
    const st = ScrollTrigger.create({
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
    const staggerDelay = pairIndex * (isMobile ? 0.12 : 0.16);
    const scaleMultiplier = isMobile ? 1.5 : 2;
    const imageProgress = Math.max(0, (progress - staggerDelay) * (isMobile ? 3 : 2.5)); // Increased mobile speed

    const start = startPositions[index];
    const end = endPositions[index];
    const direction = scatterDirections[index];

    // Calculate opacity - starts at 1, fades to 0 as it moves out
    const opacity = Math.max(0, 2 - imageProgress * 3);

    // Rotation: left posters (x: -1) rotate right (+45deg), right posters (x: 1) rotate left (-45deg)
    const rotationY = direction.x === -1 ? 30 : -30;

    // Calculate current scale
    const currentScale = gsap.utils.interpolate(start.scale, end.scale, imageProgress * scaleMultiplier);

    gsap.set(img, {
      z: gsap.utils.interpolate(start.z, end.z, imageProgress),
      scale: currentScale,
      x: gsap.utils.interpolate(start.x, end.x, imageProgress),
      y: gsap.utils.interpolate(start.y, end.y, imageProgress),
      rotationY: rotationY,
      opacity: opacity,
    });

    // Update collage images' translateZ based on parent scale
    const collageImages = img.querySelectorAll(`.${styles.collageImage}`);
    const baseZValues = [0, 0, 0, 0];
    collageImages.forEach((collageImg, collageIndex) => {
      const scaledZ = baseZValues[collageIndex] * currentScale;
      gsap.set(collageImg, {
        z: scaledZ,
      });
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
    scrollTriggerRef.current = st;
  }, []);

  // Navigation functions for mobile buttons
  const handleNext = () => {
    if (!lenisRef.current || !scrollTriggerRef.current) return;
    
    const maxIndex = (posterCount / 2) - 1;
    if (currentPosterIndex >= maxIndex) return;
    
    const st = scrollTriggerRef.current;
    const isMobile = window.innerWidth < 1000;
    
    // Animation stagger for each poster pair
    const animationStagger = isMobile ? 0.12 : 0.16;
    const progressMultiplier = isMobile ? 3 : 2.5;
    
    // Offset within each stagger to reach optimal viewing (imageProgress ~0.333)
    const optimalOffset = 0.333 / progressMultiplier;
    
    // Get the total scroll distance of the ScrollTrigger
    const scrollRange = st.end - st.start;
    
    // Calculate exact scroll position for next poster at optimal viewing
    const nextPosterIndex = currentPosterIndex + 1;
    const targetProgress = (nextPosterIndex * animationStagger) + optimalOffset;
    const targetScroll = st.start + (scrollRange * targetProgress);
    
    lenisRef.current.scrollTo(targetScroll, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    
    setCurrentPosterIndex(nextPosterIndex);
  };

  const handlePrevious = () => {
    if (!lenisRef.current || !scrollTriggerRef.current) return;
    
    if (currentPosterIndex <= 0) return;
    
    const st = scrollTriggerRef.current;
    const isMobile = window.innerWidth < 1000;
    
    // Animation stagger for each poster pair
    const animationStagger = isMobile ? 0.12 : 0.16;
    const progressMultiplier = isMobile ? 3 : 2.5;
    
    // Offset within each stagger to reach optimal viewing (imageProgress ~0.333)
    const optimalOffset = 0.333 / progressMultiplier;
    
    // Get the total scroll distance of the ScrollTrigger
    const scrollRange = st.end - st.start;
    
    // Calculate exact scroll position for previous poster at optimal viewing
    const prevPosterIndex = currentPosterIndex - 1;
    const targetProgress = (prevPosterIndex * animationStagger) + optimalOffset;
    const targetScroll = st.start + (scrollRange * targetProgress);
    
    lenisRef.current.scrollTo(targetScroll, {
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    
    setCurrentPosterIndex(prevPosterIndex);
  };

  return (
    <div style={{ overflowX: 'hidden', width: '100vw' }}>

      <section className={`${styles.spotlight} spotlight`}>
        <div className={`${styles["spotlight-images"]}`}
        >
          {Array.from({ length: posterCount }, (_, index) => {
            const isEven = index % 2 === 0;
            const pairNumber = (posterCount / 2) - Math.floor(index / 2);
            const pairIndex = Math.floor(index / 2);
            const eventType = eventTypes[pairIndex];
            
            return (
              <div
                key={index}
                ref={addToRefs}
                className={`${styles.posterPlaceholder} ${
                  isEven ? styles.posterImage : (eventType === 'upcoming' ? styles.posterDetails : styles.posterCollage)
                }`}
              >
                {isEven ? (
                  // Poster image side
                  <div className={styles.posterImageContent}>
                    <img 
                      src={`/Events/poster${pairNumber}.jpeg`} 
                      alt={`Event ${pairNumber}`}
                      className={styles.posterImg}
                    />
                  </div>
                ) : eventType === 'upcoming' ? (
                  // Details side for upcoming events — AC theme
                  <div className={styles.posterDetailsContent}>
                    <div className={styles.acHeaderContainer}>
                      <div className={styles.acHeaderSmall}>DATA FRAGMENT</div>
                      <div className={styles.acHeaderLarge}>{eventDetails[pairNumber]?.title || `Event ${pairNumber}`}</div>
                    </div>

                    <div className={styles.acContentBox}>
                      {/* Sync Bar */}
                      <div className={styles.acSection}>
                        <div className={styles.acFlexRow}>
                          <span className={styles.acLabelDark}>{eventDetails[pairNumber]?.sync ?? 0}%</span>
                          <div className={styles.acProgressBar}>
                            <div
                              className={styles.acProgressFill}
                              style={{ width: `${eventDetails[pairNumber]?.sync ?? 0}%` }}
                            />
                            <div className={styles.acProgressMarker} />
                          </div>
                          <span className={styles.acLabelSmall}>SYNC</span>
                        </div>
                      </div>

                      {/* Location */}
                      <div className={styles.acSection}>
                        <p className={styles.acSectionTitle}>Location</p>
                        <p className={styles.acSectionData}>{eventDetails[pairNumber]?.venue || "TBA"}</p>
                      </div>

                      {/* Date */}
                      <div className={styles.acSection}>
                        <p className={styles.acSectionTitle}>Temporal Coordinates</p>
                        <p className={styles.acSectionData}>{eventDetails[pairNumber]?.date || "TBA"}</p>
                      </div>

                      {/* Description */}
                      <div className={styles.acSection}>
                        <p className={styles.acSectionTitle}>Animus Description</p>
                        <p className={styles.acSectionData}>{eventDetails[pairNumber]?.description || "More details coming soon."}</p>
                      </div>

                      {/* Register Button */}
                      <button
                        className={styles.acRegisterButton}
                        onClick={() => {
                          const registrationLink = eventDetails[pairNumber]?.registrationLink || "/profile";
                          window.location.href = registrationLink;
                        }}
                      >
                        [ REGISTER ]
                      </button>
                    </div>
                  </div>
                ) : (
                  // Image collage for past events
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <div style={{ position: 'relative', width: '80%', height: '80%' }}>
                      {[
                        { n: 1, style: { top: '10%', left: '10%', width: '80%',  height: '100%', zIndex: 2 } },
                        { n: 2, style: { top: '0%',  left: '80%', width: '100%', height: '50%',  zIndex: 3 } },
                        { n: 3, style: { top: '80%', left: '5%',  width: '100%', height: '50%',  zIndex: 3 } },
                        { n: 4, style: { top: '55%', left: '95%', width: '80%',  height: '50%',  zIndex: 2 } },
                      ].map(({ n, style }) => (
                        <div
                          key={n}
                          className="border-8 border-white"
                          style={{
                            transform: 'translateZ(0px)',
                            position: 'absolute',
                            boxShadow: '-10px 10px 30px rgba(0, 0, 0, 0.6)',
                            overflow: 'hidden',
                            background: '#111',
                            ...style,
                          }}
                        >
                          <img
                            src={`/Events/collage${pairNumber}-${n}.jpg`}
                            alt={`Event ${pairNumber} - Photo ${n}`}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          <div style={{
                            display: 'none',
                            position: 'absolute',
                            inset: 0,
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#555',
                            fontSize: '11px',
                            letterSpacing: '0.2em',
                            fontFamily: 'monospace',
                          }}>
                            COMING SOON
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>


        {/* Desktop Scroll Hint */}
        <div className={styles.scrollHint} aria-hidden="true">
          <span className={styles.scrollHintLabel}>SCROLL</span>
          <ChevronsDown className={styles.scrollHintIcon} size={28} strokeWidth={1.5} />
        </div>

        {/* Mobile Navigation Buttons
        <div className={styles.mobileNav}>
          <button 
            className={styles.navButton}
            onClick={handlePrevious}
            disabled={currentPosterIndex === 0}
            aria-label="Previous poster"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button 
            className={styles.navButton}
            onClick={handleNext}
            disabled={currentPosterIndex === (posterCount / 2) - 1}
            aria-label="Next poster"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div> */}

      </section>


    </div>
  );
};

export default EventsScrolling;
