'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Footer from "../../components/footer.jsx";

import team from "@/public/HomePage/valo_team 1.png";
import events from "@/public/HomePage/assassins_events 1.png";
import prof from "@/public/HomePage/minecraft_profile 1.png";
import dev from "@/public/HomePage/roadrash_developers 1.png";
import gta from "@/public/HomePage/xbox.jpg";
import hbg from "@/public/Home/Hero/backdrop.png";
import name from "@/public/Home/Hero/name.png";
import icons from "@/public/Home/Hero/icons.png";
import logout from "@/public/Home/Hero/logout.png";
import signup from "@/public/Home/Hero/signup.png";

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function Hero() {
  const router = useRouter();
  const containerRef = useRef(null);
  const horizontalRef = useRef(null);
  const cardsRef = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!containerRef.current || !horizontalRef.current) return;
    if (window.innerWidth < 768) return;

    const sections = horizontalRef.current.querySelectorAll('.horizontal-section');
    const totalWidth = sections.length * window.innerWidth;

    gsap.to(sections, {
      xPercent: -100 * (sections.length - 1),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        snap: 1 / (sections.length - 1),
        end: () => `+=${totalWidth}`,
      }
    });

    if (cardsRef.current) {
      gsap.to(cardsRef.current, {
        opacity: 1,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        }
      });
    }

    return () => ScrollTrigger.getAll().forEach(t => t.kill());
  }, []);

  let isTransitioning = false;
  const handleTransitionNav = (url) => {
    if (typeof window === 'undefined') return;
    if (isTransitioning) return;
    isTransitioning = true;

    const overlay = document.querySelector('.fade-overlay');
    if (overlay) overlay.style.pointerEvents = 'all';

    gsap.to(overlay, {
      opacity: 1,
      duration: 0.35,
      ease: 'power3.inOut',
      onComplete: () => router.push(url),
    });
  };

  return (
    <div className="relative w-full bg-black">
      <div ref={containerRef} className="relative w-full min-h-screen md:h-screen overflow-hidden">
        <div ref={horizontalRef} className="md:flex w-full h-full">

          {/* ================= HERO SECTION ================= */}
          <div className="horizontal-section relative w-screen h-screen flex-shrink-0">

            {/* Background */}
            <div className="absolute inset-0 z-0">
              <Image src={hbg} alt="Background" fill className="object-cover" />
            </div>

            {/* TOP BAR WITH SIGNUP AND ICONS */}
            <div className="relative z-30 flex justify-between items-start pt-8 px-6 md:px-16">
              {/* Sign Up Button */}
              <div className="cursor-pointer">
                <Image
                  src={signup}
                  alt="Sign Up"
                  className="w-28 md:w-32 object-contain"
                  priority
                  onClick={() => handleTransitionNav("/signup")}
                />
              </div>
              
              {/* Icons please add this */}

            </div>

            {/* Content */}
            <div className="relative z-20 flex h-full">

              {/* LEFT HALF */}
              <div className="w-full md:w-1/2 flex flex-col justify-center px-6 md:px-16">

                <Image src={name} alt="Name" className="w-[750px] md:w-[750px] mb-50" />
              </div>

              {/* RIGHT HALF EMPTY */}
              <div className="hidden md:block md:w-1/2" />
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden absolute bottom-6 left-0 w-full px-6 z-30">
              <div className="grid grid-cols-2 gap-2">
                {[team, events, prof, dev].map((img, i) => (
                  <motion.div
                    key={i}
                    onClick={() =>
                      handleTransitionNav(
                        i === 0 ? "/team" :
                        i === 1 ? "/events" :
                        i === 2 ? "/profile" : "/developer"
                      )
                    }
                    className="bg-black overflow-hidden"
                  >
                    <Image src={img} alt="card" className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ================= ABOUT SECTION ================= */}
          <div className="horizontal-section relative w-screen h-screen bg-black flex-shrink-0">
            <div className="absolute inset-0 flex flex-col items-center justify-center px-8">
              <h2 className="text-white text-5xl font-bold mb-6">About Us</h2>
              <p className="text-white text-xl max-w-4xl text-center opacity-90">
                The Computer Society of India at Vidyalankar Institute of Technology
                fosters innovation, collaboration, and technical excellence.
              </p>
            </div>
          </div>
        </div>

        {/* ================= DESKTOP STICKY CARDS ================= */}
        <div
          ref={cardsRef}
          className="hidden md:flex fixed bottom-10 left-1/2 -translate-x-1/2 gap-3 z-50 opacity-0"
        >
          {[gta, team, events, prof, dev].map((img, i) => (
            <motion.div
            key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onClick={() =>
              handleTransitionNav(
                i === 1 ? "/team" :
                i === 2 ? "/events" :
                i === 3 ? "/profile" :
                i === 4 ? "/developer" : null
              )
            }
            animate={{
              scale:
                i === 0
                  ? hovered === null
                    ? 1.1   // GTA bigger by default
                    : hovered === 0
                      ? 1.1 // GTA hovered
                      : 1     // GTA shrinks when others hovered
                  : hovered === i
                    ? 1.1   // Other cards on hover
                    : 1
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-black w-40 h-40 overflow-hidden cursor-pointer"
          >
            <Image src={img} alt="card" className="w-full h-full object-cover" />
          </motion.div>

          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
