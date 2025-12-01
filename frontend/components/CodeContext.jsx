import React, { createContext, useContext, useState } from 'react'

/**
 * Context for sharing code between components
 * Allows "Try in Playground" functionality from lessons/examples
 */
const CodeContext = createContext({
    codeToTry: null,
    setCodeToTry: () => {},
    clearCode: () => {}
})

export function useCode() {
    return useContext(CodeContext)
}

export default function CodeProvider({ children }) {
    const [codeToTry, setCodeToTry] = useState(null)

    const clearCode = () => setCodeToTry(null)

    return (
        <CodeContext.Provider value={{ codeToTry, setCodeToTry, clearCode }}>
            {children}
        </CodeContext.Provider>
    )
}

/**
 * Button to send code to the playground
 */
export function TryInPlaygroundButton({ code, className = '' }) {
    const { setCodeToTry } = useCode()

    const handleClick = () => {
        setCodeToTry(code)
        // Scroll to playground
        const playground = document.getElementById('code-playground')
        if (playground) {
            playground.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    return (
        <button
            onClick={handleClick}
            className={`text-xs bg-purple-600 hover:bg-purple-700 text-white px-2 py-1 rounded transition-colors ${className}`}
            title="Open this code in the Code Playground"
        >
            🧪 Try it
        </button>
    )
}

