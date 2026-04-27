import axios from 'axios'
import React, { useContext, useState } from 'react'
import { DoctorContext } from '../context/DoctorContext'
import { AdminContext } from '../context/AdminContext'
import { toast } from 'react-toastify'
import safeStorage from '../utils/safeStorage'

const Login = () => {

  const [state, setState] = useState('Admin')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const backendUrl = import.meta.env.VITE_BACKEND_URL

  const { setDToken } = useContext(DoctorContext)
  const { setAToken } = useContext(AdminContext)

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Admin') {

      const { data } = await axios.post(backendUrl + '/api/admin/login', { email, password })
      if (data.success) {
        setAToken(data.token)
        safeStorage.set('aToken', data.token)
      } else {
        toast.error(data.message)
      }

    } else {

      const { data } = await axios.post(backendUrl + '/api/doctor/login', { email, password })
      if (data.success) {
        setDToken(data.token)
        safeStorage.set('dToken', data.token)
      } else {
        toast.error(data.message)
      }

    }

  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center px-4'>
      <div className='panel-shell flex flex-col gap-5 m-auto items-start p-8 min-w-[340px] sm:min-w-96 text-slate-600 text-sm shadow-lg rounded-xl'>
        {/* Role Selection Tabs */}
        <div className='w-full flex gap-2 p-1 bg-slate-100 rounded-lg'>
          <button
            type='button'
            onClick={() => setState('Admin')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              state === 'Admin'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Admin
          </button>
          <button
            type='button'
            onClick={() => setState('Doctor')}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              state === 'Doctor'
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Doctor
          </button>
        </div>

        {/* Title */}
        <div className='text-center w-full'>
          <p className='text-2xl font-semibold text-slate-800'>
            {state === 'Admin' ? 'Admin Login' : 'Doctor Login'}
          </p>
          <p className='text-xs text-slate-500 mt-1'>
            {state === 'Admin'
              ? 'Access the admin dashboard and manage the clinic'
              : 'View appointments and manage your profile'}
          </p>
        </div>

        {/* Form Fields */}
        <div className='w-full space-y-4'>
          <div>
            <label className='text-sm font-medium text-slate-700'>Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='panel-input mt-1.5 w-full'
              type="email"
              placeholder='Enter your email'
              required
            />
          </div>
          <div>
            <label className='text-sm font-medium text-slate-700'>Password</label>
            <input
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              className='panel-input mt-1.5 w-full'
              type="password"
              placeholder='Enter your password'
              required
            />
          </div>
        </div>

        {/* Login Button */}
        <button className='panel-btn w-full py-2.5 rounded-lg text-base font-medium'>
          Login as {state}
        </button>
      </div>
    </form>
  )
}

export default Login
