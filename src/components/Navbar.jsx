import React, { useContext } from 'react'
import adminHeaderLogo from '../assets/admin_header_logo.png'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { useNavigate } from 'react-router-dom'
import safeStorage from '../utils/safeStorage'

const Navbar = () => {

  const { dToken, setDToken } = useContext(DoctorContext)
  const { aToken, setAToken } = useContext(AdminContext)

  const navigate = useNavigate()

  const logout = () => {
    navigate('/')
    dToken && setDToken('')
    dToken && safeStorage.remove('dToken')
    aToken && setAToken('')
    aToken && safeStorage.remove('aToken')
  }

  return (
    <div className='panel-topbar sticky top-0 z-20 flex justify-between items-center px-3 sm:px-6 py-2 backdrop-blur border-b'>
      <div className='flex items-center gap-2 text-xs'>
        <img onClick={() => navigate('/')} className='w-32 sm:w-48 cursor-pointer' src={adminHeaderLogo} alt="Neuronet Systems Logo" />
        <p className='panel-chip'>{aToken ? 'Admin Panel' : 'Doctor Panel'}</p>
      </div>

      <div className='flex items-center gap-3'>
        <button onClick={() => logout()} className='panel-btn px-5 py-1.5 rounded-full'>
          Logout
        </button>
      </div>

    </div>
  )
}

export default Navbar
