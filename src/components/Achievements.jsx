import React from 'react'

/**
 * Achievement badge definitions
 */
const ACHIEVEMENTS = [
    {
        id: 'first_lesson',
        name: 'First Steps',
        icon: '🎯',
        description: 'Complete your first lesson',
        check: (data) => data.completed_lessons?.length >= 1
    },
    {
        id: 'first_quiz',
        name: 'Quiz Taker',
        icon: '📝',
        description: 'Pass your first quiz',
        check: (data) => {
            const concepts = data.concepts || {}
            return Object.values(concepts).some(c => (c.score || 0) >= 70)
        }
    },
    {
        id: 'three_concepts',
        name: 'Quick Learner',
        icon: '🚀',
        description: 'Reach 70% on 3 concepts',
        check: (data) => {
            const concepts = data.concepts || {}
            return Object.values(concepts).filter(c => (c.score || 0) >= 70).length >= 3
        }
    },
    {
        id: 'first_mastery',
        name: 'Master',
        icon: '👑',
        description: 'Master your first concept (85%+)',
        check: (data) => {
            const concepts = data.concepts || {}
            return Object.values(concepts).some(c => (c.score || 0) >= 85)
        }
    },
    {
        id: 'half_complete',
        name: 'Halfway There',
        icon: '⭐',
        description: 'Complete half of all lessons',
        check: (data) => data.completed_lessons?.length >= 4
    },
    {
        id: 'all_lessons',
        name: 'Scholar',
        icon: '🎓',
        description: 'Complete all 7 lessons',
        check: (data) => data.completed_lessons?.length >= 7
    },
    {
        id: 'perfect_score',
        name: 'Perfectionist',
        icon: '💯',
        description: 'Score 100% on any concept',
        check: (data) => {
            const concepts = data.concepts || {}
            return Object.values(concepts).some(c => c.score === 100)
        }
    },
    {
        id: 'all_mastery',
        name: 'Jac Expert',
        icon: '🏆',
        description: 'Master all 7 concepts',
        check: (data) => {
            const concepts = data.concepts || {}
            return Object.values(concepts).filter(c => (c.score || 0) >= 85).length >= 7
        }
    }
]

/**
 * Get earned achievements for a user's data
 */
export function getEarnedAchievements(data) {
    if (!data) return []
    return ACHIEVEMENTS.filter(a => a.check(data))
}

/**
 * Achievement badge component
 */
export function AchievementBadge({ achievement, earned = false, size = 'md' }) {
    const sizes = {
        sm: 'w-8 h-8 text-lg',
        md: 'w-12 h-12 text-2xl',
        lg: 'w-16 h-16 text-3xl'
    }
    
    return (
        <div 
            className={`
                ${sizes[size]} rounded-full flex items-center justify-center
                ${earned 
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-600 shadow-lg shadow-yellow-500/30' 
                    : 'bg-gray-700 opacity-40'
                }
                transition-all duration-300 hover:scale-110
            `}
            title={earned ? `${achievement.name}: ${achievement.description}` : `Locked: ${achievement.description}`}
        >
            <span className={earned ? '' : 'grayscale'}>{achievement.icon}</span>
        </div>
    )
}

/**
 * Achievement display panel
 */
export default function Achievements({ data }) {
    const earned = getEarnedAchievements(data)
    const earnedIds = new Set(earned.map(a => a.id))
    
    return (
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                🏅 Achievements
                <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">
                    {earned.length}/{ACHIEVEMENTS.length}
                </span>
            </h3>
            
            <div className="grid grid-cols-4 gap-2">
                {ACHIEVEMENTS.map(achievement => (
                    <AchievementBadge 
                        key={achievement.id}
                        achievement={achievement}
                        earned={earnedIds.has(achievement.id)}
                        size="sm"
                    />
                ))}
            </div>
            
            {/* Recently earned */}
            {earned.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-700">
                    <h4 className="text-xs text-gray-400 mb-2">Latest Earned</h4>
                    <div className="space-y-1">
                        {earned.slice(-3).reverse().map(a => (
                            <div key={a.id} className="flex items-center gap-2 text-sm">
                                <span>{a.icon}</span>
                                <span className="text-yellow-400 font-medium">{a.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}

