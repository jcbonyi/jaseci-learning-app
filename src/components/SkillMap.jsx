import React from 'react'

export default function SkillMap({concepts}) {
    if (!concepts || Object.keys(concepts).length === 0) {
        return (
            <div className="p-4 bg-gray-700 rounded-lg text-gray-400 text-sm">
                No concepts to display
            </div>
        )
    }

    const conceptList = Object.entries(concepts).map(([name, data]) => ({
        name,
        score: data.score || 0,
        required: data.required || 70,
        mastery: data.mastery || 85
    }))

    // Sort by score descending
    conceptList.sort((a, b) => b.score - a.score)

    return (
        <div className="p-4 bg-gray-700 rounded-lg">
            <div className="space-y-3">
                {conceptList.map((c, i) => {
                    const percent = Math.min(c.score, 100)
                    let barColor = 'bg-gray-500'
                    if (c.score >= c.mastery) barColor = 'bg-green-500'
                    else if (c.score >= c.required) barColor = 'bg-blue-500'
                    else if (c.score > 0) barColor = 'bg-yellow-500'

                    return (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-24 text-xs text-gray-300 truncate" title={c.name}>
                                {c.name}
                            </div>
                            <div className="flex-1 bg-gray-600 rounded-full h-2">
                                <div 
                                    className={`h-2 rounded-full ${barColor} transition-all duration-300`}
                                    style={{width: `${percent}%`}}
                                />
                            </div>
                            <div className="w-10 text-xs text-gray-400 text-right">
                                {c.score}%
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

