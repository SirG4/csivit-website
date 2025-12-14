"use client"

import { useEffect } from "react";
import Lenis from "lenis";

export default function LenisClient() {
  useEffect(() => {
    // Initialize Lenis only in the browser
    const lenis = new Lenis();

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      // If Lenis exposes a destroy method in the future, call it here.
      // For now, cancel any running rAFs by letting the component unmount.
    };
  }, []);

  return null;
}
