import React, { useContext, useEffect, useState } from 'react'
import adminHeaderLogo from '../assets/admin_header_logo.png'
import { assets } from '../assets/assets'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import safeStorage from '../utils/safeStorage'

const Navbar = () => {

  const [showDropdown, setShowDropdown] = useState(false)
  const { dToken, setDToken, profileData, getProfileData } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()
  const location = useLocation()

  const navItems = aToken
    ? [
        { label: 'DASHBOARD', path: '/admin-dashboard' },
        { label: 'APPOINTMENTS', path: '/all-appointments' },
        { label: 'DOCTORS', path: '/doctor-list', hasDropdown: true },
        { label: 'USERS', path: '/users-list' },
        { label: 'CLAIMS', path: '/claims' },
      ]
    : [
        { label: 'DASHBOARD', path: '/doctor-dashboard' },
        { label: 'APPOINTMENTS', path: '/doctor-appointments' },
      ]

  const accountName = aToken ? 'Admin' : (profileData?.name || 'Doctor')
  const accountImage = !aToken && profileData?.image ? profileData.image : assets.admin_logo
  const profilePath = aToken ? '/site-settings' : '/doctor-profile'

  useEffect(() => {
    if (dToken && !profileData) {
      getProfileData()
    }
  }, [dToken, profileData, getProfileData])

  const logout = () => {
    setShowDropdown(false)
    dToken && setDToken('')
    dToken && safeStorage.remove('dToken')
    aToken && setAToken('')
    aToken && safeStorage.remove('aToken')
    navigate(aToken ? '/admin-login' : '/doctor-login')
  }

  const doctorsActive = ['/doctor-list', '/add-doctor'].includes(location.pathname)

  return (
    <div className='panel-topbar sticky top-0 z-20 flex items-center justify-between px-3 sm:px-6 py-2 backdrop-blur border-b'>
      <div className='panel-nav-shell flex w-full items-center justify-between gap-3 text-sm'>
        <div className='flex items-center gap-3'>
          <img onClick={() => navigate(aToken ? '/admin-dashboard' : '/doctor-dashboard')} className='w-40 sm:w-44 cursor-pointer' src={adminHeaderLogo} alt="Neuronet Systems Logo" />
        </div>

        <ul className='hidden md:flex items-center gap-2 font-medium'>
          {navItems.map((item) => (
            item.hasDropdown ? (
              <li key={item.path} className='panel-nav-menu relative'>
                <button className={`panel-nav-link ${doctorsActive ? 'panel-nav-active' : ''}`}>
                  {item.label}
                </button>
                <div className='panel-nav-dropdown absolute left-0 top-full hidden min-w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-lg'>
                  <NavLink to='/doctor-list' className='panel-nav-dropdown-item'>
                    All Doctors
                  </NavLink>
                  <NavLink to='/add-doctor' className='panel-nav-dropdown-item'>
                    Add Doctor
                  </NavLink>
                </div>
              </li>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `panel-nav-link ${isActive ? 'panel-nav-active' : ''}`}
              >
                <li>{item.label}</li>
              </NavLink>
            )
          ))}
        </ul>

        <div className='relative flex items-center gap-3'>
          <button
            type='button'
            onClick={() => setShowDropdown((prev) => !prev)}
            className='panel-account-trigger flex items-center gap-2'
          >
            <img className='h-9 w-9 rounded-full border border-slate-200 object-cover' src={accountImage} alt='' />
            <div className='hidden sm:flex flex-col text-right'>
              <span className='text-sm font-medium text-slate-900'>{accountName}</span>
              <span className='text-xs text-slate-500'>View account</span>
            </div>
            <span className={`panel-account-chevron ${showDropdown ? 'rotate-180' : ''}`}></span>
          </button>

          {showDropdown && (
            <>
              <div className='fixed inset-0 z-10' onClick={() => setShowDropdown(false)}></div>
              <div className='panel-account-menu absolute right-0 top-full z-20 mt-3 min-w-56 rounded-xl border border-slate-200 bg-white p-4 shadow-lg'>
                <button
                  type='button'
                  onClick={() => {
                    navigate(profilePath)
                    setShowDropdown(false)
                  }}
                  className='panel-account-menu-item'
                >
                  My Profile
                </button>
                <button
                  type='button'
                  onClick={logout}
                  className='panel-account-menu-item'
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Navbar
