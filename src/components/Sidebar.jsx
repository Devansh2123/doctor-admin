import React, { useContext } from 'react'
import { assets } from '../assets/assets'
import { NavLink } from 'react-router-dom'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'

const Sidebar = () => {

  const { dToken } = useContext(DoctorContext)
  const { aToken } = useContext(AdminContext)

  return (
    <div className='panel-sidebar min-h-screen backdrop-blur border-r'>
      {aToken && <>
        <p className='panel-sidebar-title'>Admin</p>
        <ul className='text-[#515151] mt-2'>

        <NavLink to={'/admin-dashboard'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.home_icon} alt='' />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>
        <NavLink to={'/all-appointments'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block'>Appointments</p>
        </NavLink>
        <NavLink to={'/add-doctor'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.add_icon} alt='' />
          <p className='hidden md:block'>Add Doctor</p>
        </NavLink>
        <NavLink to={'/doctor-list'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.people_icon} alt='' />
          <p className='hidden md:block'>Doctors List</p>
        </NavLink>
        <NavLink to={'/users-list'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.patients_icon} alt='' />
          <p className='hidden md:block'>Users List</p>
        </NavLink>
        <NavLink to={'/claims'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block'>Claims</p>
        </NavLink>
        <NavLink to={'/site-settings'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.list_icon} alt='' />
          <p className='hidden md:block'>Site Settings</p>
        </NavLink>
      </ul>
      </>}

      {dToken && <>
        <p className='panel-sidebar-title'>Doctor</p>
        <ul className='text-[#515151] mt-2'>
        <NavLink to={'/doctor-dashboard'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.home_icon} alt='' />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>
        <NavLink to={'/doctor-appointments'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block'>Appointments</p>
        </NavLink>
        <NavLink to={'/doctor-profile'} className={({ isActive }) => `mx-2 mb-1 flex items-center gap-3 rounded-xl py-3.5 px-3 md:px-6 md:min-w-72 cursor-pointer transition ${isActive ? 'panel-active-item' : 'hover:bg-slate-50'}`}>
          <img className='min-w-5' src={assets.people_icon} alt='' />
          <p className='hidden md:block'>Profile</p>
        </NavLink>
      </ul>
      </>}
    </div>
  )
}

export default Sidebar
