import { useState, useEffect } from 'react'

export function useUser() {
    // Start with mounted = true to prevent delay
    const [mounted, setMounted] = useState(true)
    const [userToken, setUserToken] = useState<string>('')
    const [userName, setUserName] = useState<string>('')

    useEffect(() => {
        setMounted(true)
        return () => {}
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token')
            const username = localStorage.getItem('username')
            setUserToken(token || '')
            setUserName(username || '')
            console.log('👤 User data loaded:', { username: username || 'none', hasToken: !!token })
        }
    }, [])

    return { mounted, userToken, userName }
}
