'use client'

import React from 'react'
import BackButton from '@/components/BackButton/BackButton';
import Image from "next/image";
import EventsScrolling from "@/components/EventsScrolling";
import Lenis from 'lenis'
import { useEffect } from "react";
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ACscroll from "@/components/ACscroll";
import EventsMobile from "@/components/EventsMobile";
import EventsMobile1 from "@/components/EventsMobile1";

gsap.registerPlugin(ScrollTrigger);

const page = () => {
  useEffect(() => {
    // Initialize Lenis only on client side
    if (typeof window === 'undefined') return;
    
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smooth: true,
      direction: 'vertical', // vertical, horizontal
      gestureDirection: 'vertical', // vertical, horizontal, both
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    lenis.on('scroll', (e) => {
      // console.log(e);
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup
    return () => {
      lenis.destroy();
    };
  }, []);

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
      
      {/* Content */}
      <div className="relative z-10">
        <BackButton />
      </div>
      {/* <EventsMobile /> */}
      <EventsMobile1 />
    </div>
  )
}

export default page
