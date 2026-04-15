import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {

    const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
    const { currency, backendUrl } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [slotTimesText, setSlotTimesText] = useState('')

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const renderStars = (rating) => {
        const filled = Math.round(Number(rating) || 0)
        return (
            <span className='inline-flex items-center gap-0.5'>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= filled ? 'text-yellow-500' : 'text-gray-300'}>
                        {star <= filled ? '\u2605' : '\u2606'}
                    </span>
                ))}
            </span>
        )
    }

    const updateProfile = async () => {

        try {

            const updateData = {
                address: profileData.address,
                fees: profileData.fees,
                about: profileData.about,
                available: profileData.available,
                appointmentApprovalMode: profileData.appointmentApprovalMode || 'auto',
                availableSlotTimes: slotTimesText,
                workingDays: Array.isArray(profileData.workingDays) ? profileData.workingDays : []
            }

            const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                setIsEdit(false)
                getProfileData()
            } else {
                toast.error(data.message)
            }

            setIsEdit(false)

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    useEffect(() => {
        if (dToken) {
            getProfileData()
        }
    }, [dToken])

    useEffect(() => {
        if (!profileData) return
        if (!isEdit) return

        const current = Array.isArray(profileData.availableSlotTimes) ? profileData.availableSlotTimes : []
        setSlotTimesText(current.join(', '))
        if (!Array.isArray(profileData.workingDays)) {
            setProfileData((prev) => ({ ...prev, workingDays: [] }))
        }
    }, [isEdit, profileData])

    return profileData && (
        <div className='panel-page'>
            <div className='panel-page-header'>
                <div>
                    <p className='panel-page-title'>Doctor Profile</p>
                    <p className='panel-page-subtitle'>Update availability, fees, and patient feedback visibility.</p>
                </div>
            </div>
            <div className='flex flex-col gap-4'>
                <div>
                    <img className='panel-profile-image' src={profileData.image} alt="" />
                </div>

                <div className='panel-profile-card'>

                    {/* ----- Doc Info : name, degree, experience ----- */}

                    <p className='flex items-center gap-2 text-3xl font-medium text-slate-800'>{profileData.name}</p>
                    <div className='flex items-center gap-2 mt-1 text-slate-600'>
                        <p>{profileData.degree} - {profileData.speciality}</p>
                        <button className='panel-note-chip'>{profileData.experience}</button>
                    </div>

                    {/* ----- Doc About ----- */}
                    <div>
                        <p className='flex items-center gap-1 text-sm font-medium text-slate-800 mt-3'>About :</p>
                        <p className='text-sm text-slate-600 max-w-[700px] mt-1'>
                            {
                                isEdit
                                    ? <textarea onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} type='text' className='panel-input w-full p-2' rows={8} value={profileData.about} />
                                    : profileData.about
                            }
                        </p>
                    </div>

                    <p className='text-slate-600 font-medium mt-4'>
                        Appointment fee: <span className='text-slate-800'>{currency} {isEdit ? <input className='panel-input inline-block max-w-36 py-1' type='number' onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} value={profileData.fees} /> : profileData.fees}</span>
                    </p>

                    <div className='flex gap-2 py-2'>
                        <p>Address:</p>
                        <p className='text-sm'>
                            {isEdit ? <input className='panel-input py-1' type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} value={profileData.address.line1} /> : profileData.address.line1}
                            <br />
                            {isEdit ? <input className='panel-input py-1 mt-1' type='text' onChange={(e) => setProfileData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} value={profileData.address.line2} /> : profileData.address.line2}
                        </p>
                    </div>

                    <div className='flex gap-1 pt-2'>
                        <input type="checkbox" onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} checked={profileData.available} />
                        <label htmlFor="">Available</label>
                    </div>
                    <div className='mt-2'>
                        <p className='text-sm text-slate-700 mb-1'>Appointment Confirmation</p>
                        {isEdit ? (
                            <select
                                className='panel-input max-w-56'
                                value={profileData.appointmentApprovalMode || 'auto'}
                                onChange={(e) => setProfileData((prev) => ({ ...prev, appointmentApprovalMode: e.target.value }))}
                            >
                                <option value='auto'>Auto confirm</option>
                                <option value='manual'>Manual accept/reject</option>
                            </select>
                        ) : (
                            <p className='text-sm text-slate-600'>
                                {(profileData.appointmentApprovalMode || 'auto') === 'manual' ? 'Manual accept/reject' : 'Auto confirm'}
                            </p>
                        )}
                    </div>

                    <div className='mt-4'>
                        <p className='text-sm text-slate-700 mb-1'>Booking Schedule</p>
                        <p className='text-xs text-slate-500'>Optional: set fixed daily slot times (example: `10:00 AM, 06:00 PM`). If empty, patients see all 30-min slots.</p>
                        {isEdit ? (
                            <>
                                <input
                                    className='panel-input mt-2 w-full'
                                    value={slotTimesText}
                                    onChange={(e) => setSlotTimesText(e.target.value)}
                                    placeholder='10:00 AM, 06:00 PM'
                                />
                                <div className='mt-3'>
                                    <p className='text-xs font-semibold text-slate-600'>Working Days</p>
                                    <div className='mt-2 flex flex-wrap gap-2'>
                                        {daysOfWeek.map((label, idx) => {
                                            const active = Array.isArray(profileData.workingDays) && profileData.workingDays.includes(idx)
                                            return (
                                                <button
                                                    type='button'
                                                    key={label}
                                                    onClick={() => {
                                                        setProfileData((prev) => {
                                                            const current = Array.isArray(prev.workingDays) ? prev.workingDays : []
                                                            const next = active ? current.filter((d) => d !== idx) : [...current, idx]
                                                            return { ...prev, workingDays: next.sort((a, b) => a - b) }
                                                        })
                                                    }}
                                                    className={`panel-tab-btn ${active ? 'panel-tab-btn-active' : ''}`}
                                                >
                                                    {label}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    <p className='mt-2 text-xs text-slate-500'>If none selected, all days are allowed.</p>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className='text-sm text-slate-600 mt-2'>
                                    {Array.isArray(profileData.availableSlotTimes) && profileData.availableSlotTimes.length
                                        ? profileData.availableSlotTimes.join(', ')
                                        : 'Default (every 30 minutes)'
                                    }
                                </p>
                                <p className='text-xs text-slate-500 mt-1'>
                                    {Array.isArray(profileData.workingDays) && profileData.workingDays.length
                                        ? `Working: ${profileData.workingDays.map((d) => daysOfWeek[d]).join(', ')}`
                                        : 'Working: All days'
                                    }
                                </p>
                            </>
                        )}
                    </div>

                    <div className='mt-5'>
                        <p className='text-sm font-medium text-slate-800'>Patient Feedback</p>
                        <p className='text-sm text-slate-600 mt-1 flex items-center gap-2'>Rating: {renderStars(profileData.rating)} ({profileData.feedbackCount || 0} feedback)</p>
                        <div className='mt-2 space-y-2 max-h-52 overflow-y-auto pr-1'>
                            {profileData.feedbacks && profileData.feedbacks.length > 0 ? (
                                [...profileData.feedbacks].reverse().slice(0, 10).map((item, index) => (
                                    <div key={index} className='rounded-md p-2 border border-slate-200 bg-slate-50/60'>
                                        <p className='text-sm text-slate-800 font-medium flex items-center gap-2'>{item.userName} - {renderStars(item.rating)}</p>
                                        <p className='text-xs text-slate-600 mt-1'>{item.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className='text-xs text-gray-500'>No feedback yet.</p>
                            )}
                        </div>
                    </div>

                    {
                        isEdit
                            ? <button onClick={updateProfile} className='panel-outline-btn mt-5 rounded-full px-4 py-1'>Save</button>
                            : <button onClick={() => setIsEdit(prev => !prev)} className='panel-outline-btn mt-5 rounded-full px-4 py-1'>Edit</button>
                    }

                </div>
            </div>
        </div>
    )
}

export default DoctorProfile
