import React, { useContext, useEffect } from 'react'
import { AdminContext } from '../../context/AdminContext'

const DoctorsList = () => {

  const { doctors, changeAvailability, updateDoctorApproval, updateDoctorBlock, aToken, getAllDoctors } = useContext(AdminContext)

  useEffect(() => {
    if (aToken) {
        getAllDoctors()
    }
}, [aToken])

  return (
    <div className='panel-page max-h-[90vh] overflow-y-scroll'>
      <div className='panel-page-header'>
        <div>
          <p className='panel-page-title'>All Doctors</p>
          <p className='panel-page-subtitle'>Approve profiles, manage availability, and keep quality consistent.</p>
        </div>
      </div>
      {doctors.length === 0 && (
        <p className='panel-empty'>No doctors found yet.</p>
      )}
      <div className='w-full flex flex-wrap gap-4 pt-2 gap-y-6'>
        {doctors.map((item, index) => {
          const isApproved = item.isApproved !== false
          return (
          <div className='panel-doctor-card group' key={index}>
            <img className='panel-doctor-thumb' src={item.image} alt="" />
            <div className='p-4'>
              <p className='text-[#262626] text-lg font-medium'>{item.name}</p>
              <p className='text-[#5C5C5C] text-sm'>{item.speciality}</p>
              <div className='mt-2 flex items-center gap-1 text-sm'>
                <input onChange={() => changeAvailability(item._id)} type="checkbox" checked={item.available} />
                <p>Available</p>
              </div>
              <div className='mt-2 flex items-center gap-2 text-xs'>
                <span className={isApproved ? 'panel-status-complete' : 'panel-status-cancel'}>
                  {isApproved ? 'Approved' : 'Pending Approval'}
                </span>
              </div>
              <div className='mt-3 flex flex-wrap gap-2'>
                <button
                  onClick={() => updateDoctorApproval(item._id, !isApproved)}
                  className='panel-outline-btn'
                >
                  {isApproved ? 'Unapprove' : 'Approve'}
                </button>
                <button
                  onClick={() => updateDoctorBlock(item._id, !item.isBlocked)}
                  className={item.isBlocked ? 'panel-soft-btn' : 'panel-danger-btn'}
                >
                  {item.isBlocked ? 'Unblock' : 'Block'}
                </button>
              </div>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  )
}

export default DoctorsList
