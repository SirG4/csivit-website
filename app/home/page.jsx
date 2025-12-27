'use client'

import Hero from "@/components/HomePage/Hero";
import Lenis from 'lenis'
export default function Home() {

  // Initialize Lenis
const lenis = new Lenis();

// Use requestAnimationFrame to continuously update the scroll
function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);


  return (
    <>
      <div>
        <Hero />
      </div>
    </>
  );
}
