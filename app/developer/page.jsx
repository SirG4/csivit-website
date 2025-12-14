import React from 'react'
import Background from '@/components/DevPage/Background.jsx'
import NamePanel from '@/components/DevPage/NamePanel.jsx'
import BackButton from '@/components/BackButton/BackButton.jsx'

const page = () => {
  return (
    <div>
      <Background />
      <BackButton />
      <NamePanel />
    </div>
  )
}

export default page
