'use client'

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Bgscroll() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const airpodsRef = useRef({ frame: 0 });
  const [containerHeight, setContainerHeight] = useState(5000);

  useEffect(() => {
    // Function to update container height based on document body
    const updateContainerHeight = () => {
      if (containerRef.current) {
        const documentHeight = document.documentElement.scrollHeight;
        setContainerHeight(documentHeight);
      }
    };

    // Initial height setup
    updateContainerHeight();

    // Update height when content changes
    const observer = new MutationObserver(updateContainerHeight);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true
    });

    // Update on window resize
    window.addEventListener('resize', updateContainerHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateContainerHeight);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    
    // Set canvas size to match window dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const frameCount = 121; // Total number of images (bg990.png to bg1110.png)
    const currentFrame = index => (
      `/compressedImages/bg${990 + index}.png`
    );

    const images = [];
    const airpods = airpodsRef.current;

    // Preload images
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.push(img);
    }
    imagesRef.current = images;

    // Render function with proper scaling
    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      const img = images[airpods.frame];
      if (!img.complete) return;
      
      // Calculate scaling to cover the canvas while maintaining aspect ratio
      const canvasAspect = canvas.width / canvas.height;
      const imgAspect = img.width / img.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (canvasAspect > imgAspect) {
        // Canvas is wider than image
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Canvas is taller than image
        drawHeight = canvas.height;
        drawWidth = canvas.height * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Wait for first image to load
    images[0].onload = render;

    // GSAP ScrollTrigger animation with looping
    const animation = gsap.to(airpods, {
      frame: frameCount - 1,
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => {
          // Calculate how many complete loops we've done
          const progress = self.progress;
          const loops = Math.floor(progress * (containerHeight / 3000)); // Adjust loop frequency
          const loopProgress = (progress * (containerHeight / 3000)) % 1;
          
          // Map loop progress to frame
          airpods.frame = Math.floor(loopProgress * (frameCount - 1));
          render();
        }
      }
    });

    // Cleanup
    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      window.removeEventListener('resize', updateCanvasSize);
    };
  }, [containerHeight]);

  return (
    <div ref={containerRef} className="relative w-full" style={{ minHeight: '100vh' }}>
      <canvas
        ref={canvasRef}
        id="hero-lightpass"
        className="fixed inset-0 w-screen h-screen"
      />
    </div>
  );
}
