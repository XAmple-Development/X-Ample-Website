'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const PurchasesContext = createContext()

export function PurchasesProvider({ children }) {
    const [purchases, setPurchases] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPurchases = async () => {
            setLoading(true)
            setError(null)

            const userData = JSON.parse(Cookies.get('user') || 'null')
            const id = userData?.id || "None"

            try {
                const response = await fetch(`/api/fetchPurchases`, {
                    method: 'POST',
                    body: JSON.stringify({ userId: id }),
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }

                const data = await response.json()
                setPurchases(data)
            } catch (error) {
                setError(error.message)
            } finally {
                setLoading(false)
            }
        }

        if (Cookies.get('user') && purchases === null) {
            fetchPurchases()
        }
    }, [])

    return (
        <PurchasesContext.Provider value={{ purchases, loading, error }}>
            {children}
        </PurchasesContext.Provider>
    )
}

export function usePurchases() {
    const context = useContext(PurchasesContext)
    if (context === undefined) {
        throw new Error('usePurchases must be used within a PurchasesProvider')
    }
    return context
} 