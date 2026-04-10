import React, { useEffect, useState } from 'react'
import { useContext } from 'react'
import { AdminContext } from '../../context/AdminContext'
import { AppContext } from '../../context/AppContext'

const AllAppointments = () => {

  const { aToken, appointments, cancelAppointment, getAllAppointments, uploadPrescription, downloadReport, uploadingPrescriptionFor } = useContext(AdminContext)
  const { slotDateFormat, calculateAge, currency } = useContext(AppContext)
  const [prescriptionFiles, setPrescriptionFiles] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const totalAppointments = appointments.length
  const totalPages = Math.max(1, Math.ceil(totalAppointments / pageSize))
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedAppointments = appointments.slice(startIndex, endIndex)

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    if (!aToken) return

    getAllAppointments()
    const intervalId = setInterval(() => {
      getAllAppointments()
    }, 10000)

    const handleWindowFocus = () => {
      getAllAppointments()
    }

    window.addEventListener('focus', handleWindowFocus)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener('focus', handleWindowFocus)
    }
  }, [aToken])

  return (
    <div className='panel-page'>
      <div className='panel-page-header'>
        <div>
          <p className='panel-page-title'>All Appointments</p>
          <p className='panel-page-subtitle'>Manage prescriptions, reports, and urgent flags across all bookings.</p>
        </div>
      </div>

      <div className='panel-data-shell text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='panel-table-head hidden sm:grid grid-cols-[0.5fr_2fr_1fr_2fr_2fr_1fr_2.5fr] grid-flow-col'>
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action / Prescription / Report</p>
        </div>
        {paginatedAppointments.length === 0 && (
          <p className='panel-empty'>No appointments available yet.</p>
        )}
        {paginatedAppointments.map((item, index) => {
          const age = calculateAge(item.userData.dob)
          const ageLabel = Number.isFinite(age) ? age : '-'
          const parseSlotDateTime = (slotDate, slotTime) => {
            if (!slotDate || !slotTime) return null
            const [day, month, year] = String(slotDate).split('_').map(Number)
            if (!day || !month || !year) return null
            const timeMatch = String(slotTime).trim().toUpperCase().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/)
            if (!timeMatch) return new Date(year, month - 1, day)
            let hours = Number(timeMatch[1])
            const minutes = Number(timeMatch[2])
            const meridiem = timeMatch[3]
            if (meridiem === 'PM' && hours !== 12) hours += 12
            if (meridiem === 'AM' && hours === 12) hours = 0
            return new Date(year, month - 1, day, hours, minutes, 0, 0)
          }

          const appointmentDate = parseSlotDateTime(item.slotDate, item.slotTime)
          const isPast = appointmentDate ? appointmentDate < new Date() : false
          const isCompleted = Boolean(item.isCompleted || item.completedAt || item.payment)
          const isCancelled = Boolean(item.cancelled)
          const isCompletedDisplay = !isCancelled && (isCompleted || isPast)
          const canCancel = !isCancelled && !isCompletedDisplay && !isPast

          return (
          <div className='panel-table-row flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_2fr_2fr_1fr_2.5fr] items-center text-slate-600' key={item._id}>
            <p className='max-sm:hidden'>{startIndex + index + 1}</p>
            <div className='flex items-center gap-2'>
              <img src={item.userData.image} className='w-8 rounded-full' alt="" /> <p>{item.userData.name}</p>
            </div>
            <p className='max-sm:hidden'>{ageLabel}</p>
            <p>{slotDateFormat(item.slotDate)}, {item.slotTime}</p>
            <div className='flex items-center gap-2'>
              <img src={item.docData.image} className='w-8 rounded-full bg-gray-200' alt="" /> <p>{item.docData.name}</p>
            </div>
            <p>{currency}{item.amount}</p>

            <div className='flex flex-col gap-2'>
              {item.isUrgent && (
                <p className='panel-urgent-tag'>Urgent</p>
              )}
              {isCancelled
                ? <p className='panel-status-cancel'>Cancelled</p>
                : isCompletedDisplay
                  ? <p className='panel-status-complete'>Completed</p>
                  : canCancel
                    ? <button onClick={() => cancelAppointment(item._id)} className='panel-danger-btn'>Cancel</button>
                    : null
              }

              <input
                type='file'
                accept='.pdf,.png,.jpg,.jpeg'
                onChange={(e) => setPrescriptionFiles((prev) => ({ ...prev, [item._id]: e.target.files?.[0] || null }))}
                className='panel-file-input'
              />

              <div className='flex flex-wrap gap-2'>
                {!item.cancelled && (
                  <a
                    href={`https://meet.jit.si/${item.consultationRoomId || `kiaan-consult-${item._id}`}`}
                    target='_blank'
                    rel='noreferrer'
                    className='panel-outline-btn'
                  >
                    Open Consultation
                  </a>
                )}
                <button
                  onClick={() => uploadPrescription(item._id, prescriptionFiles[item._id])}
                  disabled={uploadingPrescriptionFor === item._id}
                  className='panel-outline-btn'
                >
                  {uploadingPrescriptionFor === item._id ? 'Uploading...' : 'Upload Prescription'}
                </button>

                {item.prescriptionUrl && (
                  <a href={item.prescriptionUrl} target='_blank' rel='noreferrer' className='panel-outline-btn'>
                    View Prescription
                  </a>
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
          )
        })}
      </div>

      <div className='mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600'>
        <p>
          Showing {totalAppointments === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, totalAppointments)} of {totalAppointments}
        </p>
        <div className='flex items-center gap-2'>
          <button
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className='panel-outline-btn disabled:opacity-50'
          >
            Prev
          </button>
          <span className='px-2'>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className='panel-outline-btn disabled:opacity-50'
          >
            Next
          </button>
        </div>
      </div>

    </div>
  )
}

export default AllAppointments
