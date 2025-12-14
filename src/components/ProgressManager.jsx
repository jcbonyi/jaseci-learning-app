import React, { useState, useRef } from 'react'

/**
 * Progress Export/Import component
 * Allows users to backup and restore their learning progress
 */
export default function ProgressManager({ data, userId, onImport }) {
    const [showModal, setShowModal] = useState(false)
    const [importError, setImportError] = useState(null)
    const [importSuccess, setImportSuccess] = useState(false)
    const fileInputRef = useRef(null)

    // Export progress to JSON file
    function handleExport() {
        if (!data) return
        
        const exportData = {
            version: '1.0',
            exported_at: new Date().toISOString(),
            user_id: userId,
            completed_lessons: data.completed_lessons || [],
            concepts: data.concepts || {},
            notes: data.notes || {}
        }
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `jac-tutor-progress-${userId}-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    // Import progress from JSON file
    function handleImportClick() {
        fileInputRef.current?.click()
    }

    async function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return

        setImportError(null)
        setImportSuccess(false)

        try {
            const text = await file.text()
            const importData = JSON.parse(text)
            
            // Validate import data
            if (!importData.version || !importData.concepts) {
                throw new Error('Invalid progress file format')
            }

            // Call the import handler
            if (onImport) {
                await onImport(importData)
                setImportSuccess(true)
                setTimeout(() => {
                    setShowModal(false)
                    setImportSuccess(false)
                }, 1500)
            }
        } catch (err) {
            setImportError(err.message || 'Failed to import progress')
        }

        // Reset file input
        e.target.value = ''
    }

    return (
        <>
            {/* Trigger buttons */}
            <div className="flex gap-2">
                <button
                    onClick={handleExport}
                    className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                    title="Export your progress to a file"
                >
                    📤 Export
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                    title="Import progress from a file"
                >
                    📥 Import
                </button>
            </div>

            {/* Import Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            📥 Import Progress
                        </h3>
                        
                        <p className="text-sm text-gray-400 mb-4">
                            Import a previously exported progress file. This will merge with your current progress.
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {importError && (
                            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-300 text-sm">
                                ❌ {importError}
                            </div>
                        )}

                        {importSuccess && (
                            <div className="mb-4 p-3 bg-green-900/50 border border-green-500 rounded text-green-300 text-sm">
                                ✅ Progress imported successfully!
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={handleImportClick}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
                            >
                                Choose File
                            </button>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setImportError(null)
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded font-medium transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        <p className="text-xs text-gray-500 mt-4 text-center">
                            Only import files you exported from this app
                        </p>
                    </div>
                </div>
            )}
        </>
    )
}

