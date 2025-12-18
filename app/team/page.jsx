'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { domains } from '@/data/teamInfo'
import BackButton from '@/components/BackButton/BackButton.jsx'

import { FiUser } from 'react-icons/fi'
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { HiLink, HiInformationCircle } from "react-icons/hi"
import { RiInstagramFill } from "react-icons/ri";
import { useRouter } from 'next/navigation'


const Page = () => {
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [memberSelected, setMemberSelected] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSocial, setShowSocial] = useState(false)
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const router = useRouter()

  const [screen, setScreen] = useState('mobile');

  useEffect(() => {
    const updateScreen = () => {
      // Use visualViewport for zoom-aware width detection
      const width = window.visualViewport?.width || window.innerWidth;
      if (width >= 1280) {
        setScreen('desk');
      } else if (width >= 1024) {
        setScreen('lap');
      } else if (width >= 768) {
        setScreen('tablet');
      } else {
        setScreen('mobile');
      }
    };

    updateScreen(); // initial check

    window.addEventListener('resize', updateScreen);
    window.visualViewport?.addEventListener('resize', updateScreen);

    return () => {
      window.removeEventListener('resize', updateScreen);
      window.visualViewport?.removeEventListener('resize', updateScreen);
    };
  }, []);


  // Handle scroll progress
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
      const progress = (scrollContainer.scrollLeft / maxScroll) * 100;
      setScrollProgress(progress);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  // Drag to scroll (grab behavior)
  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const handleMouseDown = (e) => {
      isDown.current = true;
      slider.classList.add('cursor-grabbing');
      startX.current = e.pageX - slider.offsetLeft;
      scrollLeft.current = slider.scrollLeft;
    };

    const handleMouseLeave = () => {
      isDown.current = false;
      slider.classList.remove('cursor-grabbing');
    };

    const handleMouseUp = () => {
      isDown.current = false;
      slider.classList.remove('cursor-grabbing');
    };

    const handleMouseMove = (e) => {
      if (!isDown.current) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX.current) * 1.5; // scroll speed
      slider.scrollLeft = scrollLeft.current - walk;
    };

    slider.addEventListener('mousedown', handleMouseDown);
    slider.addEventListener('mouseleave', handleMouseLeave);
    slider.addEventListener('mouseup', handleMouseUp);
    slider.addEventListener('mousemove', handleMouseMove);

    // mobile touch support
    let touchStartX = 0;
    slider.addEventListener('touchstart', (e) => (touchStartX = e.touches[0].pageX));
    slider.addEventListener('touchmove', (e) => {
      const touchMoveX = e.touches[0].pageX;
      slider.scrollLeft -= (touchMoveX - touchStartX) * 1.2;
      touchStartX = touchMoveX;
    });

    return () => {
      slider.removeEventListener('mousedown', handleMouseDown);
      slider.removeEventListener('mouseleave', handleMouseLeave);
      slider.removeEventListener('mouseup', handleMouseUp);
      slider.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // --- NEW: compute the current member image path (fallback if not present) ---
  const currentMemberImage =
    domains?.[selectedDomain]?.members?.[memberSelected]?.image;

  return (
    <div className="relative w-screen h-screen overflow-hidden lg:overflow-visible">
      <div className="h-screen relative bg-[url('/Team/TeamBg.png')] bg-no-repeat bg-cover bg-center opacity-100 w-screen overflow-hidden">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>

        {/* LEFT IMAGE: now dynamic based on selected member */}
        <div className="absolute bottom-0 w-auto right-0 lg:right-auto lg:left-1/2 h-[70vh] lg:h-[90vh] lg:transform lg:-translate-x-1/2 pointer-events-none flex justify-end lg:justify-center">
          <Image
            // key ensures Next/Image replaces the image node when the source changes
            key={currentMemberImage}
            alt={'The Best Technician Ever'}
            src={'/Team/jeetu.png'}
            width={420}
            height={840}
            className="h-full w-auto object-contain -translate-x-18 lg:-translate-x-4 drop-shadow-[0_35px_35px_rgba(0,0,0,0.9)] transition-all duration-500 ease-out"
          />
        </div>

        <BackButton />

        {/* Main content */}
        <div className="absolute inset-0 pt-[22%] lg:pt-[clamp(4rem,10vh,6.5rem)] px-2 lg:px-[clamp(2rem,5vw,5rem)] text-white z-10">
          {/* Title */}
          <div className="text-[clamp(2rem,3.5vw,4rem)] hidden lg:block relative z-2 text-center mb-[clamp(0.75rem,2vh,2rem)]  mt-[clamp(0.75rem,4vh,2rem)] font-tungsten-bold w-[clamp(180px,25vw,450px)] border font-semibold bg-cover bg-center px-[clamp(1rem,2vw,2rem)] py-[clamp(0.5rem,1vh,1rem)]">
            <div className='bg-black/30 inset-0 absolute z-0 ' />
            TEAM
          </div>

          <div className="flex justify-between">
            {/* Left section */}
            <div className="text-center py-7 space-y-8 animate-fade-in-left">

              {/* Scrollable row with grab scroll */}
              <div className="relative w-[clamp(220px,25vw,500px)]">
                <div
                  ref={scrollRef}
                  className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
                >
                  <div className="flex gap-[clamp(0.4rem,0.8vw,0.75rem)] pl-[clamp(0,0.5vw,0.75rem)] w-max py-2">
                    {domains.map((item, i) => (
                      <div
                        onClick={() => {
                          setSelectedDomain(i)
                          setMemberSelected(0)
                        }}
                        key={i}
                        className={`w-[clamp(50px,4vw,80px)] h-[clamp(45px,4.5vw,70px)] bg-white/40 border-2 backdrop-blur-3xl shadow-lg border-white flex items-center justify-center cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:bg-white/60 hover:shadow-xl hover:-translate-y-1 ${selectedDomain === i ? 'scale-105 bg-white/55 shadow-xl ring-2 ring-white/50' : ''
                          }`}
                      >
                        <Image
                          src={item.icon}
                          width={50}
                          height={50}
                          alt={item.description}
                          className="transition-transform border border-white w-[clamp(28px,3vw,40px)] pointer-events-none duration-300 hover:rotate-12 mx-auto"
                        />
                      </div>
                    ))}
                  </div>
                </div>


                {/* Progress Bar */}
                <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[100%] h-[5px] bg-[#2f2f2f]/80 rounded-full overflow-hidden shadow-md">
                  <div
                    className="h-full bg-white transition-all duration-200 ease-out"
                    style={{ width: `${scrollProgress}%` }}
                  />
                </div>

              </div>
              {/*Mobile side section*/}
              <div className="absolute -mr-50 px-15  right-0  lg:mr-0 lg:left-0 lg:right-auto -z-10 lg:z-0 max-w-[270px] text-right lg:text-left flex flex-col items-end lg:items-start justify-start lg:hidden transition-all duration-500 ease-out">
                <h2 className="-mb-3 mr-0 line-clamp-1 transition-all text-base lg:text-xl duration-300 hover:text-orange-300">
                  {domains[selectedDomain].name}
                </h2>
                <h1 className="font-tungsten-bold text-[3rem] transition-all duration-500 ease-out hover:text-orange-300 hover:scale-105 transform">
                  {domains[selectedDomain].members[memberSelected].name}
                </h1>
                <p className="z-0 text-sm lg:text-xl max-w-[180px] md:block">
                  {domains[selectedDomain].members[memberSelected].description}
                </p>
              </div>

   {/* Member cards */}
<div
  className="
    hidden lg:grid
    grid-cols-3
    gap-[clamp(0.75rem,1.5vw,1rem)]
    mt-[clamp(1.5rem,4vh,3rem)]
    max-w-[clamp(280px,32vw,380px)]
  "
>
  {domains[selectedDomain].members.map((_, i) => (
    <div
      key={i}
      onClick={() => setMemberSelected(i)}
      className={`
        flex items-center justify-center
        w-[clamp(75px,7vw,110px)]
        h-[clamp(75px,7vw,110px)]
        bg-white/30 border-2 border-white
        backdrop-blur-3xl shadow-lg
        cursor-pointer transition-all  ease-out
        hover:scale-105 hover:bg-white/50 hover:-translate-y-1
        ${memberSelected === i ? 'scale-105 bg-white/50 ring-2 ring-white/50' : ''}
        animate-fade-in-scale
      `}
      style={{ animationDelay: `${2 + i * 1}ms` }}
    >
      <Image
        src="/Team/jeetu.png"
        alt="Team Member"
        width={120}
        height={160}
        className="
          h-full w-auto
          object-contain
          drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]
        "
      />
    </div>
  ))}
</div>

            </div>

            {/* Right section */}
            <div className="hidden lg:block w-[clamp(300px,25vw,450px)] mr-[clamp(0.5rem,1.5vw,1rem)] animate-fade-in-right">
              <div className="transition-all duration-500 ease-out">
                <div className="-mb-[clamp(0.75rem,1.2vw,1.5rem)] text-[clamp(1.1rem,1.8vw,1.6rem)]">
                  {domains[selectedDomain].name}
                </div>
                <div className="font-tungsten-bold text-[clamp(2.8rem,5vw,5.5rem)]">
                  {domains[selectedDomain].members[memberSelected].name}
                </div>
              </div>

              {/* Social icons */}
              <div className="flex gap-[clamp(0.5rem,1.5vw,1rem)] mb-[clamp(0.75rem,2vh,2rem)] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {[
                  { label: "Info", icon: <HiInformationCircle className="w-[clamp(22px,2.5vw,40px)] h-[clamp(22px,2.5vw,40px)]" />, link: "https://example.com/info" },
                  { label: "Github", icon: <FaGithub className="w-[clamp(22px,2.5vw,40px)] h-[clamp(22px,2.5vw,40px)]" />, link: "https://github.com/jeetm" },
                  { label: "Linkedin", icon: <FaLinkedin className="w-[clamp(22px,2.5vw,40px)] h-[clamp(22px,2.5vw,40px)]" />, link: "https://linkedin.com/in/jeetm" },
                  { label: "Instagram", icon: <RiInstagramFill className="w-[clamp(22px,2.5vw,40px)] h-[clamp(22px,2.5vw,40px)]" />, link: "https://instagram.com/jeetm" },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[clamp(50px,4.5vw,70px)] space-y-2 group animate-fade-in-scale"
                    style={{ animationDelay: `${1600 + i * 150}ms` }}
                  >
                    <div className="flex items-center justify-center bg-white/30 w-[clamp(40px,4vw,60px)] h-[clamp(40px,4vw,60px)] rounded border-2 backdrop-blur-3xl shadow-lg border-white p-2 transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <div className="transition-all duration-300 group-hover:scale-95">
                        {item.icon}
                      </div>
                    </div>
                    <p className="inline-block px-[clamp(0.4rem,0.6vw,0.75rem)] py-1 bg-white/20 rounded text-center text-[clamp(0.6rem,0.85vw,0.875rem)] font-semibold leading-tight transition-all duration-300 group-hover:bg-white/40 group-hover:scale-105">
                      {item.label}
                    </p>
                  </a>
                ))}
              </div>

              <div className="w-full h-1 rounded-4xl bg-white mb-[clamp(0.5rem,1vh,1rem)] transition-all duration-500 hover:h-2 hover:bg-orange-300 animate-fade-in-left" style={{ animationDelay: '2000ms' }} />

              <p className="text-[clamp(0.85rem,1.1vw,1.125rem)] animate-fade-in-up" style={{ animationDelay: '2200ms' }}>
                {domains[selectedDomain].members[memberSelected].description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom position card */}
        <div className='absolute hidden lg:flex bottom-[clamp(0.5rem,2vh,1.25rem)] w-full items-center justify-center font-tungsten-bold text-white px-4 py-2 text-center animate-fade-in-up' style={{ animationDelay: '2400ms' }}>
          <div className='bg-gradient-to-b from-[#D13844] to-[#FF7777] text-[clamp(1.5rem,3.5vw,3rem)] px-[clamp(2rem,4vw,3rem)] rounded shadow-2xl drop-shadow-2xl transition-all duration-500 ease-out hover:scale-105 hover:from-[#FF4455] hover:to-[#FF8888] transform hover:-translate-y-1'>
            {domains[selectedDomain].members[memberSelected].position}
          </div>
        </div>

        {/* Floating mobile social button */}
        <div className="fixed lg:hidden top-[3%] right-7 z-50">
          <button
            onClick={() => setShowSocial(!showSocial)}
            className="w-14 h-14 rounded-full bg-black/66 shadow-lg flex items-center justify-center text-white text-2xl"
          >
            <HiLink />
          </button>

          {showSocial && (
            <div className="mt-2 flex flex-col gap-3 bg-white/30 backdrop-blur-xl p-2 rounded-lg shadow-lg animate-fade-in-up">
              {[
                { label: "GitHub", icon: <FaGithub size={25} />, link: "https://github.com/jeetm" },
                { label: "LinkedIn", icon: <FaLinkedin size={25} />, link: "https://linkedin.com/in/jeetm" },
                { label: "Instagram", icon: <FaInstagram size={25} />, link: "https://instagram.com/jeetm" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-white justify-center w-12 h-12 rounded-full bg-white/30 hover:bg-white/50 transition-all duration-300"
                >
                  {item.icon}
                </a>
              ))}
            </div>
          )}
        </div>

        <div
          className="fixed lg:hidden bottom-0 right-0 z-50 h-[230px] overflow-y-auto no-scrollbar cursor-grab active:cursor-grabbing select-none px-2"
          ref={(el) => {
            if (!el) return;
            let isDownY = false;
            let startY = 0;
            let scrollTopStart = 0;
            
            el.onmousedown = (e) => {
              isDownY = true;
              el.classList.add('cursor-grabbing');
              startY = e.pageY - el.offsetTop;
              scrollTopStart = el.scrollTop;
            };
            el.onmouseleave = () => {
              isDownY = false;
              el.classList.remove('cursor-grabbing');
            };
            el.onmouseup = () => {
              isDownY = false;
              el.classList.remove('cursor-grabbing');
            };
            el.onmousemove = (e) => {
              if (!isDownY) return;
              e.preventDefault();
              const y = e.pageY - el.offsetTop;
              const walk = (y - startY) * 1.5;
              el.scrollTop = scrollTopStart - walk;
            };
            // Touch support
            let touchStartY = 0;
            el.ontouchstart = (e) => (touchStartY = e.touches[0].pageY);
            el.ontouchmove = (e) => {
              const touchMoveY = e.touches[0].pageY;
              el.scrollTop -= (touchMoveY - touchStartY) * 1.2;
              touchStartY = touchMoveY;
            };
          }}
        >
          <div className="flex flex-col gap-[10px]">
            {domains[selectedDomain].members.map((_, i) => (
              <div
                onClick={() => setMemberSelected(i)}
                key={i}
                className={`bg-white/30 flex justify-center items-center w-[60px] h-[60px] flex-shrink-0 border-2 backdrop-blur-3xl shadow-lg border-white cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:bg-white/50 hover:shadow-xl ${memberSelected === i ? 'scale-105 bg-white/50 shadow-xl ring-2 ring-white/50' : ''
                  } animate-fade-in-scale`}
                style={{ animationDelay: `${1200 + i * 100}ms` }}
              >
                <Image
                  key={i}
                  alt={'Team Member'}
                  src={'/Team/jeetu.png'}
                  width={420}
                  height={840}
                  className="h-full w-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.9)] transition-all duration-500 ease-out"
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>

  )
}

export default Page
