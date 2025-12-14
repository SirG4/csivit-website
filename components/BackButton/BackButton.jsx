'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import './BackButton.css';

const BackButton = () => {
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setIsAnimating(true);
    // Wait for animation to complete before redirecting
    setTimeout(() => {
      router.push('/');
    }, 0); // Match this duration with CSS animation duration
  };

  return (
    <>
      <button 
        className={`back-button ${isAnimating ? 'animating' : ''}`}
        onClick={handleClick}
        aria-label="Go back to home page"
      >
        <img 
          src="/BackButton.png" 
          alt="Back" 
          className="back-button-icon"
        />
      </button>
    </>
  );
};

export default BackButton;