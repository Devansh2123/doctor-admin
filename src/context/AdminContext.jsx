import axios from "axios";
import { createContext, useState } from "react";
import { toast } from "react-toastify";
import safeStorage from "../utils/safeStorage";


export const AdminContext = createContext()

const AdminContextProvider = (props) => {

    const backendUrl = import.meta.env.VITE_BACKEND_URL

    const [aToken, setAToken] = useState(() => safeStorage.get('aToken') || '')

    const [appointments, setAppointments] = useState([])
    const [doctors, setDoctors] = useState([])
    const [users, setUsers] = useState([])
    const [dashData, setDashData] = useState(false)
    const [uploadingPrescriptionFor, setUploadingPrescriptionFor] = useState('')

    // Getting all Doctors data from Database using API
    const getAllDoctors = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/all-doctors', { headers: { aToken } })
            if (data.success) {
                setDoctors(data.doctors)
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
        }

    }

    // Function to change doctor availablity using API
    const changeAvailability = async (docId) => {
        try {

            const { data } = await axios.post(backendUrl + '/api/admin/change-availability', { docId }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const updateDoctorApproval = async (docId, isApproved) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-doctor-approval', { docId, isApproved }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateDoctorBlock = async (docId, isBlocked) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-doctor-block', { docId, isBlocked }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllDoctors()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const getAllUsers = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/admin/all-users', { headers: { aToken } })
            if (data.success) {
                setUsers(data.users)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }

    const updateUserBlock = async (userId, isBlocked) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/admin/update-user-block', { userId, isBlocked }, { headers: { aToken } })
            if (data.success) {
                toast.success(data.message)
                getAllUsers()
                getDashData()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(error.message)
        }
    }


    // Getting all appointment data from Database using API
    const getAllAppointments = async () => {

        try {

            const { data } = await axios.get(backendUrl + '/api/admin/appointments', { headers: { aToken } })
            if (data.success) {
                setAppointments(data.appointments.reverse())
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Function to cancel appointment using API
    const cancelAppointment = async (appointmentId) => {

        try {

            const { data } = await axios.post(backendUrl + '/api/admin/cancel-appointment', { appointmentId }, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
            } else {
                toast.error(data.message)
            }

        } catch (error) {
            toast.error(error.message)
            console.log(error)
        }

    }

    // Function to upload prescription using Admin API
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

            const { data } = await axios.post(backendUrl + '/api/admin/upload-prescription', formData, { headers: { aToken } })

            if (data.success) {
                toast.success(data.message)
                getAllAppointments()
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

    // Function to download report PDF using Admin API
    const downloadReport = async (appointmentId) => {
        try {
            const response = await axios.get(backendUrl + `/api/admin/download-report/${appointmentId}`, {
                headers: { aToken },
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

    // Getting Admin Dashboard data from Database using API
    const getDashData = async () => {
        try {

            const { data } = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { aToken } })

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
        aToken, setAToken,
        doctors,
        users,
        getAllDoctors,
        getAllUsers,
        changeAvailability,
        updateDoctorApproval,
        updateDoctorBlock,
        updateUserBlock,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
        uploadPrescription,
        downloadReport,
        uploadingPrescriptionFor
    }

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    )

}

export default AdminContextProvider
