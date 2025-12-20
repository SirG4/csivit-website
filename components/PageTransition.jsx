"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { gsap } from "gsap"
import Image from "next/image";
import team from "@/public/HomePage/valo_team 1.png";
import events from "@/public/HomePage/assassins_events 1.png";
import prof from "@/public/HomePage/minecraft_profile 1.png";
import dev from "@/public/HomePage/roadrash_developers 1.png";

const PageTransition = ({ children }) => {
  const router = useRouter()
  const pathname = usePathname()
  const overlayRef = useRef(null)
  const isTransitioning = useRef(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [transitionImage, setTransitionImage] = useState(null);

  // Map route to image
  const routeToImage = {
    "/team": team,
    "/events": events,
    "/profile": prof,
    "/developer": dev,
  };

  useEffect(() => {
    // Skip fade animation on initial load to prevent navbar from being hidden
    if (isInitialLoad) {
      if (overlayRef.current) {
        overlayRef.current.style.opacity = "0"
        overlayRef.current.style.pointerEvents = "none"
      }
      setIsInitialLoad(false)
      return
    }

    // Reset transition state when pathname changes (navigation completed)
    isTransitioning.current = false

    // Determine animation type
    const fadeType = window.__FADE_TYPE__ || 'default';
    // Show image if coming from home and going to a mapped route
    const prevPath = window.__PREV_PATH__;
    const nextPath = pathname;
    if (prevPath === "/home" && routeToImage[nextPath]) {
      setTransitionImage(routeToImage[nextPath]);
      // Fade in image, then fade out
      if (overlayRef.current) {
        overlayRef.current.style.display = "flex";
        overlayRef.current.style.alignItems = "center";
        overlayRef.current.style.justifyContent = "center";
      }
      gsap.fromTo(
        overlayRef.current,
        { opacity: 1 },
        {
          opacity: 1,
          duration: 0.1,
          onComplete: () => {
            gsap.to(overlayRef.current, {
              opacity: 1,
              duration: 1.0,
              onComplete: () => {
                gsap.to(overlayRef.current, {
                  opacity: 0,
                  duration: 0.5,
                  onComplete: () => {
                    setTransitionImage(null);
                    if (overlayRef.current) {
                      overlayRef.current.style.pointerEvents = "none";
                      overlayRef.current.style.display = "block";
                    }
                  },
                });
              },
            });
          },
        }
      );
    } else {
      if (fadeType === 'back') {
        // Pure fade for back button
        gsap.fromTo(
          overlayRef.current,
          { opacity: 1 },
          {
            opacity: 0,
            duration: 0.7,
            ease: "power2.inOut",
            onComplete: () => {
              if (overlayRef.current) {
                overlayRef.current.style.pointerEvents = "none"
              }
              window.__FADE_TYPE__ = undefined;
            },
          }
        );
      } else {
        // Slide/fade for normal navigation
        gsap.fromTo(
          overlayRef.current,
          { opacity: 1, x: 0 },
          {
            opacity: 0,
            x: 100,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => {
              if (overlayRef.current) {
                overlayRef.current.style.pointerEvents = "none"
                overlayRef.current.style.transform = '';
              }
            },
          }
        );
      }
    }
    window.__PREV_PATH__ = pathname;
  }, [pathname, isInitialLoad])

  useEffect(() => {
    const handleLinkClick = (e) => {
      const link = e.currentTarget
      const href = link.getAttribute("href")
      if (!href || href.startsWith("#")) return

      e.preventDefault()
      const url = new URL(href, window.location.origin).pathname
      if (url === pathname || isTransitioning.current) return
        console.log(url,pathname)
      isTransitioning.current = true
      overlayRef.current.style.pointerEvents = "all"

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power3.inOut",
        onComplete: () => {
          router.push(url)
        },
      })
    }

    const links = document.querySelectorAll('a[href^="/"]')
    links.forEach((l) => l.addEventListener("click", handleLinkClick))

    return () =>
      links.forEach((l) => l.removeEventListener("click", handleLinkClick))
  }, [router, pathname])

  return (
    <>
      <div 
        ref={overlayRef} 
        className="fade-overlay" 
        style={{ opacity: 0, pointerEvents: 'none', display: transitionImage ? 'flex' : 'block' }} 
      >
        {transitionImage && (
          <Image src={transitionImage} alt="Transition" width={400} height={400} style={{ objectFit: 'contain', borderRadius: '2rem', boxShadow: '0 0 40px #0008' }} />
        )}
      </div>
      {children}

      <style>{`
        .fade-overlay {
          position: fixed;
          inset: 0;
          background: #0f0f0f;
          z-index: 9999;
        }
      `}</style>
    </>
  )
}

export default PageTransition
