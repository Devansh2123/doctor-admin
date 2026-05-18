import { createContext } from "react";
import backendUrl from "../config/backend";


export const AppContext = createContext()

const AppContextProvider = (props) => {

    const rawCurrency = import.meta.env.VITE_CURRENCY
    const normalizedCurrency = rawCurrency === '\\u20B9' ? '\u20B9' : rawCurrency
    const currency = normalizedCurrency === 'INR' ? '\u20B9' : normalizedCurrency
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    // Function to calculate the age eg. ( 20_01_2000 => 24 )
    const calculateAge = (dob) => {
        if (!dob || dob === 'Not Selected') return '-'

        const today = new Date()
        const birthDate = new Date(dob)

        if (Number.isNaN(birthDate.getTime())) return '-'

        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        const dayDiff = today.getDate() - birthDate.getDate()

        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
            age -= 1
        }

        return age >= 0 ? age : '-'
    }

    const value = {
        backendUrl,
        currency,
        slotDateFormat,
        calculateAge
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )

}

export default AppContextProvider
