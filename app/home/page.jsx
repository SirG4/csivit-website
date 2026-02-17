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

  const goTo = (url) => {
    router.push(url);
  };


  const pages = [
    { img: gta, link: "/" },
    { img: team, link: "/team" },
    { img: events, link: "/events" },
    { img: prof, link: "/profile" },
    { img: dev, link: "/developer" }
  ];


  return (
    <div className="relative w-full bg-black overflow-hidden">


      {/* ================= HERO ================= */}
      <section className="relative w-full min-h-screen">


        {/* ================= BACKGROUND ================= */}
        <div className="absolute inset-0 z-0">

          <Image
  src={hbg}
  alt="Background"
  fill
  priority
  className="
    object-cover
    object-[67%_50%]
    md:object-[50%_50%]
  "
/>


        </div>


        {/* ================= TOP BAR ================= */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-30 flex justify-between items-start pt-8 px-6 md:px-16"
        >

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => goTo("/signup")}
            className="cursor-pointer"
          >
            <Image
              src={signup}
              alt="Sign Up"
              className="w-28 md:w-32"
              priority
            />
          </motion.div>

        </motion.div>


        {/* ================= MAIN CONTENT ================= */}
        <div className="relative z-20 flex h-full">


          {/* LEFT SIDE */}
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="w-full md:w-1/2 flex flex-col justify-center pl-3 lg:px-6 md:px-16"
          >

            <Image
              src={name}
              alt="Name"
              className="w-[260px] md:w-[500px] lg:w-[750px] pt-20 max-w-full"
            />

          </motion.div>


          {/* RIGHT SIDE */}
          <div className="hidden md:block md:w-1/2" />

        </div>


        {/* ================= MOBILE ICONS ================= */}
        <div className="md:hidden absolute bottom-5 w-full px-4 z-30">

          <div className="flex gap-3 overflow-x-auto scrollbar-hide">

            {pages.map((item, i) => (

              <motion.div
                key={i}

                whileTap={{ scale: 0.95 }}

                transition={{ duration: 0.15 }}

                onClick={() => goTo(item.link)}

                className="
                  flex-shrink-0
                  w-28 h-28
                  rounded-lg
                  overflow-hidden
                  bg-black
                  shadow-md
                  will-change-transform
                "
              >

                <Image
                  src={item.img}
                  alt="card"
                  className="w-full h-full object-cover"
                />

              </motion.div>

            ))}

          </div>

        </div>


        {/* ================= DESKTOP ICONS ================= */}
        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 gap-5 z-30">


          {pages.map((item, i) => (

            <motion.div
              key={i}
              layout

              onClick={() => goTo(item.link)}

              /* Ultra Fast Hover */
              whileHover={{
                scale: 1.12,
                y: -8
              }}

              whileTap={{
                scale: 0.95
              }}

              transition={{
                type: "spring",
                stiffness: 700,
                damping: 25,
                mass: 0.5
              }}

              className="
                relative
                w-44 h-44
                rounded-lg
                overflow-hidden
                cursor-pointer
                bg-black
                shadow-xl
                will-change-transform
              "
            >

              {/* Glow */}
              <div
                className="
                  absolute inset-0
                  pointer-events-none
                  opacity-0
                  hover:opacity-100
                  transition-opacity
                  duration-150
                  bg-blue-400/20
                "
              />

              <Image
                src={item.img}
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
