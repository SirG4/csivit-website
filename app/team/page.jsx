'use client'
import React, { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import { domains } from '@/data/teamInfo'
import BackButton from '@/components/BackButton/BackButton.jsx'

import { FiUser } from 'react-icons/fi'
import { FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";
import { HiInformationCircle } from "react-icons/hi"
import { RiInstagramFill } from "react-icons/ri";
import { useRouter } from 'next/navigation'


const Page = () => {
  const [selectedDomain, setSelectedDomain] = useState(0);
  const [memberSelected, setMemberSelected] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showSocial,setShowSocial]=useState(false)
  const scrollRef = useRef(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const router=useRouter()


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

    const DEFAULT_IMAGE = '/Team/jeet.png';

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
    <div>
      <div className="min-h-screen relative bg-[url('/Team/TeamBg.png')] bg-no-repeat bg-cover bg-center opacity-100">
      <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70"></div>

        {/* LEFT IMAGE: now dynamic based on selected member */}
        <div className="absolute left-1/2 bottom-0 h-[90vh] transform -translate-x-1/2 pointer-events-none">
          <Image
            // key ensures Next/Image replaces the image node when the source changes
            key={currentMemberImage}
            alt={'The Best Technician Ever'}
            src={currentMemberImage}
            width={420}
            height={840}
            className="h-full w-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.9)] transition-all duration-500 ease-out"
          />
        </div>

        <BackButton />

        {/* Main content */}
        <div className="absolute inset-0 pt-26 px-20 text-white z-10">
          {/* Title */}
          <div className="text-2xl hidden md:block relative z-2 text-center mb-8 font-tungsten-bold w-[200px] md:w-[450px] md:text-[4rem] font-semibold border  bg-cover bg-center px-8 max-w-5xl py-4">
          
            <div className='bg-black/30 inset-0 absolute z-0 '/>
            TEAM
          </div>

          <div className="flex justify-between">
            {/* Left section */}
            <div className="text-center space-y-8 animate-fade-in-left">

              {/* Scrollable row with grab scroll */}
              <div className="relative w-[78%] md:w-[71%]">
                <div
                  ref={scrollRef}
                  className="overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none"
                >
                  <div className="flex gap-3 w-max py-2">
                    {domains.map((item, i) => (
                      <div
                        onClick={() => {
                          setSelectedDomain(i)
                          setMemberSelected(0)
                        }}
                        key={i}
                        className={`md:w-[80px] md:h-[70px] bg-white/40 border-2 backdrop-blur-3xl shadow-lg border-white flex items-center justify-center cursor-pointer transition-all duration-300 ease-out hover:scale-110 hover:bg-white/60 hover:shadow-xl hover:-translate-y-1 ${selectedDomain === i ? 'scale-110 bg-white/60 shadow-xl ring-2 ring-white/50' : ''
                          }`}
                      >
                        <Image
                          src={item.icon}
                          width={50}
                          height={50}
                          alt={item.description}
                          className="transition-transform w-[80px] md:w-[40px] pointer-events-none duration-300 hover:rotate-12 mx-auto"
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
              <div className=" absolute max-w-[270px] text-left left-0 flex flex-col justify-start md:hidden transition-all duration-500 ease-out">
                <h2 className="-mb-3 mr-10 left-0 line-clamp-1 transition-all text-xl duration-300 hover:text-orange-300">
                  {domains[selectedDomain].name}
                </h2>
                <h1 className="font-tungsten-bold mr-10 text-[3rem] transition-all duration-500 ease-out hover:text-orange-300 hover:scale-105 transform">
                  {domains[selectedDomain].members[memberSelected].name}
                </h1>
                <p>
                  {domains[selectedDomain].members[memberSelected].description}
                </p>
              </div>

              {/* Member cards */}
              <div className="hidden mt-10 md:grid grid-cols-3 max-w-[450px] gap-7 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {domains[selectedDomain].members.map((_, i) => (
                  <div
                    onClick={() => setMemberSelected(i)}
                    key={i}
                    className={`bg-white/30 flex justify-center items-center w-[130px] h-[130px] border-2 backdrop-blur-3xl shadow-lg border-white p-2 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:bg-white/50 hover:shadow-xl hover:-translate-y-1 ${memberSelected === i ? 'scale-105 bg-white/50 shadow-xl ring-2 ring-white/50' : ''
                      } animate-fade-in-scale`}
                    style={{ animationDelay: `${1200 + i * 100}ms` }}
                  >
                    <FiUser className='text-3xl transition-all duration-300 hover:scale-125' />
                  </div>
                ))}
              </div>
            </div>

            {/* Right section */}
            <div className="hidden md:block w-[430px] mr-10 animate-fade-in-right">
              <div className="transition-all duration-500 ease-out">
                <div className="-mb-7 text-2xl">
                  {domains[selectedDomain].name}
                </div>
                <div className="font-tungsten-bold text-[6rem]">
                  {domains[selectedDomain].members[memberSelected].name}
                </div>
              </div>

              {/* Social icons */}
              <div className="flex gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                {[
                  { label: "Info", icon: <HiInformationCircle size={40} />, link: "https://example.com/info" },
                  { label: "Github", icon: <FaGithub size={40} />, link: "https://github.com/jeetm" },
                  { label: "Linkedin", icon: <FaLinkedin size={40} />, link: "https://linkedin.com/in/jeetm" },
                  { label: "Instagram", icon: <RiInstagramFill size={40} />, link: "https://instagram.com/jeetm" },
                ].map((item, i) => (
                  <a
                    key={i}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-[70px] space-y-2 group animate-fade-in-scale"
                    style={{ animationDelay: `${1600 + i * 150}ms` }}
                  >
                    <div className="flex items-center justify-center bg-white/30 w-[60px] h-[60px] rounded border-2 backdrop-blur-3xl shadow-lg border-white p-2 transition-all duration-300 group-hover:bg-white/50 group-hover:scale-110 group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <div className="transition-all duration-300 group-hover:scale-95">
                        {item.icon}
                      </div>
                    </div>
                    <p className="inline-block px-3 py-1 bg-white/20 rounded text-center text-sm font-semibold leading-tight transition-all duration-300 group-hover:bg-white/40 group-hover:scale-105">
                      {item.label}
                    </p>
                  </a>
                ))}
              </div>

              <div className="w-full h-1 rounded-4xl bg-white mb-4 transition-all duration-500 hover:h-2 hover:bg-orange-300 animate-fade-in-left" style={{ animationDelay: '2000ms' }} />

              <p className="text-lg animate-fade-in-up" style={{ animationDelay: '2200ms' }}>
                {domains[selectedDomain].members[memberSelected].description}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom position card */}
        <div className='absolute hidden md:flex bottom-5 w-full  items-center justify-center font-tungsten-bold text-white px-4 py-2 text-center animate-fade-in-up' style={{ animationDelay: '2400ms' }}>
          <div className='bg-gradient-to-b from-[#D13844] to-[#FF7777] text-[3rem]  px-12 rounded shadow-2xl drop-shadow-2xl transition-all duration-500 ease-out hover:scale-105 hover:from-[#FF4455] hover:to-[#FF8888] transform hover:-translate-y-1'>
            {domains[selectedDomain].members[memberSelected].position}
          </div>
        </div>

        {/* Floating mobile social button */}
        <div className="fixed md:hidden top-[20%] right-5 z-50">
          <button
            onClick={() => setShowSocial(!showSocial)}
            className="w-14 h-14 rounded-full bg-black/66 shadow-lg flex items-center justify-center text-white text-2xl"
          >
            <HiInformationCircle />
          </button>

          {showSocial && (
            <div className="mt-2 flex flex-col gap-3 bg-white/30 backdrop-blur-xl p-2 rounded-lg shadow-lg animate-fade-in-up">
              {[
                { label: "Info", icon: <HiInformationCircle size={25} />, link: "https://example.com/info" },
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
          className="fixed w-full md:hidden bottom-4 left-1/2 -translate-x-1/2 z-50 grid grid-cols-6 gap-[5px] px-2"
        >
          {domains[selectedDomain].members.map((_, i) => (
            <div
              onClick={() => setMemberSelected(i)}
              key={i}
              className={`bg-white/30 flex justify-center   items-center w-[50px] h-[50px] border-2 backdrop-blur-3xl shadow-lg border-white p-2 cursor-pointer transform transition-all duration-300 ease-out hover:scale-105 hover:bg-white/50 hover:shadow-xl hover:-translate-y-2 hover:rotate-3 ${memberSelected === i ? 'scale-105 bg-white/50 shadow-xl ring-2 ring-white/50' : ''
                } animate-fade-in-scale`}
              style={{ animationDelay: `${1200 + i * 100}ms` }}
            >
              <FiUser className='text-3xl transition-all duration-300 hover:scale-125' />
            </div>
          ))}
        </div>

      </div>
    </div>

  )
}

export default Page
