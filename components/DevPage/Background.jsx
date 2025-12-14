"use client"
import React, { useEffect } from 'react'

const Background = () => {

  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalStyle
    }
  }, [])

  return (
    <div className="w-full h-screen bg-[url('/Devpage/devPageBG.png')] bg-no-repeat bg-cover bg-center opacity-100">
        <div className="absolute inset-0 bg-black/50"></div>
    </div>
  )
}

export default Background