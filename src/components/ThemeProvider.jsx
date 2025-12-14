import React, { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext({
    theme: 'dark',
    toggleTheme: () => {},
    isDark: true
})

export function useTheme() {
    return useContext(ThemeContext)
}

export default function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('jac-tutor-theme')
            if (saved) return saved
            return 'dark'
        }
        return 'dark'
    })

    useEffect(() => {
        localStorage.setItem('jac-tutor-theme', theme)
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function ThemeToggle() {
    const { theme, toggleTheme, isDark } = useTheme()
    
    return (
        <button
            onClick={toggleTheme}
            className={`
                p-2 rounded-lg transition-all duration-300
                ${isDark 
                    ? 'bg-gray-700 hover:bg-gray-600 text-yellow-400' 
                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                }
            `}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            aria-label="Toggle theme"
        >
            {isDark ? '☀️' : '🌙'}
        </button>
    )
}

