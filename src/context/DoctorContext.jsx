import { createContext, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import safeStorage from "../utils/safeStorage";


export const DoctorContext = createContext()

const DoctorContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(() => safeStorage.get('dToken') || '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)
    const [uploadingPrescriptionFor, setUploadingPrescriptionFor] = useState('')

    // Getting Doctor appointment data from Database using API
    const getAppointments = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Getting Doctor profile data from Database using API
    const getProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
            console.log(data.profileData)
            setProfileData(data.profileData)

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    // Function to cancel doctor appointment using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/cancel-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                // after creating dashboard
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Function to Mark appointment completed using API
    const completeAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/doctor/complete-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                // Later after creating getDashData Function
                getDashData()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Function to approve pending appointment request
    const approveAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/doctor/approve-appointment', { appointmentId }, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Function to reject pending appointment request with optional reason
    const rejectAppointment = async (appointmentId, reason = '') => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/doctor/reject-appointment',
                { appointmentId, reason },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                getAppointments()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }
    }

    // Function to upload prescription for a doctor appointment
    const uploadPrescription = async (appointmentId, file) => {
        try {
            if (!file) {
                toast.warning('Please select a prescription file first')
                return
            }

            setUploadingPrescriptionFor(appointmentId)

            const formData = new FormData()
            formData.append('appointmentId', appointmentId)
            formData.append('prescription', file)

            const { data } = await axios.post(backendUrl + '/api/doctor/upload-prescription', formData, { headers: { dToken } })

            if (data.success) {
                toast.success(data.message)
                getAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
            console.log(error)
        } finally {
            setUploadingPrescriptionFor('')
        }
    }

    // Function to download report PDF for doctor appointment
    const downloadReport = async (appointmentId) => {
        try {
            const response = await axios.get(backendUrl + `/api/doctor/download-report/${appointmentId}`, {
                headers: { dToken },
                responseType: 'blob'
            })

            const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
            const link = document.createElement('a')
            link.href = blobUrl
            link.setAttribute('download', `appointment-report-${appointmentId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            toast.error('Unable to download report')
            console.log(error)
        }
    }

    // Getting Doctor dashboard data using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

            if (data.success) {
                setDashData(data.dashData)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }

    }

    const value = {
        dToken, setDToken, backendUrl,
        appointments,
        getAppointments,
        cancelAppointment,
        completeAppointment,
        approveAppointment,
        rejectAppointment,
        uploadPrescription,
        downloadReport,
        uploadingPrescriptionFor,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
    }

    return (
        <DoctorContext.Provider value={value}>
            {props.children}
        </DoctorContext.Provider>
    )


}

export default DoctorContextProvider
