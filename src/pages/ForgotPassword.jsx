import axios from 'axios'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const ForgotPassword = () => {
  const [state, setState] = useState('Admin')
  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const backendUrl = import.meta.env.VITE_BACKEND_URL
  const navigate = useNavigate()

  const onSubmitHandler = async (event) => {
    event.preventDefault()

    if (!email || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    const resetPath = state === 'Admin'
      ? '/api/admin/reset-password-email'
      : '/api/doctor/reset-password-email'

    setIsLoading(true)
    try {
      const { data } = await axios.post(backendUrl + resetPath, {
        email: email.trim(),
        newPassword
      })

      if (data.success) {
        toast.success(data.message)
        navigate('/')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error('Reset password error:', error)
      toast.error('Unable to reset password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center px-4'>
      <div className='panel-shell flex flex-col gap-5 m-auto items-start p-8 min-w-[340px] sm:min-w-96 text-slate-600 text-sm shadow-lg rounded-xl'>
        <div className='w-full flex gap-2 p-1 bg-slate-100 rounded-lg'>
          <button
            type='button'
            disabled={isLoading}
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
            disabled={isLoading}
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

        <div className='text-center w-full'>
          <p className='text-2xl font-semibold text-slate-800'>{state} Password Reset</p>
          <p className='text-xs text-slate-500 mt-1'>Change your password using your registered email</p>
        </div>

        <div className='w-full space-y-4'>
          <div>
            <label className='text-sm font-medium text-slate-700'>Email</label>
            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='panel-input mt-1.5 w-full'
              type='email'
              placeholder='Enter registered email'
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className='text-sm font-medium text-slate-700'>New Password</label>
            <input
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              className='panel-input mt-1.5 w-full'
              type='password'
              placeholder='Enter new password'
              required
              disabled={isLoading}
            />
          </div>
          <div>
            <label className='text-sm font-medium text-slate-700'>Confirm New Password</label>
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              className='panel-input mt-1.5 w-full'
              type='password'
              placeholder='Confirm new password'
              required
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type='submit'
          disabled={isLoading}
          className='panel-btn w-full py-2.5 rounded-lg text-base font-medium disabled:opacity-50'
        >
          {isLoading ? 'Updating...' : `Update ${state} Password`}
        </button>

        <p className='w-full text-center text-sm'>
          Back to login?
          <span onClick={() => navigate('/')} className='text-blue-700 underline cursor-pointer ml-1'>
            Click here
          </span>
        </p>
      </div>
    </form>
  )
}

export default ForgotPassword
