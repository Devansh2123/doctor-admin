import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import safeStorage from '../utils/safeStorage'

const Navbar = () => {

  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()
  const getInitialTheme = () => {
    const saved = safeStorage.get('theme')
    if (saved) return saved
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  const [theme, setTheme] = useState(getInitialTheme)

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && safeStorage.remove('dToken')
    aToken && setAToken('')
    aToken && safeStorage.remove('aToken')
  }

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('theme-dark', theme === 'dark')
    root.classList.toggle('theme-light', theme === 'light')
    safeStorage.set('theme', theme)
  }, [theme])

  return (
    <div className='panel-topbar sticky top-0 z-20 flex justify-between items-center px-3 sm:px-6 py-2 backdrop-blur border-b'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-20 sm:w-40 cursor-pointer' src={assets.admin_logo} alt="Kiaan Clinic Logo" />
        <p className='panel-chip'>{aToken ? 'Admin Panel' : 'Doctor Panel'}</p>
      </div>

      <div className='flex items-center gap-3'>
        <button
          type='button'
          onClick={() => setTheme((prev) => prev === 'dark' ? 'light' : 'dark')}
          className='panel-outline-btn theme-toggle px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider'
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        <button onClick={() => logout()} className='panel-btn px-5 py-1.5 rounded-full'>
          Logout
        </button>
      </div>

    </div>
  )
}

export default Navbar
