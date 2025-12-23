'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import Footer from "../../components/footer.jsx";
import team from "@/public/HomePage/valo_team 1.png";
import events from "@/public/HomePage/assassins_events 1.png";
import prof from "@/public/HomePage/minecraft_profile 1.png";
import dev from "@/public/HomePage/roadrash_developers 1.png";
import bgf from "@/public/HomePage/bgf.png";
import tbg from "@/public/HomePage/tetris_bg.png";
import t2bg from "@/public/HomePage/T2_bg.png";
import { gsap } from "gsap"


import React from "react";

export default function Hero() {
    const router = useRouter();
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
            {/* Background Image - Covers entire page content */}
            <div className="absolute top-0 left-0 w-full h-[200vh] z-0">
                <Image
                    src={t2bg}
                    alt="Sky Background"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Content Container - only cards are clickable */}
            <div
                className="relative w-full h-screen"
            >
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
                <div className="w-[85vw] flex justify-between items-end gap-1 md:gap-2 mb-10 absolute bottom-10 left-1/2 -translate-x-1/2 z-30">
                        <motion.div 
                            onClick={() => handleTransitionNav('/team')} 
                            className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                            style={{ originY: 1 }}
                        >
                            <Image src={team} alt="Team" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.div 
                            onClick={() => handleTransitionNav('/events')} 
                            className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                            style={{ originY: 1 }}
                        >
                            <Image src={events} alt="Events" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.div 
                            onClick={() => handleTransitionNav('/profile')} 
                            className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                            style={{ originY: 1 }}
                        >
                            <Image src={prof} alt="Profile" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.div 
                            onClick={() => handleTransitionNav('/developer')} 
                            className="hero-card bg-black rounded-lg h-50 w-50 flex-shrink-0 overflow-hidden cursor-pointer"
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                            style={{ originY: 1 }}
                        >
                            <Image src={dev} alt="Developers" className="w-full h-full object-cover" />
                        </motion.div>
                        <motion.div 
                            className="bg-black rounded-lg h-50 w-50 flex-shrink-0"
                            whileHover={{ scale: 1.2 }}
                            transition={{ duration: 0.3 }}
                            style={{ originY: 1 }}
                        ></motion.div>
                    </div>
            </div>
            
            {/* About us */}
            <div 
            >
                {/* Content can be added here - this div will expand with content */}
                <div className="h-screen"></div>
            </div>
            
            <Footer/>
        </div>
    );
}