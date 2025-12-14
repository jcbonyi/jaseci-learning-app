import React, {useState, useEffect} from 'react'
import { recordLessonProgress, generateQuiz, updateMastery, getLessonDynamic } from '../api'

export default function LessonPage({userId, lesson, onComplete}) {
    const [completed, setCompleted] = useState(false)
    const [loading, setLoading] = useState(false)
    const [quizData, setQuizData] = useState(null)
    const [quizAnswers, setQuizAnswers] = useState({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const [quizScore, setQuizScore] = useState(null)
    const [quizPassed, setQuizPassed] = useState(false)
    const [activeTab, setActiveTab] = useState('content')
    const [copiedIndex, setCopiedIndex] = useState(null)
    
    // AI-generated dynamic content
    const [dynamicContent, setDynamicContent] = useState(null)
    const [loadingContent, setLoadingContent] = useState(false)
    const [useAI, setUseAI] = useState(true)

    // Reset state and fetch dynamic content when lesson changes
    useEffect(() => {
        setCompleted(false)
        setQuizData(null)
        setQuizAnswers({})
        setQuizSubmitted(false)
        setQuizScore(null)
        setQuizPassed(false)
        setActiveTab('content')
        setDynamicContent(null)
        
        // Fetch AI-generated content
        if (lesson?.title && useAI) {
            fetchDynamicContent()
        }
    }, [lesson?.title])
    
    async function fetchDynamicContent() {
        setLoadingContent(true)
        try {
            const result = await getLessonDynamic(lesson.title, true)
            console.log('Dynamic lesson content:', result)
            if (!result.error) {
                setDynamicContent(result)
            }
        } catch (err) {
            console.error('Error fetching dynamic content:', err)
        } finally {
            setLoadingContent(false)
        }
    }

    function copyCode(code, index) {
        navigator.clipboard.writeText(code)
        setCopiedIndex(index)
        setTimeout(() => setCopiedIndex(null), 2000)
    }

    async function markComplete() {
        setLoading(true)
        try {
            const result = await recordLessonProgress(userId, lesson.title, true)
            if (!result.error) {
                setCompleted(true)
                // Notify parent to refresh data and get next lesson
                if (onComplete) {
                    onComplete(lesson)
                }
            }
            console.log('Marked complete:', result)
        } finally {
            setLoading(false)
        }
    }

    async function startQuiz() {
        if (lesson.concepts && lesson.concepts.length > 0) {
            setLoading(true)
            setQuizAnswers({})
            setQuizSubmitted(false)
            setQuizScore(null)
            try {
                // concepts may be strings or objects with .name
                const conceptName = typeof lesson.concepts[0] === 'string' 
                    ? lesson.concepts[0] 
                    : lesson.concepts[0];
                const res = await generateQuiz(conceptName)
                console.log('Generated quiz:', res)
                if (res && res.questions && res.questions.length > 0) {
                    setQuizData(res)
                } else if (res && res.error) {
                    setQuizData({ error: res.error, questions: [] })
                } else {
                    setQuizData({ error: 'Failed to generate quiz', questions: [] })
                }
            } finally {
                setLoading(false)
            }
        }
    }

    function submitQuiz() {
        if (!quizData || !quizData.questions) return
        
        let correct = 0
        quizData.questions.forEach((q, i) => {
            if (quizAnswers[i] === q.answer) {
                correct++
            }
        })
        
        const score = Math.round((correct / quizData.questions.length) * 100)
        setQuizScore(score)
        setQuizSubmitted(true)
        
        // Mark quiz as passed if score >= 70
        if (score >= 70) {
            setQuizPassed(true)
            
            // Update mastery based on quiz score
            if (lesson.concepts && lesson.concepts.length > 0) {
                const conceptName = typeof lesson.concepts[0] === 'string' 
                    ? lesson.concepts[0] 
                    : lesson.concepts[0];
                updateMastery(userId, conceptName, score)
            }
        }
    }

    function retryQuiz() {
        setQuizAnswers({})
        setQuizSubmitted(false)
        setQuizScore(null)
    }

    // Get examples from dynamic content, lesson, or defaults
    const examples = dynamicContent?.examples || lesson.examples || getDefaultExamples(lesson.title)
    const detailedContent = dynamicContent?.detailed_content || lesson.detailed_content || getDefaultDetailedContent(lesson.title)
    const keyPoints = dynamicContent?.key_points || []
    const overview = dynamicContent?.overview || lesson.content || 'Lesson content will be displayed here.'

    function getDefaultExamples(title) {
        const exampleSets = {
            "Intro to Jac syntax": [
                { title: "Hello World", code: 'with entry {\n    print("Hello, Jac!");\n}' },
                { title: "Variables", code: 'with entry {\n    let name = "Alice";\n    let age = 25;\n    print(name, "is", age, "years old");\n}' },
                { title: "For Loop", code: 'with entry {\n    for i in range(5) {\n        print("Count:", i);\n    }\n}' }
            ],
            "Nodes & edges": [
                { title: "Define a Node", code: 'node Person {\n    has name: str;\n    has age: int;\n}\n\nwith entry {\n    let p = Person(name="Bob", age=30);\n    print(p.name);\n}' },
                { title: "Connect Nodes", code: 'node City { has name: str; }\n\nwith entry {\n    let a = City(name="Paris");\n    let b = City(name="Tokyo");\n    a ++> b;\n    print("Connected!");\n}' }
            ],
            "Walkers deep-dive": [
                { title: "Simple Walker", code: 'node Room { has name: str; }\n\nwalker Explorer {\n    can visit with Room entry {\n        print("In:", here.name);\n    }\n}\n\nwith entry {\n    root ++> Room(name="Kitchen");\n    root spawn Explorer();\n}' }
            ]
        }
        return exampleSets[title] || [
            { title: "Basic Example", code: 'with entry {\n    print("Hello from Jac!");\n}' }
        ]
    }

    function getDefaultDetailedContent(title) {
        const contents = {
            "Intro to Jac syntax": "Jac is a data-spatial programming language that extends Python with graph-based computing.\n\n• Variables: Use 'let' to declare (let x = 5;)\n• Types: int, float, str, bool, list, dict\n• Control: if/elif/else, for/while loops\n• Entry: 'with entry { }' defines program start",
            "Nodes & edges": "Nodes store data, edges connect them.\n\n• Define nodes: node Name { has field: type; }\n• Create: Name(field=value)\n• Connect: nodeA ++> nodeB\n• Traverse: [-->] gets connected nodes",
            "Walkers deep-dive": "Walkers traverse graphs executing code at each node.\n\n• Define: walker Name { can ability { } }\n• Spawn: root spawn WalkerName()\n• Move: visit [-->] visits connected nodes\n• Access: 'here' is current node"
        }
        return contents[title] || lesson.content
    }

    return (
        <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">{lesson.title}</h2>
                    <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-purple-900 text-purple-300 px-2 py-1 rounded flex items-center gap-1">
                            📊 Difficulty: {'⭐'.repeat(lesson.difficulty || 1)}
                        </span>
                        {lesson.concepts && lesson.concepts.map((c, i) => (
                            <span key={i} className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                                📚 {typeof c === 'string' ? c : c}
                            </span>
                        ))}
                    </div>
                </div>
                {completed && (
                    <span className="bg-green-900 text-green-300 px-3 py-1 rounded text-sm font-medium">
                        ✓ Completed
                    </span>
                )}
            </div>

            {/* AI Toggle & Loading */}
            <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={useAI}
                        onChange={(e) => {
                            setUseAI(e.target.checked)
                            if (e.target.checked && !dynamicContent) {
                                fetchDynamicContent()
                            }
                        }}
                        className="w-4 h-4 rounded"
                    />
                    <span>🤖 AI-Generated Content</span>
                </label>
                {loadingContent && (
                    <span className="text-purple-400 text-sm animate-pulse">
                        ⏳ Generating with Gemini...
                    </span>
                )}
                {dynamicContent?.generated_by === 'AI' && !loadingContent && (
                    <span className="text-green-400 text-sm">
                        ✨ AI Content Loaded
                    </span>
                )}
            </div>

            {/* Overview */}
            <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-4 mb-4 border border-blue-800">
                {loadingContent ? (
                    <div className="flex items-center gap-3">
                        <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                        <span className="text-gray-300">Generating lesson overview with AI...</span>
                    </div>
                ) : (
                    <p className="text-gray-200 leading-relaxed">{overview}</p>
                )}
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-4 border-b border-gray-700 pb-2">
                <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                        activeTab === 'content' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    📖 Lesson Content
                </button>
                <button
                    onClick={() => setActiveTab('examples')}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                        activeTab === 'examples' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    💻 Code Examples ({examples.length})
                </button>
                <button
                    onClick={() => {
                        setActiveTab('quiz')
                        if (!quizData) startQuiz()
                    }}
                    disabled={loading}
                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                        activeTab === 'quiz' 
                            ? 'bg-purple-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    {loading ? '⏳ Loading...' : '📝 Take Quiz'}
                </button>
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div className="space-y-4">
                    <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                        <h3 className="text-lg font-semibold text-blue-400 mb-3 flex items-center gap-2">
                            📘 Detailed Explanation
                            {dynamicContent?.detailed_content && dynamicContent?.generated_by === 'AI' && (
                                <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">AI Generated</span>
                            )}
                        </h3>
                        {loadingContent ? (
                            <div className="flex items-center gap-3">
                                <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                                <span className="text-gray-400">Generating detailed explanation with AI...</span>
                            </div>
                        ) : (
                            <div className="text-gray-300 leading-relaxed whitespace-pre-line">
                                {detailedContent}
                            </div>
                        )}
                    </div>

                    {/* Key Concepts Summary */}
                    <div className="bg-gray-900 rounded-lg p-5 border border-gray-700">
                        <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                            🎯 Key Takeaways
                            {keyPoints.length > 0 && dynamicContent?.generated_by === 'AI' && (
                                <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">AI Generated</span>
                            )}
                        </h3>
                        <ul className="space-y-2">
                            {keyPoints.length > 0 ? (
                                keyPoints.map((point, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>{point}</span>
                                    </li>
                                ))
                            ) : (
                                <>
                                    <li className="flex items-start gap-2 text-gray-300">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Understanding {lesson.title} is fundamental to Jac programming</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-gray-300">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Practice with the code examples to reinforce your learning</span>
                                    </li>
                                    <li className="flex items-start gap-2 text-gray-300">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Take the quiz to test your knowledge and track progress</span>
                                    </li>
                                </>
                            )}
                        </ul>
                    </div>
                </div>
            )}

            {/* Examples Tab */}
            {activeTab === 'examples' && (
                <div className="space-y-4">
                    {examples.map((ex, i) => (
                        <div key={i} className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                                <h4 className="font-medium text-green-400 flex items-center gap-2">
                                    <span className="bg-green-900 text-green-300 text-xs px-2 py-0.5 rounded">
                                        Example {i + 1}
                                    </span>
                                    {ex.title}
                                </h4>
                                <button
                                    onClick={() => copyCode(ex.code, i)}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1 rounded transition-colors"
                                >
                                    {copiedIndex === i ? '✓ Copied!' : '📋 Copy'}
                                </button>
                            </div>
                            <pre className="p-4 text-sm text-gray-300 overflow-x-auto font-mono leading-relaxed">
                                {ex.code}
                            </pre>
                        </div>
                    ))}

                    <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-4 mt-4">
                        <p className="text-blue-300 text-sm flex items-center gap-2">
                            💡 <strong>Tip:</strong> Try running these examples in the Code Playground below!
                        </p>
                    </div>
                </div>
            )}

            {/* Quiz Tab */}
            {activeTab === 'quiz' && (
                <div className="space-y-4">
                    {/* Loading State */}
                    {loading && (
                        <div className="p-8 bg-gray-900 rounded-lg text-center border border-gray-700">
                            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                            <div className="text-gray-300">🤖 Generating quiz questions with AI...</div>
                            <div className="text-gray-500 text-sm mt-1">This may take a few seconds</div>
                        </div>
                    )}

                    {/* Quiz Content */}
                    {!loading && quizData && (
                        <>
                            <h3 className="text-xl font-semibold text-white">
                                📝 Quiz: {quizData.concept || lesson.concepts?.[0] || 'Lesson Quiz'}
                            </h3>

                            {/* Error State */}
                            {quizData.error && (
                                <div className="p-4 bg-red-900 border border-red-500 rounded-lg text-center">
                                    <div className="text-red-300">Error: {quizData.error}</div>
                                    <button 
                                        onClick={startQuiz}
                                        className="mt-3 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm"
                                    >
                                        Retry
                                    </button>
                                </div>
                            )}

                            {/* Quiz Score Result */}
                            {quizSubmitted && quizScore !== null && (
                                <div className={`p-4 rounded-lg text-center ${
                                    quizScore >= 70 ? 'bg-green-900 border border-green-500' : 'bg-red-900 border border-red-500'
                                }`}>
                                    <div className="text-2xl font-bold text-white mb-1">
                                        {quizScore >= 70 ? '🎉 Passed!' : '📚 Keep Learning!'}
                                    </div>
                                    <div className="text-lg text-gray-300">
                                        Score: {quizScore}%
                                    </div>
                                    {quizScore >= 70 && (
                                        <div className="text-sm text-green-400 mt-2">
                                            Your mastery has been updated!
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quiz Questions */}
                            {quizData.questions && quizData.questions.length > 0 && quizData.questions.map((q, i) => (
                                <div key={i} className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                                    <h4 className="text-sm font-semibold text-white mb-3">
                                        Question {i + 1}: {q.q}
                                    </h4>
                                    {q.type === 'multiple' && q.options ? (
                                        <div className="space-y-2">
                                            {q.options.map((opt, j) => {
                                                const isSelected = quizAnswers[i] === opt
                                                const isCorrect = quizSubmitted && opt === q.answer
                                                const isWrong = quizSubmitted && isSelected && opt !== q.answer
                                                
                                                return (
                                                    <label 
                                                        key={j}
                                                        className={`flex items-center p-3 rounded cursor-pointer transition-colors ${
                                                            isCorrect ? 'bg-green-800 border border-green-500' :
                                                            isWrong ? 'bg-red-800 border border-red-500' :
                                                            isSelected ? 'bg-blue-800 border border-blue-500' :
                                                            'bg-gray-800 hover:bg-gray-700 border border-gray-600'
                                                        }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`lesson-q-${i}`}
                                                            value={opt}
                                                            checked={isSelected}
                                                            onChange={() => !quizSubmitted && setQuizAnswers(prev => ({...prev, [i]: opt}))}
                                                            disabled={quizSubmitted}
                                                            className="mr-3"
                                                        />
                                                        <span className="text-sm text-gray-200">{opt}</span>
                                                        {isCorrect && <span className="ml-auto text-green-400">✓</span>}
                                                        {isWrong && <span className="ml-auto text-red-400">✗</span>}
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    ) : (
                                        <textarea
                                            className="w-full bg-gray-800 border border-gray-600 rounded p-3 text-white text-sm placeholder-gray-400"
                                            placeholder="Type your answer..."
                                            value={quizAnswers[i] || ''}
                                            onChange={(e) => setQuizAnswers(prev => ({...prev, [i]: e.target.value}))}
                                            disabled={quizSubmitted}
                                            rows={3}
                                        />
                                    )}
                                </div>
                            ))}

                            {/* Submit / Retry Buttons */}
                            {quizData.questions && quizData.questions.length > 0 && (
                                !quizSubmitted ? (
                                    <button
                                        onClick={submitQuiz}
                                        disabled={Object.keys(quizAnswers).length < quizData.questions.length}
                                        className={`w-full py-3 rounded font-medium transition-colors ${
                                            Object.keys(quizAnswers).length >= quizData.questions.length
                                                ? 'bg-green-600 hover:bg-green-700 text-white'
                                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        Submit Quiz ({Object.keys(quizAnswers).length}/{quizData.questions.length} answered)
                                    </button>
                                ) : (
                                    <button
                                        onClick={retryQuiz}
                                        className="w-full py-3 rounded font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                    >
                                        Retry Quiz
                                    </button>
                                )
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-gray-700">
                <div className="flex gap-3 flex-wrap items-center">
                    <button 
                        className={`px-5 py-2.5 rounded font-medium disabled:opacity-50 transition-colors flex items-center gap-2 ${
                            quizPassed 
                                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        }`}
                        onClick={markComplete} 
                        disabled={completed || loading || !quizPassed}
                    >
                        {completed ? '✓ Completed' : loading ? 'Saving...' : '✓ Mark Complete'}
                    </button>
                    {completed && (
                        <span className="text-green-400 text-sm">
                            🎉 Great job! Move on to the next lesson.
                        </span>
                    )}
                    {quizPassed && !completed && (
                        <span className="text-green-400 text-sm">
                            ✓ Quiz passed! You can now mark this lesson complete.
                        </span>
                    )}
                </div>
                
                {/* Requirement notice if quiz not passed */}
                {!quizPassed && !completed && (
                    <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700 rounded-lg">
                        <p className="text-yellow-300 text-sm flex items-center gap-2">
                            ⚠️ <strong>Requirement:</strong> You must pass the quiz (score ≥ 70%) before marking this lesson complete.
                            <button 
                                onClick={() => {
                                    setActiveTab('quiz')
                                    if (!quizData) startQuiz()
                                }}
                                className="ml-2 underline hover:text-yellow-200"
                            >
                                Take Quiz →
                            </button>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

