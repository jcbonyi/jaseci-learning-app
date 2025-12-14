import React, {useState} from 'react'
import { evaluateAnswer } from '../api'

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
            const res = await evaluateAnswer(quiz.quiz_id, answers)
            setResult(res)
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
                        {q.type === 'mcq' && q.choices && (
                            <div className="space-y-2">
                                {q.choices.map((c, ci) => (
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
                    <h3 className="font-semibold text-white mb-2">Result</h3>
                    <pre className="text-sm text-green-400 overflow-auto">
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    )
}

