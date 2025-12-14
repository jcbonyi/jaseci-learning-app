import React, { useState, useEffect } from 'react'

/**
 * Quiz History component
 * Stores and displays past quiz results for review
 */

// Get quiz history from localStorage
function getQuizHistory(userId) {
    try {
        const key = `jac-tutor-quiz-history-${userId}`
        const data = localStorage.getItem(key)
        return data ? JSON.parse(data) : []
    } catch {
        return []
    }
}

// Save quiz to history
export function saveQuizToHistory(userId, quizResult) {
    try {
        const key = `jac-tutor-quiz-history-${userId}`
        const history = getQuizHistory(userId)
        
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            concept: quizResult.concept,
            score: quizResult.score,
            passed: quizResult.score >= 70,
            questions: quizResult.questions,
            answers: quizResult.answers
        }
        
        // Keep last 20 quiz attempts
        const updated = [entry, ...history].slice(0, 20)
        localStorage.setItem(key, JSON.stringify(updated))
        
        return entry
    } catch (err) {
        console.error('Failed to save quiz history:', err)
        return null
    }
}

// Clear quiz history
export function clearQuizHistory(userId) {
    try {
        const key = `jac-tutor-quiz-history-${userId}`
        localStorage.removeItem(key)
    } catch {}
}

export default function QuizHistory({ userId, onReview }) {
    const [history, setHistory] = useState([])
    const [showAll, setShowAll] = useState(false)
    const [reviewQuiz, setReviewQuiz] = useState(null)

    useEffect(() => {
        setHistory(getQuizHistory(userId))
    }, [userId])

    if (history.length === 0) {
        return (
            <div className="text-sm text-gray-500 text-center py-4">
                No quiz history yet. Complete some quizzes to see your results here.
            </div>
        )
    }

    const displayHistory = showAll ? history : history.slice(0, 5)

    return (
        <div className="space-y-3">
            {/* Review Modal */}
            {reviewQuiz && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto border border-gray-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-white">
                                📝 Review: {reviewQuiz.concept}
                            </h3>
                            <button 
                                onClick={() => setReviewQuiz(null)}
                                className="text-gray-400 hover:text-white text-xl"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className={`p-3 rounded-lg mb-4 ${reviewQuiz.passed ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                            <div className="text-lg font-bold text-white">
                                Score: {reviewQuiz.score}% {reviewQuiz.passed ? '✓ Passed' : '✗ Failed'}
                            </div>
                            <div className="text-xs text-gray-400">
                                {new Date(reviewQuiz.timestamp).toLocaleString()}
                            </div>
                        </div>

                        <div className="space-y-4">
                            {reviewQuiz.questions?.map((q, i) => {
                                const userAnswer = reviewQuiz.answers?.[i]
                                const isCorrect = userAnswer === q.answer
                                
                                return (
                                    <div key={i} className="p-4 bg-gray-700 rounded-lg">
                                        <h4 className="text-sm font-medium text-white mb-3">
                                            Q{i + 1}: {q.q}
                                        </h4>
                                        
                                        {q.options?.map((opt, j) => {
                                            const isUserAnswer = opt === userAnswer
                                            const isCorrectAnswer = opt === q.answer
                                            
                                            return (
                                                <div 
                                                    key={j}
                                                    className={`p-2 rounded mb-1 text-sm ${
                                                        isCorrectAnswer 
                                                            ? 'bg-green-800 text-green-200' 
                                                            : isUserAnswer 
                                                                ? 'bg-red-800 text-red-200'
                                                                : 'bg-gray-600 text-gray-300'
                                                    }`}
                                                >
                                                    {opt}
                                                    {isCorrectAnswer && ' ✓'}
                                                    {isUserAnswer && !isCorrectAnswer && ' ✗ (your answer)'}
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}
                        </div>

                        <button 
                            onClick={() => setReviewQuiz(null)}
                            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded font-medium"
                        >
                            Close Review
                        </button>
                    </div>
                </div>
            )}

            {/* History List */}
            {displayHistory.map((quiz) => (
                <div 
                    key={quiz.id}
                    className="flex items-center justify-between p-3 bg-gray-700 rounded-lg hover:bg-gray-600 cursor-pointer transition-colors"
                    onClick={() => setReviewQuiz(quiz)}
                >
                    <div className="flex items-center gap-3">
                        <span className={`text-lg ${quiz.passed ? '✓' : '✗'}`}>
                            {quiz.passed ? '✅' : '❌'}
                        </span>
                        <div>
                            <div className="text-sm font-medium text-white">{quiz.concept}</div>
                            <div className="text-xs text-gray-400">
                                {new Date(quiz.timestamp).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className={`text-lg font-bold ${quiz.passed ? 'text-green-400' : 'text-red-400'}`}>
                        {quiz.score}%
                    </div>
                </div>
            ))}

            {history.length > 5 && (
                <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-sm text-blue-400 hover:text-blue-300 py-2"
                >
                    {showAll ? 'Show Less' : `Show All (${history.length})`}
                </button>
            )}

            {history.length > 0 && (
                <button
                    onClick={() => {
                        if (confirm('Clear all quiz history?')) {
                            clearQuizHistory(userId)
                            setHistory([])
                        }
                    }}
                    className="w-full text-xs text-gray-500 hover:text-red-400 py-1"
                >
                    Clear History
                </button>
            )}
        </div>
    )
}

