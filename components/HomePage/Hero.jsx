'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";

import Footer from "../../components/footer.jsx";

import team from "@/public/HomePage/valo_team 1.png";
import events from "@/public/HomePage/assassins_events 1.png";
import prof from "@/public/HomePage/minecraft_profile 1.png";
import dev from "@/public/HomePage/roadrash_developers 1.png";
import gta from "@/public/Home/Hero/main.png";
import hbg from "@/public/Home/Hero/backdrop.png";
import name from "@/public/Home/Hero/name.png";
import signup from "@/public/Home/Hero/signup.png";

export default function Hero() {
  const router = useRouter();
  const [hovered, setHovered] = useState(null);

  let isTransitioning = false;

  const handleTransitionNav = (url) => {
    if (!url || isTransitioning) return;
    isTransitioning = true;

    const overlay = document.querySelector('.fade-overlay');
    if (overlay) overlay.style.pointerEvents = 'all';

    if (overlay) {
      overlay.style.opacity = 1;
      setTimeout(() => router.push(url), 350);
    } else {
      router.push(url);
    }
  };

  return (
    <div className="relative w-full bg-black overflow-x-hidden">

      {/* ================= HERO SECTION ================= */}
      <section className="relative w-full min-h-screen">

        {/* Background */}
        <div className="absolute inset-0 z-0">
          <Image src={hbg} alt="Background" fill className="object-cover" />
        </div>

        {/* TOP BAR */}
        <div className="relative z-30 flex justify-between items-start pt-8 px-6 md:px-16">
          <Image
            src={signup}
            alt="Sign Up"
            className="w-28 md:w-32 cursor-pointer"
            priority
            onClick={() => handleTransitionNav("/signup")}
          />
        </div>

        {/* CONTENT */}
        <div className="relative z-20 flex h-full">

          {/* LEFT */}
          <div className="w-full md:w-1/2 flex flex-col justify-center pl-3 lg:px-6 md:px-16">
            <Image
              src={name}
              alt="Name"
              className=" w-[300px] lg:w-[750px] pt-20 lg:pt-35 max-w-full"
            />
          </div>

          {/* RIGHT EMPTY */}
          <div className="hidden md:block md:w-1/2" />
        </div>

        {/* ================= MOBILE CARDS ================= */}
        <div className="md:hidden absolute bottom-6 right-0 w-full pb-3 px-2 z-30">
          <div 
            className="flex overflow-x-auto gap-1 pb-1"
            onWheel={(e) => {
              const container = e.currentTarget;
              container.scrollLeft += e.deltaY;
            }}
          >
            {[gta, team, events, prof, dev].map((img, i) => (
              <motion.div
                key={i}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  handleTransitionNav(
                    i === 0 ? "/" :
                    i === 1 ? "/team" :
                    i === 2 ? "/events" :
                    i === 3 ? "/profile" :
                    i === 4 ? "/developer" :
                    null
                  )
                }
                className="flex-shrink-0 w-24 h-24 bg-black overflow-hidden cursor-pointer rounded-lg"
              >
                <Image
                  src={img}
                  alt="card"
                  className="w-full h-full object-cover"
                  width={96}
                  height={96}
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* ================= DESKTOP HERO CARDS ================= */}
        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 gap-3 z-30">
          {[gta, team, events, prof, dev].map((img, i) => (
            <motion.div
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={() =>
                handleTransitionNav(
                  i === 0 ? "/" :
                  i === 1 ? "/team" :
                  i === 2 ? "/events" :
                  i === 3 ? "/profile" :
                  i === 4 ? "/developer" :
                  null
                )
              }
              animate={{
                scale:
                  i === 0
                    ? hovered === null
                      ? 1.1
                      : hovered === 0
                        ? 1.1
                        : 1
                    : hovered === i
                      ? 1.1
                      : 1
              }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-black w-40 h-40 overflow-hidden cursor-pointer"
            >
              <Image
                src={img}
                alt="card"
                className="w-full h-full object-cover"
              />
            </motion.div>
          ))}
        </div>

      </section>

      {/* ================= FOOTER ================= */}
      <Footer />
    </div>
  );
}
