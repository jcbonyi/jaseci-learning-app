import React, { useState, useEffect, useMemo } from 'react'

/**
 * Learning Analytics Dashboard
 * Shows detailed statistics about learning progress
 */

// Get learning stats from localStorage
function getLearningStats(userId) {
    try {
        const key = `jac-tutor-stats-${userId}`
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : { sessions: [], quizAttempts: 0, timeSpent: 0 }
    } catch {
        return { sessions: [], quizAttempts: 0, timeSpent: 0 }
    }
}

// Track a learning session
export function trackSession(userId, action, data = {}) {
    try {
        const key = `jac-tutor-stats-${userId}`
        const stats = getLearningStats(userId)
        
        stats.sessions.push({
            timestamp: new Date().toISOString(),
            action,
            ...data
        })
        
        // Keep last 100 sessions
        stats.sessions = stats.sessions.slice(-100)
        
        if (action === 'quiz_complete') {
            stats.quizAttempts = (stats.quizAttempts || 0) + 1
        }
        
        localStorage.setItem(key, JSON.stringify(stats))
    } catch {}
}

export default function Analytics({ userId, dashboardData }) {
    const [showModal, setShowModal] = useState(false)
    const stats = useMemo(() => getLearningStats(userId), [userId])
    
    // Calculate analytics from dashboard data
    const analytics = useMemo(() => {
        if (!dashboardData?.concepts) return null
        
        const concepts = Object.values(dashboardData.concepts)
        const completedLessons = dashboardData.completed_lessons || []
        
        // Calculate averages and totals
        const totalScore = concepts.reduce((sum, c) => sum + (c.score || 0), 0)
        const avgScore = Math.round(totalScore / concepts.length)
        const masteredCount = concepts.filter(c => (c.score || 0) >= 85).length
        const passedCount = concepts.filter(c => (c.score || 0) >= 70).length
        const inProgressCount = concepts.filter(c => (c.score || 0) > 0 && (c.score || 0) < 70).length
        const notStartedCount = concepts.filter(c => (c.score || 0) === 0).length
        
        // Score distribution
        const scoreDistribution = [
            { range: '0-20%', count: concepts.filter(c => (c.score || 0) <= 20).length, color: 'bg-red-500' },
            { range: '21-40%', count: concepts.filter(c => (c.score || 0) > 20 && (c.score || 0) <= 40).length, color: 'bg-orange-500' },
            { range: '41-60%', count: concepts.filter(c => (c.score || 0) > 40 && (c.score || 0) <= 60).length, color: 'bg-yellow-500' },
            { range: '61-80%', count: concepts.filter(c => (c.score || 0) > 60 && (c.score || 0) <= 80).length, color: 'bg-blue-500' },
            { range: '81-100%', count: concepts.filter(c => (c.score || 0) > 80).length, color: 'bg-green-500' },
        ]
        
        // Concept breakdown by difficulty
        const byDifficulty = {
            easy: concepts.filter(c => c.difficulty === 1),
            medium: concepts.filter(c => c.difficulty === 2),
            hard: concepts.filter(c => c.difficulty === 3)
        }
        
        return {
            totalConcepts: concepts.length,
            completedLessons: completedLessons.length,
            avgScore,
            masteredCount,
            passedCount,
            inProgressCount,
            notStartedCount,
            scoreDistribution,
            byDifficulty,
            concepts,
            quizAttempts: stats.quizAttempts || 0
        }
    }, [dashboardData, stats])

    if (!analytics) return null

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 text-xs bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-3 py-1.5 rounded transition-all"
            >
                📈 Analytics
            </button>

            {/* Analytics Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-3xl w-full max-h-[85vh] overflow-y-auto border border-gray-700 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                📊 Learning Analytics
                            </h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-400 hover:text-white text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white">{analytics.avgScore}%</div>
                                <div className="text-xs text-blue-200">Avg Score</div>
                            </div>
                            <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white">{analytics.masteredCount}</div>
                                <div className="text-xs text-green-200">Mastered</div>
                            </div>
                            <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white">{analytics.completedLessons}</div>
                                <div className="text-xs text-purple-200">Lessons Done</div>
                            </div>
                            <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-lg p-4 text-center">
                                <div className="text-3xl font-bold text-white">{analytics.quizAttempts}</div>
                                <div className="text-xs text-orange-200">Quiz Attempts</div>
                            </div>
                        </div>

                        {/* Progress Overview */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Progress Overview</h3>
                            <div className="flex gap-2 h-8 rounded overflow-hidden">
                                {analytics.masteredCount > 0 && (
                                    <div 
                                        className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                                        style={{ flex: analytics.masteredCount }}
                                        title={`${analytics.masteredCount} Mastered`}
                                    >
                                        {analytics.masteredCount > 0 && `${analytics.masteredCount} 👑`}
                                    </div>
                                )}
                                {(analytics.passedCount - analytics.masteredCount) > 0 && (
                                    <div 
                                        className="bg-blue-500 flex items-center justify-center text-xs text-white font-medium"
                                        style={{ flex: analytics.passedCount - analytics.masteredCount }}
                                        title={`${analytics.passedCount - analytics.masteredCount} Passed`}
                                    >
                                        {(analytics.passedCount - analytics.masteredCount) > 0 && `${analytics.passedCount - analytics.masteredCount} ✓`}
                                    </div>
                                )}
                                {analytics.inProgressCount > 0 && (
                                    <div 
                                        className="bg-yellow-500 flex items-center justify-center text-xs text-white font-medium"
                                        style={{ flex: analytics.inProgressCount }}
                                        title={`${analytics.inProgressCount} In Progress`}
                                    >
                                        {analytics.inProgressCount > 0 && `${analytics.inProgressCount} 🔄`}
                                    </div>
                                )}
                                {analytics.notStartedCount > 0 && (
                                    <div 
                                        className="bg-gray-600 flex items-center justify-center text-xs text-white font-medium"
                                        style={{ flex: analytics.notStartedCount }}
                                        title={`${analytics.notStartedCount} Not Started`}
                                    >
                                        {analytics.notStartedCount > 0 && `${analytics.notStartedCount} ⏳`}
                                    </div>
                                )}
                            </div>
                            <div className="flex gap-4 mt-2 text-xs text-gray-400">
                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-500 rounded"></span> Mastered (85%+)</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-500 rounded"></span> Passed (70%+)</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-500 rounded"></span> In Progress</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 bg-gray-600 rounded"></span> Not Started</span>
                            </div>
                        </div>

                        {/* Score Distribution */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Score Distribution</h3>
                            <div className="space-y-2">
                                {analytics.scoreDistribution.map((item) => (
                                    <div key={item.range} className="flex items-center gap-3">
                                        <span className="text-xs text-gray-400 w-16">{item.range}</span>
                                        <div className="flex-1 bg-gray-700 rounded-full h-4 overflow-hidden">
                                            <div 
                                                className={`h-full ${item.color} transition-all`}
                                                style={{ width: `${(item.count / analytics.totalConcepts) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-gray-400 w-8">{item.count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Concept Breakdown */}
                        <div className="mb-6">
                            <h3 className="text-sm font-semibold text-gray-400 mb-3">Concept Details</h3>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                                {analytics.concepts
                                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                                    .map((concept) => (
                                    <div key={concept.name} className="flex items-center gap-3 p-2 bg-gray-700 rounded">
                                        <span className="text-sm font-medium text-white flex-1">{concept.name}</span>
                                        <span className="text-xs text-gray-400">
                                            {'⭐'.repeat(concept.difficulty || 1)}
                                        </span>
                                        <div className="w-24 bg-gray-600 rounded-full h-2 overflow-hidden">
                                            <div 
                                                className={`h-full ${
                                                    (concept.score || 0) >= 85 ? 'bg-green-500' :
                                                    (concept.score || 0) >= 70 ? 'bg-blue-500' :
                                                    (concept.score || 0) > 0 ? 'bg-yellow-500' : 'bg-gray-500'
                                                }`}
                                                style={{ width: `${concept.score || 0}%` }}
                                            />
                                        </div>
                                        <span className={`text-sm font-bold w-12 text-right ${
                                            (concept.score || 0) >= 85 ? 'text-green-400' :
                                            (concept.score || 0) >= 70 ? 'text-blue-400' :
                                            (concept.score || 0) > 0 ? 'text-yellow-400' : 'text-gray-500'
                                        }`}>
                                            {concept.score || 0}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tips */}
                        <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-blue-400 mb-2">💡 Tips</h3>
                            <ul className="text-xs text-gray-300 space-y-1">
                                {analytics.avgScore < 50 && (
                                    <li>• Focus on completing more quizzes to improve your average score</li>
                                )}
                                {analytics.masteredCount < analytics.totalConcepts && (
                                    <li>• Keep practicing to master all {analytics.totalConcepts} concepts</li>
                                )}
                                {analytics.notStartedCount > 0 && (
                                    <li>• You have {analytics.notStartedCount} concepts to explore!</li>
                                )}
                                {analytics.avgScore >= 80 && (
                                    <li>• Great job! You're making excellent progress 🎉</li>
                                )}
                            </ul>
                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

