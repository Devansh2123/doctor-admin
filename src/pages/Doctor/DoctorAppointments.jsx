import React, { useContext, useEffect, useMemo, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const DoctorAppointments = () => {

  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment, approveAppointment, rejectAppointment, uploadPrescription, viewPrescription, downloadReport, uploadingPrescriptionFor } = useContext(DoctorContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const navigate = useNavigate()
  const [prescriptionFiles, setPrescriptionFiles] = useState({})
  const [rejectReasons, setRejectReasons] = useState({})
  const [activeTab, setActiveTab] = useState('upcoming')

  const getApprovalStatus = (appointment) => appointment?.approvalStatus || 'approved'
  const isPendingApproval = (appointment) => getApprovalStatus(appointment) === 'pending'
  const isRejected = (appointment) => getApprovalStatus(appointment) === 'rejected'

  const isPastAppointment = (appointment) => {
    // Only show in 'past' tab if explicitly cancelled or completed by doctor
    // NOT just because the date has passed
    return appointment.cancelled || appointment.isCompleted
  }

  const filteredAppointments = useMemo(() => {
    return appointments.filter((item) => activeTab === 'past' ? isPastAppointment(item) : !isPastAppointment(item))
  }, [appointments, activeTab])

  useEffect(() => {
    if (dToken) {
      getAppointments()
    }
  }, [dToken])

  return (
    <div className='panel-page'>
      <div className='panel-page-header'>
        <div>
          <p className='panel-page-title'>Appointments</p>
          <p className='panel-page-subtitle'>Review upcoming visits and keep patient notes current.</p>
        </div>
      </div>

      <div className='flex gap-2 mb-3'>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`panel-tab-btn ${activeTab === 'upcoming' ? 'panel-tab-btn-active' : ''}`}
        >
          Upcoming
        </button>
        <button
          onClick={() => setActiveTab('past')}
          className={`panel-tab-btn ${activeTab === 'past' ? 'panel-tab-btn-active' : ''}`}
        >
          Past
        </button>
      </div>

      <div className='panel-data-shell text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='panel-table-head max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_2.5fr] gap-1'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action / Prescription / Report</p>
        </div>

        {filteredAppointments.length === 0 && (
          <p className='panel-empty'>No {activeTab} appointments found.</p>
        )}

        {filteredAppointments.map((item, index) => (
          <div className='panel-table-row flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_2.5fr] gap-1 items-center text-slate-600' key={item._id}>
            <p className='max-sm:hidden'>{index + 1}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <div>
              <p className='panel-note-chip'>
                {item.payment ? 'Online' : 'CASH'}
              </p>
            </div>
            <p className='max-sm:hidden'>{calculateAge(item.userData.dob)}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <p>{currency}{item.amount}</p>

            <div className='flex flex-col gap-2'>
              {item.isUrgent && (
                <p className='panel-urgent-tag'>Urgent</p>
              )}
              {isRejected(item)
                ? (
                  <div className='flex flex-col gap-1'>
                    <p className='panel-status-cancel'>Rejected</p>
                    {item.approvalNote && <p className='text-xs text-slate-500'>Reason: {item.approvalNote}</p>}
                  </div>
                )
                : isPendingApproval(item)
                  ? (
                    <div className='flex flex-col gap-2'>
                      <p className='text-xs text-amber-600 font-medium'>Awaiting your confirmation</p>
                      <input
                        type='text'
                        value={rejectReasons[item._id] || ''}
                        onChange={(e) => setRejectReasons((prev) => ({ ...prev, [item._id]: e.target.value }))}
                        placeholder='Optional reject reason'
                        className='panel-input py-1 text-xs'
                      />
                      <div className='flex gap-2'>
                        <button onClick={() => approveAppointment(item._id)} className='panel-outline-btn'>Accept</button>
                        <button onClick={() => rejectAppointment(item._id, rejectReasons[item._id] || '')} className='panel-danger-btn'>Reject</button>
                      </div>
                    </div>
                  )
                : item.cancelled
                ? <p className='panel-status-cancel'>Cancelled</p>
                : item.isCompleted
                  ? <p className='panel-status-complete'>Completed</p>
                  : (
                    <div className='flex flex-col gap-2'>
                      <p className='text-xs text-green-600 font-medium'>Confirmed - Awaiting completion</p>
                      <div className='flex'>
                        <img onClick={() => cancelAppointment(item._id)} className='w-10 cursor-pointer' src={assets.cancel_icon} alt="" />
                        <img onClick={() => completeAppointment(item._id)} className='w-10 cursor-pointer' src={assets.tick_icon} alt="" />
                      </div>
                    </div>
                  )
              }

              <input
                type='file'
                accept='.pdf,.png,.jpg,.jpeg'
                onChange={(e) => setPrescriptionFiles((prev) => ({ ...prev, [item._id]: e.target.files?.[0] || null }))}
                className='panel-file-input'
              />

              <div className='flex flex-wrap gap-2'>
                {!item.cancelled && !isPendingApproval(item) && !isRejected(item) && (
                  <button
                    onClick={() => navigate(`/doctor-consultation/${item._id}`)}
                    className='panel-outline-btn'
                  >
                    Open Consultation
                  </button>
                )}
                <button
                  onClick={() => uploadPrescription(item._id, prescriptionFiles[item._id])}
                  disabled={uploadingPrescriptionFor === item._id}
                  className='panel-outline-btn'
                >
                  {uploadingPrescriptionFor === item._id ? 'Uploading...' : 'Upload Prescription'}
                </button>

                {item.prescriptionUrl && (
                  <button onClick={() => viewPrescription(item._id, item.prescriptionUrl)} className='panel-outline-btn'>
                    View Prescription
                  </button>
                )}

                <button
                  onClick={() => downloadReport(item._id)}
                  className='panel-soft-btn'
                >
                  Download Report
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  )
}

export default DoctorAppointments
