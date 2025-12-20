import React, {useState} from 'react'

export default function QuizPage({quiz, userId}) {
    const [answers, setAnswers] = useState({})
    const [result, setResult] = useState(null)
    const [loading, setLoading] = useState(false)

    function setAnswer(idx, val) {
        setAnswers(prev => ({...prev, [idx]: val}))
    }

    async function submit() {
        setLoading(true)
        try {
            // Evaluate quiz locally (no backend walker needed)
            if (!quiz || !quiz.questions) {
                setResult({ error: 'No quiz data available' })
                return
            }
            
            let correct = 0
            const results = []
            
            quiz.questions.forEach((q, i) => {
                const userAnswer = answers[String(i)]
                const correctAnswer = q.answer
                const isCorrect = userAnswer === correctAnswer
                
                if (isCorrect) {
                    correct++
                }
                
                results.push({
                    question: q.q,
                    userAnswer: userAnswer || '(not answered)',
                    correctAnswer: correctAnswer,
                    isCorrect: isCorrect
                })
            })
            
            const score = Math.round((correct / quiz.questions.length) * 100)
            const passed = score >= (quiz.passing_score || 70)
            
            // Save to quiz history
            if (userId && quiz.concept) {
                saveQuizToHistory(userId, {
                    concept: quiz.concept,
                    score: score,
                    questions: quiz.questions,
                    answers: answers
                })
            }
            
            setResult({
                score: score,
                correct: correct,
                total: quiz.questions.length,
                passed: passed,
                passing_score: quiz.passing_score || 70,
                results: results
            })
        } catch (error) {
            setResult({ error: String(error) })
        } finally {
            setLoading(false)
        }
    }

    if (!quiz || !quiz.questions) {
        return (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-gray-400">No quiz available</div>
            </div>
        )
    }

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Quiz: {quiz.concept}</h2>
            <div className="space-y-4">
                {quiz.questions.map((q, i) => (
                    <div key={i} className="p-4 bg-gray-700 rounded-lg border border-gray-600">
                        <div className="font-medium text-white mb-3">Q{i+1}. {q.q}</div>
                        {(q.type === 'mcq' || q.type === 'multiple') && (q.choices || q.options) && (
                            <div className="space-y-2">
                                {(q.choices || q.options || []).map((c, ci) => (
                                    <label key={ci} className="flex items-center gap-2 text-gray-300 cursor-pointer hover:text-white">
                                        <input 
                                            type="radio" 
                                            name={`q${i}`} 
                                            onChange={() => setAnswer(String(i), c)}
                                            className="text-blue-600"
                                        /> 
                                        {c}
                                    </label>
                                ))}
                            </div>
                        )}
                        {q.type === 'short' && (
                            <textarea 
                                className="w-full mt-2 bg-gray-600 border border-gray-500 rounded p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                placeholder="Type your answer here..."
                                onChange={(e) => setAnswer(String(i), e.target.value)} 
                                rows={3}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="mt-6">
                <button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition-colors" 
                    onClick={submit}
                    disabled={loading}
                >
                    {loading ? 'Submitting...' : 'Submit Answers'}
                </button>
            </div>
            {result && (
                <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    {result.error ? (
                        <div className="text-red-400">{result.error}</div>
                    ) : (
                        <>
                            <h3 className="font-semibold text-white mb-4">Quiz Results</h3>
                            <div className="mb-4">
                                <div className={`text-2xl font-bold mb-2 ${result.passed ? 'text-green-400' : 'text-red-400'}`}>
                                    Score: {result.score}% {result.passed ? '✅ Passed' : '❌ Failed'}
                                </div>
                                <div className="text-gray-300">
                                    {result.correct} out of {result.total} questions correct
                                </div>
                                <div className="text-sm text-gray-400 mt-1">
                                    Passing score: {result.passing_score}%
                                </div>
                            </div>
                            <div className="space-y-3 mt-4">
                                <h4 className="font-medium text-white">Question Review:</h4>
                                {result.results && result.results.map((r, i) => (
                                    <div key={i} className={`p-3 rounded border ${r.isCorrect ? 'bg-green-900/30 border-green-700' : 'bg-red-900/30 border-red-700'}`}>
                                        <div className="text-white font-medium mb-1">{r.question}</div>
                                        <div className="text-sm">
                                            <div className={r.isCorrect ? 'text-green-400' : 'text-red-400'}>
                                                Your answer: {r.userAnswer} {r.isCorrect ? '✓' : '✗'}
                                            </div>
                                            {!r.isCorrect && (
                                                <div className="text-green-400 mt-1">
                                                    Correct answer: {r.correctAnswer}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

