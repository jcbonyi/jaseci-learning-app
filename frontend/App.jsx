import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LessonPage from './components/LessonPage';
import QuizPage from './components/QuizPage';
import CodeEditor from './components/CodeEditor';
import { createUser, getNextLesson, healthCheck } from './api';

export default function App() {
    const [user, setUser] = useState('demo_user');
    const [lesson, setLesson] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiOnline, setApiOnline] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    async function fetchNextLesson() {
        const next = await getNextLesson(user);
        console.log('Next lesson:', next);
        
        if (next && next.next_lesson) {
            setLesson(next.next_lesson);
        } else if (next && next.recommended_review) {
            console.log('Recommended review:', next.recommended_review);
            setLesson(null); // No more lessons, all completed
        } else {
            setLesson(null);
        }
    }

    async function handleLessonComplete(completedLesson) {
        console.log('Lesson completed:', completedLesson.title);
        // Refresh the dashboard and get next lesson
        setRefreshKey(prev => prev + 1);
        await fetchNextLesson();
    }

    useEffect(() => {
        async function boot() {
            try {
                setLoading(true);
                setError(null);
                
                // Check API health first
                const isOnline = await healthCheck();
                setApiOnline(isOnline);
                
                if (!isOnline) {
                    setError('Backend API is not available. Run: REQUIRE_AUTH_BY_DEFAULT=false jac serve backend/main.jac');
                    setLoading(false);
                    return;
                }

                // Create or get user (this also initializes concepts if needed)
                const userResult = await createUser(user);
                console.log('User created/exists:', userResult);
                
                if (userResult.error) {
                    console.error('Failed to create user:', userResult.error);
                }
                
                // Get next lesson recommendation
                await fetchNextLesson();
            } catch (err) {
                console.error('Boot error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        boot();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="text-lg text-gray-300">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-6 rounded-lg max-w-md">
                    <h2 className="text-xl font-bold text-red-400 mb-3">Connection Error</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <div className="text-sm text-gray-400">
                        <p className="mb-2">Make sure the Jac backend is running:</p>
                        <code className="bg-gray-700 px-2 py-1 rounded block">
                            jac serve backend/main.jac
                        </code>
                    </div>
                </div>
            </div>
        );
    }

    const editorDefaultValue = `let a = 5;
let b = 7;
let sum = a + b;
print("Sum =", sum);`;

    return (
        <div className="min-h-screen bg-gray-900">
            <header className="bg-gray-800 shadow-lg p-4 border-b border-gray-700">
                <div className="max-w-6xl mx-auto flex justify-between items-center">
                    <h1 className="text-xl font-bold text-white">Interactive Jac Tutor</h1>
                    <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded ${apiOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {apiOnline ? '● API Online' : '○ API Offline'}
                        </span>
                        <span className="text-sm text-gray-400">User: {user}</span>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto py-6 space-y-6 px-4">
                <Dashboard userId={user} refreshKey={refreshKey} />
                {lesson && <LessonPage userId={user} lesson={lesson} onComplete={handleLessonComplete} />}
                {quiz && <QuizPage quiz={quiz} userId={user} />}
                <section className="p-5 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    <h3 className="font-semibold mb-4 text-white text-lg">Code Playground</h3>
                    <CodeEditor 
                        value={editorDefaultValue}
                        language="javascript" 
                        onChange={(v) => console.log('code changed', v)} 
                    />
                </section>
            </main>
        </div>
    );
}
