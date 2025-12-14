import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const Navbar = () => {
  const navLinks = [
    { name: 'Home', href: '/home' },
    { name: 'Team', href: '/team' },
    { name: 'Developer', href: '/developer' },
    { name: 'Events', href: '/events' },
    { name: 'Profile', href: '/profile' },
  ]

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 w-full'>
      <div className='mx-auto max-w-7xl px-6 py-4'>
        {/* Glassmorphism Container */}
        <div className='bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-xl px-6 py-3'>
          <div className='flex items-center justify-between'>
            
            {/* Logo Section */}
            <Link href='/' className='flex items-center space-x-3 group'>
              <div className='relative w-12 h-12 transition-transform duration-300 group-hover:scale-110'>
                <Image
                  src='/Login/csivit.png'
                  alt='CSI Logo'
                  fill
                  className='object-contain'
                  priority
                />
              </div>
              <span className='text-xl font-bold text-white font-orbiton hidden md:block'>
                CSI VIT
              </span>
            </Link>

            {/* Navigation Links */}
            <div className='hidden lg:flex items-center space-x-8'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className='text-white/90 hover:text-white font-medium transition-all duration-300 hover:scale-110 relative group'
                >
                  {link.name}
                  <span className='absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full'></span>
                </Link>
              ))}
            </div>

            {/* Profile Section */}
            <div className='flex items-center space-x-4'>
              {/* Login Button */}
              <Link
                href='/login'
                className='flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm border border-white/30 rounded-full px-6 py-2 transition-all duration-300 hover:scale-105 group'
              >
                <span className='text-white font-medium'>Login</span>
                <svg className='w-4 h-4 text-white transition-transform duration-300 group-hover:translate-x-1' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                </svg>
              </Link>

              {/* Mobile Menu Button */}
              <button className='lg:hidden flex flex-col space-y-1.5 w-8 h-8 justify-center items-center bg-white/20 hover:bg-white/30 rounded-lg transition-all duration-300'>
                <span className='w-5 h-0.5 bg-white rounded-full'></span>
                <span className='w-5 h-0.5 bg-white rounded-full'></span>
                <span className='w-5 h-0.5 bg-white rounded-full'></span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
