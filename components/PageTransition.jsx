"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Image from "next/image";
import { useSession } from "next-auth/react";

import team from "@/public/Home/Poster/TeamLoader.png";
import events from "@/public/Home/Poster/EventsLoader.png";
import prof from "@/public/Home/Poster/ProfileLoader.jpeg";
import dev from "@/public/Home/Poster/DevLoader.png";

const PageTransition = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const overlayRef = useRef(null);
  const videoRef = useRef(null);
  const isTransitioning = useRef(false);
  const [GameName,setGameName]=useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [transitionImage, setTransitionImage] = useState(null);
  const [isVideoTransition, setIsVideoTransition] = useState(false);

  const routeToImage = {
    "/team": team,
    "/events": events,
    "/profile": prof,
    "/developer": dev,
  };

  const routeToGameName={
    "/team":"Valorant",
    "/events":"Assains Creed",
    "/profile":"Steam",
    "/developer":"Road rash",
  };

  // Protected routes that require authentication
  const protectedRoutes = ["/profile", "/admin", "/scanner"];
  // Public routes that authenticated users shouldn't access
  const authRoutes = ["/login", "/signup"];

  /* ---------------- PRELOAD ASSETS ON HOME PAGE ---------------- */
  useEffect(() => {
    // Only preload if on home page
    if (pathname === "/" || pathname === "/home") {
      // Preload images
      const imageUrls = [team, events, prof, dev];
      imageUrls.forEach((src) => {
        const img = new window.Image();
        img.src = src.src || src;
      });

      // Preload video
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  }, [pathname]);

  /* ---------------- AUTH REDIRECT ---------------- */
  useEffect(() => {
    if (status === "loading") return;

    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // If user is not authenticated and trying to access protected route, redirect to login
    if (!session && isProtectedRoute) {
      router.push("/login");
    }
    
    // If user is authenticated and trying to access login/signup, redirect to profile
    if (session && isAuthRoute) {
      router.push("/profile");
    }
  }, [session, status, pathname, router]);

  /* ---------------- PATH CHANGE ---------------- */
  useEffect(() => {
    if (isInitialLoad) {
      overlayRef.current.style.opacity = "0";
      overlayRef.current.style.pointerEvents = "none";
      setIsInitialLoad(false);
      window.__PREV_PATH__ = pathname;
      return;
    }

    isTransitioning.current = false;

    const prevPath = window.__PREV_PATH__;
    const nextPath = pathname;

    if (prevPath === "/home" && routeToImage[nextPath]) {
      // Check if it's profile route to use video
      if (nextPath === "/profile") {
        setIsVideoTransition(true);
       

        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.01,
          onComplete: () => {
            // Play video
            if (videoRef.current) {
              videoRef.current.play();
            }
            gsap.to(overlayRef.current, {
              opacity: 1,
              duration: 2.5,
              onComplete: () => {
                gsap.to(overlayRef.current, {
                  opacity: 0,
                  duration: 0.5,
                  onComplete: () => {
                    setIsVideoTransition(false);
                    overlayRef.current.style.pointerEvents = "none";
                     setGameName(routeToGameName[nextPath]);
                    if (videoRef.current) {
                      videoRef.current.pause();
                      videoRef.current.currentTime = 0;
                    }
                  },
                });
              },
            });
          },
        });
      } else {
        // Use image for other routes
        setTransitionImage(routeToImage[nextPath]);
        setGameName(routeToGameName[nextPath]);

        gsap.to(overlayRef.current, {
          opacity: 1,
          duration: 0.2,
          onComplete: () => {
            gsap.to(overlayRef.current, {
              opacity: 1,
              duration: 2.5,
              onComplete: () => {
                gsap.to(overlayRef.current, {
                  opacity: 0,
                  duration: 0.5,
                  onComplete: () => {
                    setTransitionImage(null);
                    overlayRef.current.style.pointerEvents = "none";
                  },
                });
              },
            });
          },
        });
      }
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.5,
        ease: "power2.out",
        onComplete: () => {
          overlayRef.current.style.pointerEvents = "none";
        },
      });
    }

    window.__PREV_PATH__ = pathname;
  }, [pathname, isInitialLoad]);

  /* ---------------- LINK CLICK ---------------- */
  useEffect(() => {
    const handleClick = (e) => {
      const href = e.currentTarget.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      const url = new URL(href, window.location.origin).pathname;
      if (url === pathname || isTransitioning.current) return;

      e.preventDefault();
      isTransitioning.current = true;
      overlayRef.current.style.pointerEvents = "all";

      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.35,
        ease: "power3.inOut",
        onComplete: () => router.push(url),
      });
    };

    const links = document.querySelectorAll('a[href^="/"]');
    links.forEach((l) => l.addEventListener("click", handleClick));

    return () =>
      links.forEach((l) => l.removeEventListener("click", handleClick));
  }, [pathname, router]);

  return (
    <>
      {children}

      <div
        ref={overlayRef}
        className="fade-overlay"
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        {/* Video element - always present for preloading */}
        <video
          ref={videoRef}
          className="transition-video"
          style={{ display: isVideoTransition ? 'block' : 'none' }}
          muted
          playsInline
          preload="auto"
        >
          <source src="/Home/Poster/minecraft_opening.mp4" type="video/mp4" />
        </video>

        {isVideoTransition && (
          <>
            <div className="transition-overlay-text">
              <span className="inspired">Inspired by</span>
              <span className="game-name">{GameName}</span>
            </div>

            <div className="progressbar-container">
              <div className="progressbar">
                <div className="progressbar-fill" />
              </div>
            </div>
          </>
        )}
        {transitionImage && (
          <>
            <Image
              src={transitionImage}
              alt="Transition"
              fill
              priority
              
              className="object-contain md:object-cover"
            />

            <div className="transition-overlay-text">
              <span className="inspired">Inspired by</span>
              <span className="game-name">{GameName}</span>
            </div>

            <div className="progressbar-container">
              <div className="progressbar">
                <div className="progressbar-fill" />
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx global>{`
        .fade-overlay {
          position: fixed;
          inset: 0;
          background: #0f0f0f;
          z-index: 9999;
        }

        .transition-video {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .transition-overlay-text {
          position: absolute;
          top: 3vh;
          right: 3vw;
          color: #fff;
          text-align: right;
          font-family: Montserrat, sans-serif;
          text-shadow: 0 2px 8px #000;
          z-index: 2;
        }

        .transition-overlay-text .inspired {
          font-size: 0.9rem;
          opacity: 0.8;
        }

        .transition-overlay-text .game-name {
          font-size: 1.4rem;
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .progressbar-container {
          position: absolute;
          left: 50%;
          bottom: 5vh;
          transform: translateX(-50%);
          width: 60vw;
          max-width: 420px;
          z-index: 2;
        }

        .progressbar {
          height: 8px;
          background: #222;
          border-radius: 4px;
          overflow: hidden;
        }

        .progressbar-fill {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #3498db, #6dd5fa);
          animation: fill 1.2s linear forwards;
        }

        @keyframes fill {
          to {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default PageTransition;