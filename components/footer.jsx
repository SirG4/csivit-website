'use client'
import React from 'react'
import { motion } from 'framer-motion'
import {
  FaLinkedinIn,
  FaInstagram,
  FaYoutube,
  FaDiscord,
  FaEnvelope,
  FaMapMarkerAlt
} from 'react-icons/fa'

export default function Footer() {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <footer className="relative overflow-hidden text-gray-200 bg-[#000010cc]">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-[#03071A] to-[#041026] -z-10" />
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/assets/storm-texture.png')] bg-cover bg-center -z-10" />

      {/* Top glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 inset-x-0 h-28 pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(74,200,255,0.15), transparent)',
          filter: 'blur(30px)'
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        {/* Logo */}
        <div className="flex justify-center mb-12 lg:mb-16">
          <img
            src="/csi_logo.png"
            alt="CSI-VIT Logo"
            className="h-28 lg:h-36 object-contain drop-shadow-[0_0_25px_rgba(74,200,255,0.25)]"
          />
        </div>

        {/* Main Grid - 3 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-8 mb-12 lg:mb-16">
          
          {/* Column 1: About */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="space-y-4 lg:pr-8 text-center lg:text-left"
          >
            <div>
              <h3 className="text-xl font-semibold text-[#DDF8FF] neon-text mb-2">
                Computer Society of India - VIT
              </h3>
              <p className="text-sm text-gray-300 italic">
                "Exploring Technology Beyond Limits"
              </p>
            </div>

            <p className="text-sm text-gray-400 leading-relaxed px-4 lg:px-0">
              CSI-VIT brings students, researchers, and developers together to
              explore technology, conduct workshops, and build projects that
              bridge academic learning with real-world engineering.
            </p>
          </motion.div>

          {/* Column 2: Contact Information */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="space-y-6 lg:pl-8 text-center lg:text-left"
          >
            <h4 className="text-lg font-semibold text-[#9EE8FF] neon-text">
              Contact Information
            </h4>
            
            <div className="space-y-4">
              {/* Email */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-3 items-center">
                <div className="text-[#4AC8FF]">
                  <FaEnvelope />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Email</p>
                  <a
                    href="mailto:csivittechteam@gmail.com"
                    className="text-sm text-gray-400 hover:text-[#9EE8FF] hover:underline transition-colors"
                  >
                    csivittechteam@gmail.com
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex flex-col lg:flex-row lg:items-start gap-3 items-center">
                <div className="text-[#4AC8FF]">
                  <FaMapMarkerAlt />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-300 mb-1">Location</p>
                  <p className="text-sm text-gray-400">
                    Vidyalankar Institute of Technology, <br />
                    Wadala, Mumbai, <br />
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Column 3: Connect With Us */}
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.18 }}
            className="space-y-6 text-center lg:text-left"
          >
            <h4 className="text-lg font-semibold text-[#9EE8FF] neon-text">
              Connect With Us
            </h4>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { name: 'LinkedIn', href: '#', icon: <FaLinkedinIn /> },
                { name: 'Instagram', href: '#', icon: <FaInstagram /> },
                { name: 'YouTube', href: '#', icon: <FaYoutube /> },
                { name: 'Discord', href: '#', icon: <FaDiscord /> }
              ].map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  aria-label={social.name}
                  className="w-12 h-12 flex items-center justify-center rounded-lg
                    bg-[rgba(255,255,255,0.03)]
                    border border-[rgba(128, 203, 235, 0.15)]
                    text-[#9EE8FF] text-xl
                    hover:bg-[rgba(158, 182, 193, 0.1)]
                    hover:scale-110 hover:border-[rgba(74,200,255,0.3)]
                    hover:shadow-[0_0_15px_rgba(74,200,255,0.2)]
                    transition-all duration-300"
                >
                  {social.icon}
                </a>
              ))}
            </div>

            <div className="pt-4 px-4 lg:px-0">
              <p className="text-sm text-gray-400">
                Follow us for updates on events, workshops, and tech insights.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-[rgba(74,200,255,0.08)]">
          <div className="flex flex-col items-center justify-between gap-6">
            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center">
              © 2026 Computer Society of India - VIT. All rights reserved.
            </div>

            {/* Built with */}
            <div className="flex flex-col items-center gap-4">
              <span className="text-sm text-gray-400 text-center">
                Built with struggle by CSI-VIT Tech Team
              </span>
              <div className="flex flex-wrap gap-2 justify-center">
                <span className="px-3 py-1 text-xs rounded-full border border-[rgba(74,200,255,0.2)] bg-[rgba(74,200,255,0.1)]">
                  Next.js
                </span>
                <span className="px-3 py-1 text-xs rounded-full border border-[rgba(74,200,255,0.2)] bg-[rgba(74,200,255,0.1)]">
                  React
                </span>
                <span className="px-3 py-1 text-xs rounded-full border border-[rgba(74,200,255,0.2)] bg-[rgba(74,200,255,0.1)]">
                  Tailwind
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={scrollToTop}
        aria-label="Back to top"
        className="fixed right-6 bottom-6 z-50 w-12 h-12 rounded-full
          bg-gradient-to-br from-[#0F1724] to-[#071022]
          border border-[rgba(74,200,255,0.2)]
          shadow-[0_10px_30px_rgba(74,200,255,0.15)]
          flex items-center justify-center
          hover:scale-110 hover:shadow-[0_10px_30px_rgba(74,200,255,0.25)]
          transition-all duration-300"
      >
        ↑
      </button>

      <style>{`
        .neon-text {
          text-shadow: 0 0 14px rgba(74,200,255,0.25);
        }
      `}</style>
    </footer>
  )
}