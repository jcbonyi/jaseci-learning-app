import React, {useEffect, useState, useRef, useCallback} from 'react'
import ConceptCard from './ConceptCard'
import SkillMap from './SkillMap'
import Breadcrumb from './Breadcrumb'
import QuizHistory, { saveQuizToHistory } from './QuizHistory'
import Analytics from './Analytics'
import { TryInPlaygroundButton } from './CodeContext'
import { getDashboard, recommendNext, updateMastery, generateQuiz, saveNote, getNotes, getConceptDynamic } from '../api'

export default function Dashboard({userId, onConceptSelect, refreshKey}) {
    const [data, setData] = useState(null)
    const [recs, setRecs] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedConcept, setSelectedConcept] = useState(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [notes, setNotes] = useState({})
    const [noteSaving, setNoteSaving] = useState(false)
    const [noteSaved, setNoteSaved] = useState(false)
    const [activeTab, setActiveTab] = useState('content') // 'content', 'examples', 'quiz'
    const [quizData, setQuizData] = useState(null)
    const [quizAnswers, setQuizAnswers] = useState({})
    const [quizSubmitted, setQuizSubmitted] = useState(false)
    const [quizScore, setQuizScore] = useState(null)
    const [quizLoading, setQuizLoading] = useState(false)
    const saveTimeoutRef = useRef(null)
    
    // AI-generated dynamic content
    const [dynamicConcept, setDynamicConcept] = useState(null)
    const [loadingDynamic, setLoadingDynamic] = useState(false)
    const [useAI, setUseAI] = useState(true)

    useEffect(() => { 
        load() 
    }, [userId, refreshKey])

    // Auto-save note with debounce
    const autoSaveNote = useCallback((conceptName, noteText) => {
        // Clear previous timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }
        
        // Set new timeout to save after 1 second of no typing
        saveTimeoutRef.current = setTimeout(async () => {
            setNoteSaving(true)
            setNoteSaved(false)
            try {
                await saveNote(userId, conceptName, noteText)
                setNoteSaved(true)
                // Hide "saved" indicator after 2 seconds
                setTimeout(() => setNoteSaved(false), 2000)
            } catch (err) {
                console.error('Failed to save note:', err)
            } finally {
                setNoteSaving(false)
            }
        }, 1000)
    }, [userId])

    function handleNoteChange(conceptName, noteText) {
        setNotes(prev => ({ ...prev, [conceptName]: noteText }))
        autoSaveNote(conceptName, noteText)
    }

    async function load() {
        try {
            setLoading(true)
            setError(null)
            
            const res = await getDashboard(userId)
            console.log('Dashboard API response:', res)
            
            if (res.error) {
                // If user not found, try to create the user first
                if (res.error.includes('user_not_found')) {
                    console.log('User not found, attempting to create user:', userId)
                    const { createUser } = await import('../api')
                    const createResult = await createUser(userId)
                    console.log('User creation result:', createResult)
                    
                    if (createResult.error) {
                        setError(`Failed to create user: ${createResult.error}`)
                    } else {
                        // Retry getting dashboard after user creation
                        const retryRes = await getDashboard(userId)
                        if (retryRes.error) {
                            setError(retryRes.error)
                        } else {
                            setData(retryRes)
                        }
                    }
                } else {
                    setError(res.error)
                }
            } else {
                setData(res)
            }
            
            const r = await recommendNext(userId)
            console.log('Recommend API response:', r)
            if (!r.error) {
                setRecs(r)
            }

            // Load saved notes
            const notesRes = await getNotes(userId)
            console.log('Notes API response:', notesRes)
            if (notesRes && notesRes.notes) {
                setNotes(notesRes.notes)
            }
        } catch (err) {
            console.error('Dashboard load error:', err)
            setError(String(err))
        } finally {
            setLoading(false)
        }
    }

    // Get ordered concept list
    const conceptOrder = data?.concept_order || []
    const conceptKeys = conceptOrder.length > 0 
        ? conceptOrder.map(c => c.name) 
        : Object.keys(data?.concepts || {})

    // Navigate to previous/next concept
    function goToPrevious() {
        if (selectedIndex > 0) {
            const newIndex = selectedIndex - 1
            setSelectedIndex(newIndex)
            selectConceptByIndex(newIndex)
        }
    }

    function goToNext() {
        if (selectedIndex < conceptKeys.length - 1) {
            const newIndex = selectedIndex + 1
            setSelectedIndex(newIndex)
            selectConceptByIndex(newIndex)
        }
    }

    async function fetchDynamicConcept(conceptName) {
        if (!useAI) return
        setLoadingDynamic(true)
        try {
            const result = await getConceptDynamic(conceptName, true)
            console.log('Dynamic concept content:', result)
            if (!result.error) {
                setDynamicConcept(result)
            }
        } catch (err) {
            console.error('Error fetching dynamic concept:', err)
        } finally {
            setLoadingDynamic(false)
        }
    }

    function selectConceptByIndex(index) {
        const conceptName = conceptKeys[index]
        const fullConceptData = data.concepts[conceptName]
        
        console.log('Selecting concept by index:', index, conceptName, 'Data:', fullConceptData)
        
        if (fullConceptData) {
            setSelectedConcept({
                name: conceptName,
                description: fullConceptData.description,
                detailed_content: fullConceptData.detailed_content,
                examples: fullConceptData.examples,
                score: fullConceptData.score,
                required: fullConceptData.required,
                mastery: fullConceptData.mastery,
                difficulty: fullConceptData.difficulty,
                order: fullConceptData.order
            })
            setActiveTab('content')
            setQuizData(null)
            setQuizAnswers({})
            setQuizSubmitted(false)
            setQuizScore(null)
            setDynamicConcept(null)
            
            // Fetch AI-generated content
            if (useAI) {
                fetchDynamicConcept(conceptName)
            }
        }
    }

    function selectConcept(concept) {
        const conceptName = concept.name
        const index = conceptKeys.indexOf(conceptName)
        const fullConceptData = data.concepts[conceptName]
        
        console.log('Selecting concept:', conceptName, 'Full data:', fullConceptData)
        
        if (fullConceptData) {
            setSelectedIndex(index >= 0 ? index : 0)
            setSelectedConcept({
                name: conceptName,
                description: fullConceptData.description,
                detailed_content: fullConceptData.detailed_content,
                examples: fullConceptData.examples,
                score: fullConceptData.score,
                required: fullConceptData.required,
                mastery: fullConceptData.mastery,
                difficulty: fullConceptData.difficulty,
                order: fullConceptData.order
            })
            setActiveTab('content')
            setQuizData(null)
            setQuizAnswers({})
            setQuizSubmitted(false)
            setQuizScore(null)
            setDynamicConcept(null)
            
            // Fetch AI-generated content
            if (useAI) {
                fetchDynamicConcept(conceptName)
            }
            
            if (onConceptSelect) onConceptSelect(concept)
        }
    }

    async function startQuiz() {
        if (!selectedConcept) {
            console.log('No concept selected')
            return
        }
        console.log('Starting quiz for:', selectedConcept.name)
        setQuizLoading(true)
        setActiveTab('quiz') // Switch to quiz tab immediately to show loading
        try {
            const result = await generateQuiz(selectedConcept.name)
            console.log('Quiz API result:', result)
            if (result && result.questions && result.questions.length > 0) {
                setQuizData({
                    ...result,
                    concept: selectedConcept.name
                })
                setQuizAnswers({})
                setQuizSubmitted(false)
                setQuizScore(null)
            } else if (result && result.error) {
                console.error('Quiz API error:', result.error)
                setQuizData({ error: result.error, concept: selectedConcept.name, questions: [] })
            } else {
                console.error('Invalid quiz response:', result)
                setQuizData({ error: 'Failed to generate quiz', concept: selectedConcept.name, questions: [] })
            }
        } catch (err) {
            console.error('Quiz generation error:', err)
            setQuizData({ error: String(err), concept: selectedConcept.name, questions: [] })
        } finally {
            setQuizLoading(false)
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
        
        // Save to quiz history for review
        saveQuizToHistory(userId, {
            concept: selectedConcept.name,
            score,
            questions: quizData.questions,
            answers: quizAnswers
        })
        
        // Update mastery based on quiz score
        if (score >= 70) {
            const newScore = Math.max(selectedConcept.score || 0, score)
            updateMastery(userId, selectedConcept.name, newScore).then(() => load())
        }
    }

    if (loading) {
        return (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-gray-400">Loading dashboard...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-red-400">Error: {error}</div>
            </div>
        )
    }

    if (!data || !data.concepts) {
        return (
            <div className="p-6 bg-gray-800 rounded-lg border border-gray-700">
                <div className="text-gray-400">No dashboard data available</div>
                <pre className="text-xs text-gray-500 mt-2">{JSON.stringify(data, null, 2)}</pre>
            </div>
        )
    }

    return (
        <div className="p-4 sm:p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2">
                    {/* Breadcrumb Navigation */}
                    <Breadcrumb 
                        items={[
                            { label: 'Dashboard', icon: '🏠', onClick: selectedConcept ? () => setSelectedConcept(null) : null },
                            ...(selectedConcept ? [{ 
                                label: selectedConcept.name, 
                                icon: '📚' 
                            }] : []),
                            ...(selectedConcept && activeTab === 'quiz' ? [{ 
                                label: 'Quiz', 
                                icon: '📝' 
                            }] : [])
                        ]}
                    />

                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">📊 Progress Dashboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {conceptKeys.map((k, idx) => (
                            <ConceptCard 
                                key={k} 
                                concept={{
                                    name: k, 
                                    description: data.concepts[k].description || '', 
                                    score: data.concepts[k].score,
                                    required: data.concepts[k].required,
                                    mastery: data.concepts[k].mastery,
                                    difficulty: data.concepts[k].difficulty
                                }}
                                isSelected={selectedConcept?.name === k}
                                onClick={(c) => selectConcept(c)}
                            />
                        ))}
                    </div>
                    
                    {/* Concept Detail Panel */}
                    {selectedConcept && (
                        <div className="mt-6 p-5 bg-gray-700 rounded-lg border-2 border-blue-500 shadow-lg">
                            {/* Header with Navigation */}
                            <div className="flex justify-between items-center mb-4">
                                <button 
                                    onClick={goToPrevious}
                                    disabled={selectedIndex === 0}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        selectedIndex === 0 
                                            ? 'bg-gray-600 text-gray-500 cursor-not-allowed' 
                                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                                    }`}
                                >
                                    ← Previous
                                </button>
                                <div className="text-center">
                                    <h3 className="text-xl font-bold text-white">{selectedConcept.name}</h3>
                                    <span className="text-xs text-gray-400">
                                        {selectedIndex + 1} of {conceptKeys.length}
                                    </span>
                                </div>
                                <button 
                                    onClick={goToNext}
                                    disabled={selectedIndex === conceptKeys.length - 1}
                                    className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                                        selectedIndex === conceptKeys.length - 1 
                                            ? 'bg-gray-600 text-gray-500 cursor-not-allowed' 
                                            : 'bg-gray-600 hover:bg-gray-500 text-white'
                                    }`}
                                >
                                    Next →
                                </button>
                            </div>

                            {/* AI Toggle */}
                            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800 rounded">
                                <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={useAI}
                                        onChange={(e) => {
                                            setUseAI(e.target.checked)
                                            if (e.target.checked && !dynamicConcept && selectedConcept) {
                                                fetchDynamicConcept(selectedConcept.name)
                                            }
                                        }}
                                        className="w-4 h-4 rounded"
                                    />
                                    <span>🤖 AI Content</span>
                                </label>
                                {loadingDynamic && (
                                    <span className="text-purple-400 text-sm animate-pulse">
                                        ⏳ Generating with Gemini...
                                    </span>
                                )}
                                {dynamicConcept?.generated_by === 'AI' && !loadingDynamic && (
                                    <span className="text-green-400 text-sm">
                                        ✨ AI Content Loaded
                                    </span>
                                )}
                            </div>

                            {/* Score Bar */}
                            <div className="flex items-center gap-4 mb-4 p-3 bg-gray-800 rounded">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                                        <span>Progress</span>
                                        <span>{selectedConcept.score || 0}%</span>
                                    </div>
                                    <div className="w-full bg-gray-600 rounded-full h-2">
                                        <div 
                                            className={`h-2 rounded-full transition-all ${
                                                (selectedConcept.score || 0) >= selectedConcept.mastery 
                                                    ? 'bg-green-500' 
                                                    : (selectedConcept.score || 0) >= selectedConcept.required 
                                                        ? 'bg-blue-500' 
                                                        : 'bg-yellow-500'
                                            }`}
                                            style={{width: `${Math.min(selectedConcept.score || 0, 100)}%`}}
                                        />
                                    </div>
                                </div>
                                <div className="text-xs text-gray-400">
                                    <span className="text-yellow-400">Required: {selectedConcept.required}%</span>
                                    <span className="mx-2">|</span>
                                    <span className="text-green-400">Mastery: {selectedConcept.mastery}%</span>
                                </div>
                            </div>

                            {/* Tab Navigation */}
                            <div className="flex gap-2 mb-4 border-b border-gray-600 pb-2">
                                <button
                                    onClick={() => setActiveTab('content')}
                                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                                        activeTab === 'content' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                >
                                    📖 Content
                                </button>
                                <button
                                    onClick={() => setActiveTab('examples')}
                                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                                        activeTab === 'examples' 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    }`}
                                >
                                    💻 Examples
                                </button>
                                <button
                                    onClick={async () => {
                                        console.log('Take Quiz clicked, quizData:', quizData)
                                        if (quizData && quizData.concept === selectedConcept.name) {
                                            setActiveTab('quiz')
                                        } else {
                                            await startQuiz()
                                        }
                                    }}
                                    disabled={quizLoading}
                                    className={`px-4 py-2 rounded-t text-sm font-medium transition-colors ${
                                        activeTab === 'quiz' 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                                    } ${quizLoading ? 'opacity-50' : ''}`}
                                >
                                    {quizLoading ? '⏳ Loading...' : '📝 Take Quiz'}
                                </button>
                                <button 
                                    onClick={() => setSelectedConcept(null)}
                                    className="ml-auto text-gray-400 hover:text-white px-2"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Content Tab */}
                            {activeTab === 'content' && (
                                <div className="space-y-4">
                                    <div className="p-4 bg-gray-800 rounded-lg">
                                        <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                            Overview
                                            {dynamicConcept?.generated_by === 'AI' && (
                                                <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">AI Generated</span>
                                            )}
                                        </h4>
                                        {loadingDynamic ? (
                                            <div className="flex items-center gap-3">
                                                <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                                                <span className="text-gray-400">Generating content...</span>
                                            </div>
                                        ) : (
                                            <p className="text-gray-300 text-sm leading-relaxed">
                                                {dynamicConcept?.description || selectedConcept.description}
                                            </p>
                                        )}
                                    </div>
                                    
                                    {(dynamicConcept?.detailed_content || selectedConcept.detailed_content) && (
                                        <div className="p-4 bg-gray-800 rounded-lg">
                                            <h4 className="text-sm font-semibold text-blue-400 mb-2 flex items-center gap-2">
                                                Detailed Explanation
                                                {dynamicConcept?.detailed_content && dynamicConcept?.generated_by === 'AI' && (
                                                    <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">AI Generated</span>
                                                )}
                                            </h4>
                                            {loadingDynamic ? (
                                                <div className="flex items-center gap-3">
                                                    <div className="animate-spin w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full"></div>
                                                    <span className="text-gray-400">Generating detailed explanation with AI...</span>
                                                </div>
                                            ) : (
                                                <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                                                    {dynamicConcept?.detailed_content || selectedConcept.detailed_content}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    {/* Notes Section */}
                                    <div className="p-4 bg-gray-800 rounded-lg">
                                        <label className="block text-sm font-semibold text-blue-400 mb-2">
                                            📝 Your Notes
                                            {noteSaving && (
                                                <span className="text-xs text-yellow-400 ml-2">💾 Saving...</span>
                                            )}
                                            {noteSaved && !noteSaving && (
                                                <span className="text-xs text-green-400 ml-2">✓ Saved</span>
                                            )}
                                        </label>
                                        <textarea
                                            className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none"
                                            placeholder="Add your personal notes about this concept... (auto-saves)"
                                            rows={4}
                                            value={notes[selectedConcept.name] || ''}
                                            onChange={(e) => handleNoteChange(selectedConcept.name, e.target.value)}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">
                                            Your notes are automatically saved and will appear when you return.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Examples Tab */}
                            {activeTab === 'examples' && (
                                <div className="space-y-4">
                                    {loadingDynamic ? (
                                        <div className="p-8 bg-gray-800 rounded-lg text-center">
                                            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                            <span className="text-gray-400">Generating code examples with AI...</span>
                                        </div>
                                    ) : (dynamicConcept?.examples || selectedConcept.examples)?.length > 0 ? (
                                        (dynamicConcept?.examples || selectedConcept.examples).map((ex, i) => (
                                            <div key={i} className="p-4 bg-gray-800 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                                                        Example {i + 1}: {ex.title}
                                                        {dynamicConcept?.generated_by === 'AI' && (
                                                            <span className="text-xs bg-purple-900 text-purple-300 px-2 py-0.5 rounded">AI</span>
                                                        )}
                                                    </h4>
                                                    <TryInPlaygroundButton code={ex.code} />
                                                </div>
                                                <pre className="bg-gray-900 p-3 rounded text-sm text-gray-300 overflow-x-auto font-mono whitespace-pre-wrap">
                                                    {ex.code}
                                                </pre>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 bg-gray-800 rounded-lg text-gray-400 text-center">
                                            No examples available for this concept.
                                            {useAI && !loadingDynamic && (
                                                <button
                                                    onClick={() => fetchDynamicConcept(selectedConcept.name)}
                                                    className="block mx-auto mt-3 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded text-sm"
                                                >
                                                    🤖 Generate with AI
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Quiz Tab */}
                            {activeTab === 'quiz' && (
                                <div className="space-y-4">
                                    {/* Loading State */}
                                    {quizLoading && (
                                        <div className="p-8 bg-gray-800 rounded-lg text-center">
                                            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                            <div className="text-gray-300">🤖 Generating quiz questions with AI...</div>
                                            <div className="text-gray-500 text-sm mt-1">This may take a few seconds</div>
                                        </div>
                                    )}

                                    {/* Error State */}
                                    {!quizLoading && quizData && quizData.error && (
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

                                    {/* No Quiz Data Yet */}
                                    {!quizLoading && !quizData && (
                                        <div className="p-8 bg-gray-800 rounded-lg text-center">
                                            <div className="text-gray-400 mb-4">Click to generate a quiz for this concept</div>
                                            <button 
                                                onClick={startQuiz}
                                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded font-medium"
                                            >
                                                Generate Quiz
                                            </button>
                                        </div>
                                    )}

                                    {/* Quiz Submitted Results */}
                                    {!quizLoading && quizData && quizData.questions && quizData.questions.length > 0 && quizSubmitted && (
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
                                    {!quizLoading && quizData && quizData.questions && quizData.questions.length > 0 && quizData.questions.map((q, i) => (
                                        <div key={i} className="p-4 bg-gray-800 rounded-lg">
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
                                                                    'bg-gray-700 hover:bg-gray-600 border border-gray-600'
                                                                }`}
                                                            >
                                                                <input
                                                                    type="radio"
                                                                    name={`q-${i}`}
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
                                                    className="w-full bg-gray-700 border border-gray-600 rounded p-3 text-white text-sm"
                                                    placeholder="Type your answer..."
                                                    value={quizAnswers[i] || ''}
                                                    onChange={(e) => setQuizAnswers(prev => ({...prev, [i]: e.target.value}))}
                                                    disabled={quizSubmitted}
                                                />
                                            )}
                                        </div>
                                    ))}

                                    {!quizLoading && quizData && quizData.questions && quizData.questions.length > 0 && !quizSubmitted && (
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
                                    )}

                                    {!quizLoading && quizData && quizData.questions && quizData.questions.length > 0 && quizSubmitted && (
                                        <button
                                            onClick={() => {
                                                setQuizAnswers({})
                                                setQuizSubmitted(false)
                                                setQuizScore(null)
                                            }}
                                            className="w-full py-3 rounded font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                                        >
                                            Retry Quiz
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-4 pt-4 border-t border-gray-600 flex gap-2">
                                <button 
                                    onClick={async () => {
                                        const newScore = Math.min((selectedConcept.score || 0) + 10, 100)
                                        await updateMastery(userId, selectedConcept.name, newScore)
                                        load()
                                        selectConceptByIndex(selectedIndex)
                                    }}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                >
                                    + Practice (+10%)
                                </button>
                                <button 
                                    onClick={async () => {
                                        await updateMastery(userId, selectedConcept.name, 100)
                                        load()
                                        selectConceptByIndex(selectedIndex)
                                    }}
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                                >
                                    Mark Mastered
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Progress Manager */}
                    <div className="flex justify-between items-center flex-wrap gap-2">
                        <h3 className="font-semibold text-white">Your Progress</h3>
                        <div className="flex gap-2">
                            <Analytics userId={userId} dashboardData={data} />
                        </div>
                    </div>

                    {/* Skill Map */}
                    <div>
                        <h3 className="font-semibold text-white mb-3">Skill Map</h3>
                        <SkillMap concepts={data.concepts} />
                    </div>
                    {/* Quiz History */}
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                            📋 Quiz History
                        </h3>
                        <QuizHistory userId={userId} />
                    </div>

                    {/* Recommendations */}
                    <div>
                        <h4 className="font-semibold text-white mb-2">Recommended Next</h4>
                        <div className="text-sm text-gray-300">
                            {recs && recs.recommendations && recs.recommendations.length > 0 ? (
                                <ul className="space-y-2">
                                    {recs.recommendations.map((rec, i) => {
                                        // rec is now a lesson title
                                        const lessonTitle = rec;
                                        // Find the concept associated with this lesson from the data
                                        let conceptName = null;
                                        if (data && data.concepts) {
                                            // Try to find concept by matching lesson title patterns
                                            const conceptKeys = Object.keys(data.concepts);
                                            for (const key of conceptKeys) {
                                                // Simple matching - if lesson title contains concept name
                                                if (lessonTitle.toLowerCase().includes(key.toLowerCase()) || 
                                                    key.toLowerCase().includes(lessonTitle.toLowerCase().split(' ')[0])) {
                                                    conceptName = key;
                                                    break;
                                                }
                                            }
                                        }
                                        
                                        return (
                                            <li 
                                                key={i} 
                                                className="text-blue-400 hover:text-blue-300 cursor-pointer bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 transition-colors"
                                                onClick={() => {
                                                    // If we found a concept, select it; otherwise just show the lesson title
                                                    if (conceptName) {
                                                        selectConcept({ name: conceptName });
                                                    } else if (onConceptSelect) {
                                                        // Fallback: pass lesson title to parent
                                                        onConceptSelect({ name: lessonTitle, type: 'lesson' });
                                                    }
                                                }}
                                                title={`Click to start: ${lessonTitle}`}
                                            >
                                                📖 {lessonTitle}
                                            </li>
                                        );
                                    })}
                                </ul>
                            ) : (
                                <span className="text-gray-500">Complete some lessons to get recommendations</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
