'use client';

import './BackButton.css';


import { useRouter } from "next/navigation";
import { gsap } from "gsap";

const BackButton = () => {
  const router = useRouter();
  const handleBack = (e) => {
    e.preventDefault();
    const overlay = document.querySelector('.fade-overlay');
    if (overlay) {
      overlay.style.pointerEvents = 'all';
      window.__FADE_TYPE__ = 'back';
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => {
          router.push('/home');
        },
      });
    } else {
      router.push('/home');
    }
  };
  return (
    <>
      <a 
        href="/home"
        className="back-button"
        aria-label="Go back to home page"
        onClick={handleBack}
      >
        <img 
          src="/BackButton.png" 
          alt="Back" 
          className="back-button-icon"
        />
      </a>
    </>
  );
};

export default BackButton;