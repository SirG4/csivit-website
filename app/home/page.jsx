'use client'

import Hero from "@/components/HomePage/Hero";
import Lenis from 'lenis'
import { useEffect } from 'react';

export default function Home() {

  useEffect(() => {
    // Initialize Lenis only on client-side
    const lenis = new Lenis();

    // Use requestAnimationFrame to continuously update the scroll
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup function
    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <>
      <div>
        <Hero />
      </div>
    </>
  );
}
