'use client'

import React, { useState, useEffect } from 'react'
import BackButton from '@/components/BackButton/BackButton';
import Image from "next/image";
import EventsScrolling from "@/components/Events/EventsScrolling";
import Lenis from 'lenis'
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ACscroll from "@/components/Events/ACscroll";
import EventsMobile1 from "@/components/Events/EventsMobile1";

gsap.registerPlugin(ScrollTrigger);

const page = () => {
  const [isMobile, setIsMobile] = useState(null);

  // Detect screen size (1000px matches the CSS breakpoint in EventsScrolling.module.css)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1000);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Desktop-only Lenis setup
  useEffect(() => {
    if (isMobile !== false) return;
    if (typeof window === 'undefined') return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smooth: true,
      direction: 'vertical',
      gestureDirection: 'vertical',
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', () => {});

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, [isMobile]);

  // Avoid flash of wrong layout on first render
  if (isMobile === null) return null;

  // Mobile view
  if (isMobile) {
    return (
      <div className="bg-black w-screen h-screen relative overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full z-0">
          <Image
            src="/Events/bg.png"
            alt="Background"
            fill
            className="object-cover opacity-40"
            priority
          />
        </div>
        {/* Back button */}
        <div className="relative z-10">
          <BackButton />
        </div>
        <EventsMobile1 />
      </div>
    );
  }

  // Desktop view
  return (
    <div>
      <BackButton />
      <div className="relative z-20 overflow-x-hidden">
        <EventsScrolling />
      </div>
      <ACscroll />
    </div>
  );
}

export default page
