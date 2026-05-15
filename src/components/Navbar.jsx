import React, { useContext } from 'react'
import adminHeaderLogo from '../assets/admin_header_logo.png'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import safeStorage from '../utils/safeStorage'

const Navbar = () => {

  const { dToken, setDToken } = useContext(DoctorContext)
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
        { label: 'SETTING', path: '/site-settings' },
      ]
    : [
        { label: 'DASHBOARD', path: '/doctor-dashboard' },
        { label: 'APPOINTMENTS', path: '/doctor-appointments' },
        { label: 'PROFILE', path: '/doctor-profile' },
      ]

  const logout = () => {
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

        <div className='flex items-center gap-3'>
          <button onClick={() => logout()} className='panel-btn px-5 py-2 rounded-full text-sm'>
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Navbar
