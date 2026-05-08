/* eslint-disable react/prop-types */
import { createContext, useRef, useState } from "react";
import axios from 'axios';
import { toast } from 'react-toastify';
import safeStorage from "../utils/safeStorage";


export const DoctorContext = createContext()

const DoctorContextProvider = ({ children }) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [dToken, setDToken] = useState(() => safeStorage.get('dToken') || '')
    const [appointments, setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)
    const [uploadingPrescriptionFor, setUploadingPrescriptionFor] = useState('')
    const [savingMedicalHistoryFor, setSavingMedicalHistoryFor] = useState('')
    const [patientMedicalHistoryMap, setPatientMedicalHistoryMap] = useState({})
    const appointmentsRequestRef = useRef(null)
    const dashboardRequestRef = useRef(null)
    const appointmentsLoadedRef = useRef(false)
    const dashboardLoadedRef = useRef(false)

    // Getting Doctor appointment data from Database using API
    const getAppointments = async (force = false) => {
        if (!force && appointmentsLoadedRef.current) return
        if (!force && appointmentsRequestRef.current) return appointmentsRequestRef.current

        appointmentsRequestRef.current = (async () => {
            try {

                const { data } = await axios.get(backendUrl + '/api/doctor/appointments', { headers: { dToken } })

                if (data.success) {
                    setAppointments(data.appointments.reverse())
                    appointmentsLoadedRef.current = true
                } else {
                    toast.error(data.message)
                }

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            } finally {
                appointmentsRequestRef.current = null
            }
        })()

        return appointmentsRequestRef.current
    }

    // Getting Doctor profile data from Database using API
    const getProfileData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/doctor/profile', { headers: { dToken } })
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
                getAppointments(true)
                // after creating dashboard
                getDashData(true)
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
                getAppointments(true)
                // Later after creating getDashData Function
                getDashData(true)
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
                getAppointments(true)
                getDashData(true)
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
                getAppointments(true)
                getDashData(true)
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
                getAppointments(true)
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

    // Function to view prescription for doctor appointment in browser
    const viewPrescription = (appointmentId, prescriptionUrl = '') => {
        try {
            const safeToken = encodeURIComponent(dToken || '')
            const url = `${backendUrl}/api/doctor/view-prescription/${appointmentId}?token=${safeToken}`
            window.open(url, '_blank', 'noopener,noreferrer')
        } catch (error) {
            if (prescriptionUrl) {
                window.open(prescriptionUrl, '_blank', 'noopener,noreferrer')
                toast.warning('Secure preview failed, opened direct file link instead.')
                return
            }
            toast.error('Unable to open prescription file')
            console.log(error)
        }
    }

    // Function to save medical history against appointment
    const saveMedicalHistory = async (appointmentId, medicalData) => {
        try {
            setSavingMedicalHistoryFor(appointmentId)
            const { data } = await axios.post(
                backendUrl + '/api/doctor/medical-history',
                { appointmentId, ...medicalData },
                { headers: { dToken } }
            )

            if (data.success) {
                toast.success(data.message)
                await getAppointments(true)
            } else {
                toast.error(data.message)
            }
            return data
        } catch (error) {
            toast.error(error.message)
            console.log(error)
            return { success: false, message: error.message }
        } finally {
            setSavingMedicalHistoryFor('')
        }
    }

    // Function to fetch patient's past medical history entries
    const getPatientMedicalHistory = async (userId) => {
        try {
            const { data } = await axios.get(backendUrl + `/api/doctor/medical-history/${userId}`, { headers: { dToken } })

            if (data.success) {
                setPatientMedicalHistoryMap((prev) => ({ ...prev, [userId]: data.history || [] }))
                return data.history || []
            }

            toast.error(data.message)
            return []
        } catch (error) {
            toast.error(error.message)
            console.log(error)
            return []
        }
    }

    // Getting Doctor dashboard data using API
    const getDashData = async (force = false) => {
        if (!force && dashboardLoadedRef.current) return
        if (!force && dashboardRequestRef.current) return dashboardRequestRef.current

        dashboardRequestRef.current = (async () => {
            try {

                const { data } = await axios.get(backendUrl + '/api/doctor/dashboard', { headers: { dToken } })

                if (data.success) {
                    setDashData(data.dashData)
                    dashboardLoadedRef.current = true
                } else {
                    toast.error(data.message)
                }

            } catch (error) {
                console.log(error)
                toast.error(error.message)
            } finally {
                dashboardRequestRef.current = null
            }
        })()

        return dashboardRequestRef.current
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
        viewPrescription,
        downloadReport,
        uploadingPrescriptionFor,
        saveMedicalHistory,
        savingMedicalHistoryFor,
        getPatientMedicalHistory,
        patientMedicalHistoryMap,
        dashData, getDashData,
        profileData, setProfileData,
        getProfileData,
    }

    return (
        <DoctorContext.Provider value={value}>
            {children}
        </DoctorContext.Provider>
    )


}

export default DoctorContextProvider
