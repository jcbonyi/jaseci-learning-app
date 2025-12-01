import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import LessonPage from './components/LessonPage';
import QuizPage from './components/QuizPage';
import CodeEditor from './components/CodeEditor';
import { DashboardSkeleton, LessonSkeleton } from './components/Skeleton';
import ThemeProvider, { ThemeToggle, useTheme } from './components/ThemeProvider';
import CodeProvider from './components/CodeContext';
import { createUser, getNextLesson, healthCheck } from './api';

// Wrap the app with providers
export default function App() {
    return (
        <ThemeProvider>
            <CodeProvider>
                <AppContent />
            </CodeProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    const { isDark } = useTheme();
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
            <div className="min-h-screen bg-gray-900">
                <header className="bg-gray-800 shadow-lg p-4 border-b border-gray-700">
                    <div className="max-w-6xl mx-auto flex justify-between items-center">
                        <h1 className="text-xl font-bold text-white">Interactive Jac Tutor</h1>
                        <div className="flex items-center gap-4">
                            <span className="text-xs px-2 py-1 rounded bg-gray-700 text-gray-400">
                                ◌ Connecting...
                            </span>
                        </div>
                    </div>
                </header>
                <main className="max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4">
                    <DashboardSkeleton />
                    <LessonSkeleton />
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 p-6 rounded-lg max-w-lg border border-red-900/50">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-3xl">⚠️</span>
                        <h2 className="text-xl font-bold text-red-400">Connection Error</h2>
                    </div>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <div className="text-sm text-gray-400 bg-gray-900 p-4 rounded mb-4">
                        <p className="mb-2 font-medium text-gray-300">To start the backend:</p>
                        <code className="bg-gray-800 px-3 py-2 rounded block text-green-400 font-mono">
                            cd backend && python start_server.py
                        </code>
                    </div>
                    <button 
                        onClick={() => window.location.reload()}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded font-medium transition-colors"
                    >
                        🔄 Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    const editorDefaultValue = `let a = 5;
let b = 7;
let sum = a + b;
print("Sum =", sum);`;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <header className={`shadow-lg p-3 sm:p-4 border-b transition-colors duration-300 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
                    <h1 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        🚀 Interactive Jac Tutor
                    </h1>
                    <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
                        <ThemeToggle />
                        <span className={`text-xs px-2 py-1 rounded ${apiOnline ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                            {apiOnline ? '● Online' : '○ Offline'}
                        </span>
                        <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            👤 {user}
                        </span>
                    </div>
                </div>
            </header>
            <main className="max-w-6xl mx-auto py-4 sm:py-6 space-y-4 sm:space-y-6 px-3 sm:px-4">
                <Dashboard userId={user} refreshKey={refreshKey} />
                {lesson && <LessonPage userId={user} lesson={lesson} onComplete={handleLessonComplete} />}
                {quiz && <QuizPage quiz={quiz} userId={user} />}
                <section id="code-playground" className="p-5 bg-gray-800 rounded-lg shadow-lg border border-gray-700 scroll-mt-4">
                    <h3 className="font-semibold mb-4 text-white text-lg">🔧 Code Playground</h3>
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
