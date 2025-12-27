'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Footer from "../../components/footer.jsx";
import team from "@/public/HomePage/valo_team 1.png";
import events from "@/public/HomePage/assassins_events 1.png";
import prof from "@/public/HomePage/minecraft_profile 1.png";
import dev from "@/public/HomePage/roadrash_developers 1.png";
import t2bg from "@/public/HomePage/T2_bg.png";
import hbg from "@/public/HomePage/halo_bg.jpg";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";

import React from "react";

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
    const router = useRouter();
    const containerRef = useRef(null);
    const horizontalRef = useRef(null);
    const cardsRef = useRef(null);
    
    useEffect(() => {
        if (!containerRef.current || !horizontalRef.current) return;

        // Create horizontal scroll effect
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

        // Keep cards visible during horizontal scroll, fade out after
        if (cardsRef.current) {
            gsap.to(cardsRef.current, {
                opacity: 1,
                scrollTrigger: {
                    trigger: containerRef.current,
                    start: "top top",
                    end: "bottom bottom",
                    scrub: true,
                    onLeave: () => gsap.to(cardsRef.current, { opacity: 0, duration: 0.3 }),
                    onEnterBack: () => gsap.to(cardsRef.current, { opacity: 1, duration: 0.3 }),
                }
            });
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, []);

    // Custom navigation with transition
    let isTransitioning = false;
    const handleTransitionNav = (url) => {
        if (typeof window === 'undefined') return;
        const pathname = window.location.pathname;
        if (!url || url === pathname || isTransitioning) return;
        console.log(url, pathname);
        isTransitioning = true;
        const overlay = document.querySelector('.fade-overlay');
        if (overlay) overlay.style.pointerEvents = 'all';
        // Set animation type for PageTransition
        window.__FADE_TYPE__ = 'default';
        window.__PREV_PATH__ = pathname;
        window.__NEXT_PATH__ = url;
        if (overlay) {
            gsap.to(overlay, {
                opacity: 1,
                duration: 0.35,
                ease: 'power3.inOut',
                onComplete: () => {
                    router.push(url);
                },
            });
        } else {
            router.push(url);
        }
    };
    return (
        <div className="relative w-full bg-black">
            {/* Horizontal Scroll Container */}
            <div ref={containerRef} className="relative w-full h-screen overflow-hidden">
                <div ref={horizontalRef} className="flex w-full h-full">
                    
                    {/* Hero Section */}
                    <div className="horizontal-section relative w-screen h-screen flex-shrink-0">
                        {/* Background Image */}
                        <div className="absolute top-0 left-0 w-full h-full z-0">
                            <Image
                                src={hbg}
                                alt="Sky Background"
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Text and Cards Overlay */}
                        <div className="absolute inset-0 z-20 flex flex-col items-start justify-start pt-20 px-8 md:px-16 lg:px-24 mt-[10%]">
                            {/* Main Heading */}
                            <h1 className="text-black text-4xl md:text-6xl lg:text-7xl font-bold mb-2">
                                Computer Society of India
                            </h1>
                            {/* Subtitle */}
                            <p className="text-black text-lg md:text-xl lg:text-2xl mb-4 opacity-90">
                                Vidyalankar Institute of Technology
                            </p>
                            <p className="text-black text-lg md:text-xl lg:text-2xl mb-16 opacity-90">
                                MORE INFO
                            </p>
                        </div>
                    </div>

                    {/* About Us Section */}
                    <div className="horizontal-section relative w-screen h-screen flex-shrink-0 bg-black">
                        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 md:px-16 lg:px-24">
                            <h2 className="text-white text-4xl md:text-6xl lg:text-7xl font-bold mb-8">
                                About Us
                            </h2>
                            <p className="text-white text-lg md:text-xl lg:text-2xl text-center max-w-4xl opacity-90 leading-relaxed">
                                The Computer Society of India at Vidyalankar Institute of Technology is dedicated to fostering innovation, 
                                technical excellence, and collaborative learning among students passionate about technology and computer science.
                            </p>
                        </div>
                    </div>

                </div>

                {/* Sticky Cards - Fixed during horizontal scroll */}
                <div ref={cardsRef} className="w-[85vw] flex justify-between items-end gap-1 md:gap-2 mb-10 fixed bottom-10 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
                    <motion.div 
                        onClick={() => handleTransitionNav('/team')} 
                        className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer pointer-events-auto"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        style={{ originY: 1 }}
                    >
                        <Image src={team} alt="Team" className="w-full h-full object-cover" />
                    </motion.div>
                    <motion.div 
                        onClick={() => handleTransitionNav('/events')} 
                        className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer pointer-events-auto"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        style={{ originY: 1 }}
                    >
                        <Image src={events} alt="Events" className="w-full h-full object-cover" />
                    </motion.div>
                    <motion.div 
                        onClick={() => handleTransitionNav('/profile')} 
                        className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer pointer-events-auto"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        style={{ originY: 1 }}
                    >
                        <Image src={prof} alt="Profile" className="w-full h-full object-cover" />
                    </motion.div>
                    <motion.div 
                        onClick={() => handleTransitionNav('/developer')} 
                        className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer pointer-events-auto"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        style={{ originY: 1 }}
                    >
                        <Image src={dev} alt="Developers" className="w-full h-full object-cover" />
                    </motion.div>
                    <motion.div 
                        className="bg-black rounded-lg h-50 w-50 flex-shrink-0 pointer-events-auto"
                        whileHover={{ scale: 1.2 }}
                        transition={{ duration: 0.3 }}
                        style={{ originY: 1 }}
                    ></motion.div>
                </div>
            </div>
            
            {/* Footer - Vertical Scroll After Horizontal */}
            <Footer/>
        </div>
    );
}