'use client';

import React, { useState, useEffect } from 'react';
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

export default function RusticPanel() {
  const characters = [
    {
      arrow: "/Devpage/arrow.png",
      name: "Jeet Mane",
      description: "/Devpage/jeet_des.png",
      image: "/Devpage/jeet_mane.png",
      social: {
        github: "https://github.com/jeetmanee",
        linkedin: "https://linkedin.com/in/jeet-mane",
        instagram: "https://linkedin.com/in/jeet-mane"
      }
    },
    {
      arrow: "/Devpage/arrow.png",
      name: "Rohit S.",
      description: "/Devpage/rohit_des.png",
      image: "/Devpage/rohit.png",
      social: {
        github: "https://github.com/SwiftByte6",
        linkedin: "https://www.linkedin.com/in/rohit-soneji-9483a5344",
        instagram: "https://www.linkedin.com/in/rohit-soneji-9483a5344"
      }
    },
    {
      arrow: "/Devpage/arrow.png",
      name: "Jai Chavan",
      description: "/Devpage/jai_des.png",
      image: "/Devpage/jai_chavan.png",
      social: {
        github: "https://github.com/JaiChavan040906",
        linkedin: "http://www.linkedin.com/in/jaichvn",
        instagram: "http://www.linkedin.com/in/jaichvn"
      }
    },
    {
      arrow: "/Devpage/arrow.png",
      name: "Atharva S.",
      description: "/Devpage/jeet_des.png",
      image: "/Devpage/jeet_mane.png",
      social: {
        github: "https://github.com/UnstableBlob",
        linkedin: "https://www.linkedin.com/in/atharva-sheramkar",
        instagram: "https://www.linkedin.com/in/atharva-sheramkar"
      }
    },
    {
      arrow: "/Devpage/arrow.png",
      name: "Maitrey B.",
      description: "/Devpage/jeet_des.png",
      image: "/Devpage/jeet_mane.png",
      social: {
        github: "https://github.com/Maitrey-Bharambe",
        linkedin: "https://www.linkedin.com/in/maitrey-bharambe-677088331/",
        instagram: "https://www.linkedin.com/in/maitrey-bharambe-677088331/"
      }
    },
    {
      arrow: "/Devpage/arrow.png",
      name: "Madhav P.",
      description: "/Devpage/madhav_des.png",
      image: "/Devpage/madhav_palav.png",
      social: {
        github: "https://github.com/SirG4",
        linkedin: "https://linkedin.com/in/madhav-palav",
        instagram: "https://linkedin.com/in/madhav-palav"
      }
    }
  ];

  // store the selected index instead of the whole object
  const [selectedIndex, setSelectedIndex] = useState(0);

  // optional: preload arrow images (unnecessary in most cases, but harmless)
  useEffect(() => {
    characters.forEach(c => {
      const img = new Image();
      img.src = c.arrow;
    });
  }, []); // run once on mount

  const handleClick = (index) => {
    setSelectedIndex(index);
  };

  // derive the selected character for the top panel
  const selectedCharacter = characters[selectedIndex];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Top Section - Character Details */}
      {selectedCharacter && (
        <div className="fixed top-0 left-0 right-0 bottom-0 flex">
          {/* Left Half - Image */}
          <div className="w-1/2 flex items-center justify-center">
            <img
              src={selectedCharacter.image}
              alt={selectedCharacter.name}
              className="max-h-full max-w-full object-contain rounded-lg drop-shadow-[0_0_25px_rgba(255,255,255,0.4)]"
            />
          </div>

          {/* Right Half - Description and Social Icons */}
          <div className="w-1/2 flex flex-col items-center justify-center translate-y-[-90px]">
            {/* Description Image */}
            <img
              src={selectedCharacter.description}
              alt="Image Not Found"
              className="max-h-full max-w-full object-contain mb-8"
            />
            
            {/* Social Media Icons */}
            <div className="flex gap-8 mt-3">
              <a 
                href={selectedCharacter.social.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-gray-500 transition-colors duration-300 transform hover:scale-110"
              >
                <FaGithub size={45} />
              </a>
              <a 
                href={selectedCharacter.social.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-blue-400 transition-colors duration-300 transform hover:scale-110"
              >
                <FaLinkedin size={45} />
              </a>
              {selectedCharacter.social.instagram && (
                <a 
                  href={selectedCharacter.social.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white hover:text-pink-400 transition-colors duration-300 transform hover:scale-110"
                >
                  <FaInstagram size={45} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Panel */}
      <div className="fixed bottom-0 left-0 w-full h-1/4 bg-black/67 flex items-center justify-center z-40">
        <div className="grid grid-cols-3 grid-rows-2 gap-8 w-full max-w-4xl px-8 relative">
          {characters.map((character, index) => {
            const isSelected = index === selectedIndex;

            return (
              <div key={index} className="relative flex items-center justify-center">
                {/* Arrow - Only shown for selected character */}
                {isSelected && (
                  <img
                    src={character.arrow}
                    alt="arrow"
                    className="h-6 w-auto mb-2 z-50 mr-6 brightness-110"
                  />
                )}
                
                <button
                  onClick={() => handleClick(index)}
                  className={`transition-all duration-300 active:scale-95`}
                  aria-pressed={isSelected}
                >
                  <span
                    className={`flex items-center gap-3 text-3xl ${
                      isSelected ? 'text-white scale-110 font-bold' : 'text-white hover:text-white hover:scale-105 font-bold'
                    }`}
                    style={{
                      textShadow: isSelected
                        ? '0 0 10px rgba(255, 255, 255, 0.5), 0 0 20px rgba(255, 255, 255, 0.3)'
                        : 'none',
                      fontFamily: '"Courier New", Courier, monospace',
                      letterSpacing: '1px'
                    }}
                  >
                    <span>{character.name}</span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
