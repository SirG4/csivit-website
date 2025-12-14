'use client'
import React from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const AboutUs = () => {
  gsap.registerPlugin(ScrollTrigger)

  useGSAP(() => {
    gsap.to('.pin', {
        width:"100vw",
        height:"100vh", // zoom effect
      duration: 2,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".main",
        scrub: true,
        pin: true,
        start: "center center",
        markers:"true",
        end: "+=1000",
      },
    })
  })

  return (
    <div className="min-h-screen bg-white relative">
      {/* Main content */}
      <div className="h-[90vh] main relative flex items-center flex-col justify-center">
        <h1 className="text-center mt-5 text-[4rem] font-bold font-orbiton">
          About Us
        </h1>

        <p className="text-center text-[1.5rem] leading-relaxed max-w-5xl mx-auto px-4">
          <span className="inline-block relative w-[100px] h-[70px] mx-4 align-middle rounded-full overflow-hidden">
            <Image
              src="/Home/Aboutus/anime.png"
              fill
              alt="character image"
              className="object-contain"
            />
          </span>
          The <strong>Computer Society of India (CSI)</strong> is the oldest and
          largest community of computer professionals, teachers, and students in
          the country.
          
          <span className="inline-block  absolute bottom-0 left-0 pin w-[100px] h-[70px] mx-4 align-middle rounded-full overflow-hidden">
            <Image
              src="/Home/Aboutus/anime.png"
              fill
              alt="character image"
              className="object-contain"
            />
          </span>
          It is a place where people who love technology come together to share
          knowledge, learn new skills, and grow in the field of computers and IT.

          CSI organizes <span className="font-semibold">workshops, events, and talks</span> 
          to help students and professionals stay updated with the latest trends,
          connect with experts, and explore career opportunities.

          <span className="inline-block relative w-[100px] h-[70px] mx-4 align-middle rounded-full overflow-hidden">
            <Image
              src="/Home/Aboutus/anime.png"
              fill
              alt="character image"
              className="object-contain"
            />
          </span>
          In short, CSI is a{" "}
          <span className="text-blue-600 font-bold">friendly platform</span> for
          anyone interested in computers to learn, network, and build their
          future.
        </p>
      </div>

      {/* Next section */}
      <div className="min-h-screen relative bg-red-100">
        <div className="absolute w-full h-[10vh] top-0 left-0 z-[9999]">
          <Image
            src="/Home/Aboutus/zigzag.png"
            alt="Hero character"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  )
}

export default AboutUs
