import React from 'react'

export default function ConceptCard({concept, onClick, isSelected}) {
    const score = concept.score || 0
    const required = concept.required || 70
    const mastery = concept.mastery || 85
    
    // Determine status color based on score
    let statusColor = 'bg-gray-600' // Not started
    let statusText = 'Not Started'
    
    if (score >= mastery) {
        statusColor = 'bg-green-600'
        statusText = 'Mastered'
    } else if (score >= required) {
        statusColor = 'bg-blue-600'
        statusText = 'Proficient'
    } else if (score > 0) {
        statusColor = 'bg-yellow-600'
        statusText = 'In Progress'
    }

    return (
        <div 
            className={`bg-gray-700 rounded-lg p-4 border-2 transition-all cursor-pointer ${
                isSelected 
                    ? 'border-blue-500 bg-gray-650 ring-2 ring-blue-500/30' 
                    : 'border-gray-600 hover:border-blue-400 hover:bg-gray-650'
            }`}
            onClick={() => onClick && onClick(concept)}
        >
            <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-white">{concept.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${statusColor} text-white`}>
                    {statusText}
                </span>
            </div>
            {concept.description && (
                <p className="text-sm text-gray-400 mb-3">{concept.description}</p>
            )}
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                    <span>Score: {score}%</span>
                    <span>Mastery: {mastery}%</span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                    <div 
                        className={`h-2 rounded-full ${score >= mastery ? 'bg-green-500' : score >= required ? 'bg-blue-500' : 'bg-yellow-500'}`}
                        style={{width: `${Math.min(score, 100)}%`}}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Required: {required}%</span>
                </div>
            </div>
        </div>
    )
}

