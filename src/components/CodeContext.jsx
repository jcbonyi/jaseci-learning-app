import React, { createContext, useContext, useState } from 'react'

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

export function TryInPlaygroundButton({ code, className = '' }) {
    const { setCodeToTry } = useCode()

    const handleClick = () => {
        setCodeToTry(code)
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

