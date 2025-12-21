/*
Image-generation prompt for a footer that complements a dramatic lightning strike at the top of the page.
Use this prompt with your preferred image-generator (e.g., Stable Diffusion, MidJourney, DALL·E).

Prompt:
"Design a dark-themed website footer that visually complements a dramatic lightning strike positioned at the top of the page. The footer should feature a deep navy-to-black vertical gradient background with subtle storm-cloud textures and a faint bluish ambient glow rising from the top edge. Use electric blue (#4AC8FF) and soft white glow accents for headings, icons, and separators. Layout: clean, structured, and modern with three main columns on desktop (logo & description, quick links & events, contact & social) and a compact stacked layout on mobile. Provide a placeholder area for a large logo at left. Include a newsletter email input and a subtle back-to-top button. Avoid literal lightning bolts in the footer — instead emphasize atmospheric lighting, soft glows, geometric separators, and tech-inspired ornamentation (thin glowing lines, micro-grid patterns). Style should feel technological, professional, and futuristic, suitable for a computer science committee. Render at high resolution, 16:9 aspect or vertical banner variants; prefer transparent background option not required."
*/
'use client'
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function Footer() {
  const quickLinks = [
    { name: 'Home', href: '/home' },
    { name: 'About Us', href: '/home' },
    { name: 'Team', href: '/team' },
    { name: 'Events', href: '/events' },
    { name: 'Developers', href: '/developer' },
    { name: 'Profile/Login', href: '/login' }
  ];
  const social = [
    { name: 'LinkedIn', href: '#', icon: linkedinSvg() },
    { name: 'GitHub', href: '#', icon: githubSvg() },
    { name: 'Instagram', href: '#', icon: instagramSvg() },
    { name: 'YouTube', href: '#', icon: youtubeSvg() },
    { name: 'X', href: '#', icon: xSvg() },
    { name: 'Discord', href: '#', icon: discordSvg() },
  ];

  const events = ['Upcoming Events', 'Past Events Archive', 'Workshops & Seminars', 'Competition Calendar'];

  function scrollToTop() {
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <footer className="relative overflow-hidden text-gray-200 bg-[#000010cc]">
      {/* Background gradient + subtle storm texture */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-[#03071A] to-[#041026] -z-10" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/assets/storm-texture.png')] bg-cover bg-center -z-5" />

      {/* Ambient glow that appears to rise from lightning above */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(74,200,255,0.12), rgba(4,8,16,0))',
          filter: 'blur(28px)'
        }}
        aria-hidden
      />

      <div className="max-w-7xl mx-auto px-8 py-16">
                {/* Large centered logo */}
        <div className="mt-12 flex justify-center"
        >
          <div className=" flex items-center justify-center">
            <img src="/csi_logo.png" alt="CSI-VIT Logo" className="max-h-32 object-contain" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Logo + description */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="space-y-4"
          >
            <div>
              <h3 className="text-xl font-semibold text-[#DDF8FF] tracking-tight">Computer Society of India - VIT</h3>
              <p className="text-sm text-gray-300 mt-1">"Exploring Technology Beyond Limits"</p>
            </div>

            <p className="text-sm text-gray-400 max-w-md">CSI-VIT brings students, researchers, and developers together to explore technology, run workshops, and deliver projects that connect academic learning with real-world engineering practices.</p>

            <div className="space-y-2 text-sm text-gray-400">
              <div>Email: <a href="mailto:csi-committee@example.com" className="text-[#9EE8FF] hover:underline">csi-committee@example.com</a></div>
              <div>Location: Vidyalankar Institue of Technology Wadala, India</div>
            </div>
          </motion.div>

          {/* Middle: Quick links + Events */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="grid grid-cols-2 gap-8"
          >
            <div>
              <h4 className="text-sm font-semibold text-[#9EE8FF] mb-4">Quick Links</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                {quickLinks.map((q) => (
                  <li key={q.name}><a className="hover:text-white transition-colors" href={q.href}>{q.name}</a></li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#9EE8FF] mb-4">Events & Activities</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                {events.map((e) => (
                  <li key={e}><a href="#" className="hover:text-white">{e}</a></li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: Social + Contact + Legal */}
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="flex flex-col items-start"
          >
            <h4 className="text-sm font-semibold text-[#9EE8FF] mb-4">Connect</h4>

            <div className="flex gap-3 mb-4">
              {social.map((s) => (
                <a key={s.name} href={s.href} aria-label={s.name} className="p-2 rounded-md bg-transparent hover:bg-[rgba(74,200,255,0.06)] transition-shadow" dangerouslySetInnerHTML={{ __html: s.icon }} />
              ))}
            </div>

            <div className="w-full bg-[rgba(255,255,255,0.02)] p-4 rounded-md">
              <h5 className="text-sm font-medium text-[#E6FBFF]">Newsletter</h5>
              <p className="text-xs text-gray-300 mb-3">Subscribe for event updates and developer calls.</p>
              <form className="flex gap-2">
                <input aria-label="Email" type="email" placeholder="your@email.com" className="flex-1 px-3 py-2 rounded-md text-sm bg-transparent border border-[rgba(255,255,255,0.06)] focus:outline-none focus:ring-2 focus:ring-[#4AC8FF]/40" />
                <button type="submit" className="px-4 py-2 rounded-md bg-[#4AC8FF] text-black font-semibold text-sm hover:brightness-95">Subscribe</button>
              </form>
            </div>

            <div className="mt-6 text-xs text-gray-500">
              <ul>
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms of Service</a></li>
                <li><a href="#" className="hover:underline">Code of Conduct</a></li>
                <li><a href="#" className="hover:underline">Cookie Policy</a></li>
              </ul>
            </div>
          </motion.div>
          </div>
          
        {/* Separator */}
        <div className="mt-10 border-t border-[rgba(74,200,255,0.06)] pt-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-400">© 2025 Computer Society of India - VIT. All rights reserved.</div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div>Built with care by CSI-VIT Tech Team</div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-[rgba(255,255,255,0.03)] rounded">Next.js</span>
                <span className="text-xs px-2 py-1 bg-[rgba(255,255,255,0.03)] rounded">React</span>
                <span className="text-xs px-2 py-1 bg-[rgba(255,255,255,0.03)] rounded">Tailwind</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Back to top floating button */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="fixed right-6 bottom-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-[#0F1724] to-[#071022] border border-[rgba(74,200,255,0.12)] shadow-[0_8px_30px_rgba(74,200,255,0.06)] flex items-center justify-center hover:scale-105 transition-transform"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5v14" stroke="#9EE8FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 11l-6-6-6 6" stroke="#9EE8FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <style>{`
        /* Additional small utilities for subtle neon/glow accents */
        .neon-text { text-shadow: 0 2px 12px rgba(74,200,255,0.12); }
      `}</style>
    </footer>
  );
}

// --- Icon helpers (inline SVG strings) ---
function linkedinSvg() {
  return `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9h3v10H6zM7.5 4a1.75 1.75 0 11-.001 3.5A1.75 1.75 0 017.5 4zM12 13.5v5.5h3v-5.1c0-1.48.03-3.39-2.06-3.39s-2.94 1.99-2.94 3.0z" fill="#9EE8FF"/>
  </svg>`;
}
function githubSvg() {
  return `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C7.58 2 4 5.58 4 10c0 3.54 2.29 6.54 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.03.08-2.14 0 0 .67-.21 2.2.82A7.6 7.6 0 0112 6.8c.68.003 1.36.092 1.99.27 1.53-1.03 2.2-.82 2.2-.82.44 1.11.16 1.94.08 2.14.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0020 10c0-4.42-3.58-8-8-8z" fill="#9EE8FF"/>
  </svg>`;
}
function instagramSvg() {
  return `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="#9EE8FF" strokeWidth="1.4"/>
    <path d="M12 7.8a4.2 4.2 0 100 8.4 4.2 4.2 0 000-8.4z" stroke="#9EE8FF" strokeWidth="1.4"/>
    <path d="M17.5 6.5h.01" stroke="#9EE8FF" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>`;
}
function youtubeSvg() {
  return `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 8s-.2-1.4-.8-2c-.8-.8-1.7-.8-2.1-.9C15 4.8 12 4.8 12 4.8s-3 0-6.9.3c-.5.1-1.4.1-2.1.9C2.2 6.6 2 8 2 8s-.2 1.7-.2 3.4V14c0 1.7.2 3.4.2 3.4s.2 1.4.8 2c.8.8 1.9.8 2.4.9C9 23 12 23 12 23s3 0 6.9-.3c.5-.1 1.6-.1 2.4-.9.6-.6.8-2 .8-2s.2-1.7.2-3.4V11.4C22.2 9.7 22 8 22 8z" stroke="#9EE8FF" strokeWidth="0.6" fill="none"/>
    <path d="M10 14.5l5-2.5-5-2.5v5z" fill="#9EE8FF"/>
  </svg>`;
}
function xSvg() {
  return `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6l12 12" stroke="#9EE8FF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>`;
}
function discordSvg() {
  return `
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.3 14.6c-1.1 0-1.9-1-1.9-2.3s.8-2.3 1.9-2.3c1.1 0 1.9 1 1.9 2.3 0 1.3-.8 2.3-1.9 2.3zM15.7 14.6c-1.1 0-1.9-1-1.9-2.3s.8-2.3 1.9-2.3c1.1 0 1.9 1 1.9 2.3 0 1.3-.8 2.3-1.9 2.3z" fill="#9EE8FF"/>
    <path d="M20 4H4v12c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4V4z" stroke="#9EE8FF" strokeWidth="0.6" fill="none"/>
  </svg>`;
}
