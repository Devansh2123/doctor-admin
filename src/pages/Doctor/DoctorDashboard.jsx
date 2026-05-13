import React from 'react'
import { useContext } from 'react'
import { useEffect } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorDashboard = () => {

  const { dToken, dashData, getDashData, cancelAppointment, completeAppointment, approveAppointment, rejectAppointment } = useContext(DoctorContext)
  const { slotDateFormat, currency } = useContext(AppContext)
  const patientImage = (patient) => patient?.image || assets.upload_area

  const getStatusLabel = (appointment) => {
    if ((appointment?.approvalStatus || 'approved') === 'pending') return { text: 'Pending Approval', className: 'text-amber-600' }
    if ((appointment?.approvalStatus || 'approved') === 'rejected') return { text: 'Rejected', className: 'text-red-500' }
    if (appointment.cancelled) return { text: 'Cancelled', className: 'text-red-400' }
    if (appointment.isCompleted) return { text: 'Completed', className: 'text-green-500' }
    return { text: 'Pending', className: 'text-amber-500' }
  }

  useEffect(() => {

    if (dToken) {
      getDashData()
    }

  }, [dToken])

  return dashData && (
    <div className='panel-page'>
      <div className='panel-hero'>
        <div>
          <p className='panel-hero-title'>Doctor Dashboard</p>
          <p className='panel-hero-subtitle'>Keep an eye on today&apos;s schedule, approvals, and patient activity.</p>
        </div>
      </div>

      <div className='panel-stats-grid'>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.earning_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Total Earnings</p>
            <p className='panel-stat-value'>{currency} {dashData.earnings}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.appointments_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Appointments</p>
            <p className='panel-stat-value'>{dashData.appointments}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.appointment_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Pending Requests</p>
            <p className='panel-stat-value'>{dashData.pendingRequests || 0}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.list_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Today&apos;s Schedule</p>
            <p className='panel-stat-value'>{dashData.todayScheduleCount || 0}</p>
          </div>
        </div>
        <div className='panel-stat-card flex items-center gap-3'>
          <img className='w-12' src={assets.patients_icon} alt="" />
          <div>
            <p className='panel-stat-label'>Patients</p>
            <p className='panel-stat-value'>{dashData.patients}</p>
          </div>
        </div>
      </div>

      <div className='panel-section overflow-hidden'>
        <div className='panel-section-head flex items-center gap-2.5 px-4 py-4 border-b'>
          <img src={assets.list_icon} alt="" />
          <p className='panel-section-headline'>Latest Bookings</p>
        </div>

        <div className='py-2'>
          {dashData.latestAppointments.slice(0, 5).map((item, index) => (
            <div className='panel-table-row flex items-center gap-3' key={index}>
              <img className='rounded-full w-10' src={patientImage(item.userData)} alt="" />
              <div className='flex-1 text-sm'>
                <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                <p className='text-gray-600 '>Booking on {slotDateFormat(item.slotDate)}</p>
              </div>
              {item.cancelled
                ? <p className='panel-status-cancel'>Cancelled</p>
                : item.isCompleted
                  ? <p className='panel-status-complete'>Completed</p>
                  : (item.approvalStatus || 'approved') === 'pending'
                    ? <div className='flex items-center gap-2'>
                      <button onClick={() => approveAppointment(item._id)} className='panel-outline-btn'>Accept</button>
                      <button onClick={() => rejectAppointment(item._id, window.prompt('Optional reason for rejection') || '')} className='panel-danger-btn'>Reject</button>
                    </div>
                  : <div className='flex'>
                    <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                    <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                  </div>
              }
            </div>
          ))}
        </div>
      </div>

      <div className='panel-section mt-6 overflow-hidden'>
        <div className='panel-section-head flex items-center gap-2.5 px-4 py-4 border-b'>
          <img src={assets.list_icon} alt="" />
          <p className='panel-section-headline'>Today&apos;s Schedule</p>
        </div>

        <div className='pt-2'>
          {(dashData.todaySchedule || []).length === 0 && (
            <p className='panel-empty'>No appointments scheduled for today.</p>
          )}

          {(dashData.todaySchedule || []).map((item) => {
            const status = getStatusLabel(item)
            return (
              <div className='panel-table-row flex items-center gap-3' key={item._id}>
                <img className='rounded-full w-10' src={patientImage(item.userData)} alt="" />
                <div className='flex-1 text-sm'>
                  <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                  <p className='text-gray-600 '>{slotDateFormat(item.slotDate)} at {item.slotTime}</p>
                </div>
                {item.isUrgent && <p className='panel-urgent-tag'>Urgent</p>}
                <p className={`text-xs font-medium ${status.className}`}>{status.text}</p>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}

export default DoctorDashboard
