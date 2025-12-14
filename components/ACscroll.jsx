import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ACscroll = () => {
  const canvasRef = useRef(null);
  const frameCount = 120; // Your image count
  const totalLoops = 9; // Number of times to loop the animation
  const totalFrames = frameCount * totalLoops; // Total frames across all loops
  const images = useRef([]);
  const airpods = useRef({ frame: 0 });

  // Helper to get image URL for each frame (using your bg images)
  const currentFrame = index => (
    `/compressedImages/bg${(index + 990).toString()}.png`
  )

  // Preload images
  useEffect(() => {
    console.clear();
    
    images.current = [];
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = currentFrame(i);
      images.current.push(img);
    }
  }, []);

  // Setup canvas and GSAP animation
  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // Set canvas size to match screen dimensions
    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    function render() {
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Calculate which image to show (loop back to start after each cycle)
      const currentImageIndex = Math.floor(airpods.current.frame % frameCount);
      
      if (images.current[currentImageIndex]) {
        // Calculate scaling to fit image to screen while maintaining aspect ratio
        const img = images.current[currentImageIndex];
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY); // Cover the entire screen
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        // Center the image
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;
        
        context.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      }
    }

    // Setup GSAP animation - now animates through total frames (3 loops)
    const animation = gsap.to(airpods.current, {
      frame: totalFrames - 1, // Animate through all 3 loops
      snap: "frame",
      ease: "none",
      scrollTrigger: {
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5
      },
      onUpdate: render // use animation onUpdate instead of scrollTrigger's onUpdate
    });

    // Render the first frame after the first image loads
    images.current[0].onload = render;

    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  return (
    <div className="relative">
      {/* Fixed canvas that covers the full screen */}
      <canvas 
        id="hero-lightpass" 
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none" 
        ref={canvasRef}
      />
      
      {/* Spacer div to create scrollable content height */}
      <div className="h-[0vh] relative z-20">
        
        <div className="h-screen"></div> {/* Last screen height */}
      </div>
    </div>
  );
};

export default ACscroll;
