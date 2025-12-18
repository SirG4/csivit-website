import Image from 'next/image'
import React from 'react'
import Navbar from './Navbar'
import HeroSwiper from './HeroSwiper'

const Hero = () => {
    const navigationItems = [
        {  link: '/about', image: '/Home/Hero/team.png' },
        { link: '/events', image: '/Home/Hero/events.png' },
        {  link: '/team', image: '/Home/Hero/team.png' },
        {  link: '/developer', image: '/Home/Hero/Profile.png' },
        {  link: '/contact', image: '/Home/Hero/team.png' }
    ]

    return (
        <div className="h-screen overflow-hidden relative w-full bg-[#eeffdf]  flex justify-between items-center bg-cover bg-center bg-no-repeat ">
            {/* Navbar */}
            <Navbar />
            {/* Full background white overlay */}
            <div className='absolute inset-0 bg-white/10 z-0 w-full h-full'></div>

            <div className='absolute w-full h-[10vh]  -bottom-1 left-0 z-1000'>
                <Image
                 src={'/Home/Aboutus/zigzag.png'}
                    alt="Hero character"
                    fill
                    className="md:object-cover rotate-x-180 object-cover relative "
                    priority
                />
            </div>

            {/* character */}
            <div className='md:w-[50vw] w-full h-screen  right-0 flex items-center justify-center absolute z-10'>
                <Image
                    src={'/Home/Hero/character.svg'}
                    alt="Hero character"
                    fill
                    className="md:object-contain object-cover relative z-10"
                    priority
                />
                <div className="absolute w-[500px] h-[500px] rounded-full 
                  bg-[radial-gradient(circle_at_center,rgba(0,255,255,0.7),transparent_70%)] 
                  blur-3xl z-0">
                </div>
            </div>
                {/* Bottom Swiper */}
            <div className='md:h-[40vh] z-20 absolute -bottom-5 md:bottom-8 w-full flex items-center justify-center p-8'>
                <div className='max-w-7xl w-full'>
                    <HeroSwiper items={navigationItems} />
                </div>
            </div>
            {/* Main content*/}
            <div className='absolute md:left-10 top-1/2 -translate-y-1/2 z-30 text-black'>
                <h1 className="md:text-[4rem] text-[2.0rem] font-extrabold font-orbiton 
               text-white bg-gray-500/30 shadow shadow-black/10  to-transparent md:backdrop-blur-lg md:border p-2 rounded-2xl border-white/20">
                    Computer Society of India - VIT 
                </h1>
                <p className=' text-[1.3rem] md:text-[2rem] ml-4'>Exploring Technology Beyond Limits</p>
            </div>

            {/* Cloud */}
            <div className='absolute pointer-events-none md:block hidden -bottom-20 z-100 -left-70'>
                <Image
                    src={'/Home/Hero/cloud.png'}
                    alt="Cloud"
                    width={1000}
                    height={1000}
                    className="object-contain relative z-10 opacity-90"
                    priority
                />
            </div>
            {/* Cloud */}
            <div className='absolute pointer-events-none md:block hidden -bottom-30 z-100 -right-100'>
                <Image
                    src={'/Home/Hero/cloud.png'}
                    alt="Cloud"
                    width={1000}
                    height={1000}
                    className="object-contain relative z-10 rounded-3xl"
                    priority
                />
            </div>
             <div className='absolute pointer-events-none md:block hidden top-30 z-100 opacity-75 left-30'>
                <Image
                    src={'/Home/Hero/airplane.png'}
                    alt="Cloud"
                    width={100}
                    height={100}
                    className="object-contain relative z-10 rounded-3xl"
                    priority
                />
            </div>
        </div>
    )
}

export default Hero
