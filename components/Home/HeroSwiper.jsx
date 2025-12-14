"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/free-mode';
import 'swiper/css/pagination';

import './styles.css';

// import required modules
import { FreeMode, Pagination } from 'swiper/modules';

export default function HeroSwiper({ items = [] }) {
    return (
        <Swiper
            slidesPerView={5}
            spaceBetween={16}
            freeMode={true}
            pagination={{ clickable: true }}
            modules={[FreeMode, Pagination]}
            className="mySwiper w-full"
            breakpoints={{
                0: { slidesPerView: 2.5, spaceBetween: 12 },
                768: { slidesPerView: 5, spaceBetween: 16 }
            }}
        >
            {items.map((item, index) => (
                <SwiperSlide key={index}>
                    <Link href={item.link} className="block">
                        <div className="transition-colors duration-300 rounded-lg h-[220px] md:h-[250px] w-full flex flex-col items-center justify-center cursor-pointer transform hover:scale-105">
                            <div className="relative w-full h-full rounded-3xl overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.image}
                                    width={600}
                                    height={400}
                                    className="w-full h-full object-contain rounded-3xl border"
                                    sizes="(max-width: 768px) 50vw, 20vw"
                                    priority={index < 2}
                                    unoptimized
                                />
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
