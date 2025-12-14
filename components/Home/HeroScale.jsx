// Add this at the top of the file
"use client";

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

const HeroScaleToFrame = () => {
  const triggerRef = useRef(null);
  const heroRef = useRef(null);
  const heroImageRef = useRef(null);
  const heroTextRef = useRef(null);
  const finalFrameRef = useRef(null); // The small, visible frame

  useEffect(() => {
    const heroImage = heroImageRef.current;
    const finalFrame = finalFrameRef.current;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: triggerRef.current, // The trigger is the container for both sections
        start: 'top top',
        end: '+=1500', // Animate over 1500px of scroll
        scrub: 1,
        pin: true, // Pin the container
        markers: true, // Remove in production
      },
    });

    // 1. Fade out the hero text
    tl.to(heroTextRef.current, {
      opacity: 0,
      ease: 'power1.in',
    }, 0); // Start at the beginning of the timeline

    // 2. Animate the hero image to scale and move into the final frame
    tl.to(heroImage, {
      // Get dimensions and position from the visible frame
      width: finalFrame.offsetWidth,
      height: finalFrame.offsetHeight,
      x: finalFrame.getBoundingClientRect().left - heroImage.getBoundingClientRect().left,
      y: finalFrame.getBoundingClientRect().top - heroImage.getBoundingClientRect().top,
      ease: 'power2.inOut',
    }, 0); // Start at the same time

    // 3. Fade out the black background of the hero section to reveal the section underneath
    tl.to(heroRef.current, {
      backgroundColor: 'transparent', // Animate the background color to be see-through
      ease: 'power1.inOut',
    }, 0); // Start at the same time

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    // The main container that will be pinned and provides the scrollable height
    <div ref={triggerRef} className="relative h-[200vh]">
      <div className="sticky top-0 h-screen w-full">
        {/* SECTION 2: The Destination (Visible underneath) */}
        <div className="absolute inset-0 flex flex-col justify-center items-center bg-gray-100 text-zinc-800">
          <h2 className="text-3xl font-bold mb-8">Agent Profile</h2>
          {/* This is the visible frame the image will shrink into */}
          <div
            ref={finalFrameRef}
            className="w-[30vw] h-[40vh] bg-zinc-300 rounded-lg border-4 border-zinc-400 shadow-2xl"
          >
            {/* The frame is empty, acting as a target */}
          </div>
        </div>

        {/* SECTION 1: The Hero (Layered on top) */}
        <div
          ref={heroRef}
          className="absolute inset-0 z-10 flex flex-col justify-center items-center bg-zinc-900"
        >
          {/* The image that will scale down */}
          <div ref={heroImageRef} className="w-screen h-screen">
            <Image
              src="/Home/Aboutus/anime.png" // Place image in /public folder
              alt="Hero Image"
              layout="fill"
              objectFit="cover"
              priority
            />
          </div>
          {/* The text on top of the hero */}
          <div
            ref={heroTextRef}
            className="absolute text-white text-center"
          >
            <h1 className="text-8xl font-extrabold">SCALE DOWN</h1>
            <p className="text-2xl mt-2">Scroll to reveal what's underneath.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroScaleToFrame;