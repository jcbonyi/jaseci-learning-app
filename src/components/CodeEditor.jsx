import React, { useRef, useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { spawn } from '../api'
import { useCode } from './CodeContext'

export default function CodeEditor({value = "// write Spawn('walker', { args }) calls here", language = 'javascript', onChange}) {
    const editorRef = useRef(null)
    const [output, setOutput] = useState(null)
    const [runAsUser, setRunAsUser] = useState('demo_user')
    const [loading, setLoading] = useState(false)
    const [editorReady, setEditorReady] = useState(false)
    const [mode, setMode] = useState('walker') // Default to 'walker' mode since it works without WSL setup
    
    // Listen for code from other components (e.g., "Try in Playground" buttons)
    const { codeToTry, clearCode } = useCode()
    
    useEffect(() => {
        if (codeToTry && editorRef.current) {
            editorRef.current.setValue(codeToTry)
            setMode('jac') // Switch to Jac mode for code examples
            clearCode()
        }
    }, [codeToTry, clearCode])

    function handleEditorDidMount(editor, monaco) { 
        editorRef.current = editor
        setEditorReady(true)
        
        // Add keyboard shortcut: Ctrl+Enter to run
        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
            document.getElementById('run-code-btn')?.click()
        })
    }

    // Run actual Jac code via the /api/run-jac endpoint
    async function runJacCode(code) {
        try {
            const response = await fetch('/api/run-jac', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            })
            if (!response.ok) {
                return { error: `Server error: ${response.status}. Make sure Vite is running properly.` }
            }
            const result = await response.json()
            if (result.success) {
                return { output: result.output || '(no output)' }
            } else {
                return { error: result.error || 'Unknown error' }
            }
        } catch (e) {
            // Provide helpful error message
            if (e.message.includes('Failed to fetch')) {
                return { 
                    error: `Jac Code execution is not available.\n\nThis feature requires the Vite middleware to run 'jac' commands.\n\nAlternatives:\n1. Use "Walker API" mode to call walkers\n2. Run jac code directly in terminal: jac run yourfile.jac`,
                    tip: 'Switch to Walker API mode for testing walker calls'
                }
            }
            return { error: `Failed to run code: ${e.message}` }
        }
    }

    function parseSpawnCall(code) {
        // Remove comments and get clean code
        const cleanCode = code
            .split('\n')
            .map(line => line.replace(/\/\/.*$/, '').trim())
            .filter(line => line.length > 0)
            .join(' ')
        
        console.log('Parsing code:', cleanCode)
        
        // Try simple format first: walker_name({ args }) or walker_name({})
        const simpleRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*(\{[\s\S]*\})\s*\)$/
        let m = cleanCode.match(simpleRegex)
        if (m) {
            const walker = m[1]
            const argsBracket = m[2]
            try {
                let normalized = argsBracket
                    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
                    .replace(/'/g, '"')
                const argsObj = JSON.parse(normalized)
                console.log('Parsed simple format:', walker, argsObj)
                return { walker, args: argsObj, format: 'spawn' }
            } catch (e) {
                return { walker, argsRaw: argsBracket, parseError: String(e), format: 'spawn' }
            }
        }

        // Try Spawn format: Spawn('walker_name', { ... })
        const spawnRegex = /Spawn\s*\(\s*['"]([a-zA-Z0-9_\-]+)['"]\s*,\s*(\{[\s\S]*?\})\s*\)/
        m = cleanCode.match(spawnRegex)
        if (m) {
            const walker = m[1]
            const argsBracket = m[2]
            try {
                let normalized = argsBracket
                    .replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')
                    .replace(/'/g, '"')
                const argsObj = JSON.parse(normalized)
                console.log('Parsed Spawn format:', walker, argsObj)
                return { walker, args: argsObj, format: 'spawn' }
            } catch (e) {
                return { walker, argsRaw: argsBracket, parseError: String(e), format: 'spawn' }
            }
        }

        // Try just walker name with empty args: walker_name() or walker_name
        const bareWalkerRegex = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*\(\s*\)?\s*$/
        m = cleanCode.match(bareWalkerRegex)
        if (m) {
            const walker = m[1]
            console.log('Parsed bare walker:', walker)
            return { walker, args: {}, format: 'spawn' }
        }

        console.log('No match found for:', cleanCode)
        return null
    }

    async function run() {
        if (!editorRef.current) {
            setOutput({ error: 'Editor is still loading. Please wait and try again.' })
            return
        }
        const code = editorRef.current.getValue()
        if (!code || code.trim() === '') {
            setOutput({ error: 'Please enter some code to run.' })
            return
        }

        setLoading(true)
        try {
            if (mode === 'jac') {
                // Run actual Jac code
                const result = await runJacCode(code)
                setOutput(result)
            } else {
                // Walker API mode
                const parsed = parseSpawnCall(code)
                if (!parsed) {
                    setOutput({ 
                        error: 'Could not parse walker call. Try one of these formats:',
                        examples: [
                            'get_dashboard({ user_id: "demo_user" })',
                            'spawn_init({})',
                            'generate_quiz({ concept_name: "Walkers" })'
                        ]
                    })
                    return
                }
                if (parsed.parseError) {
                    setOutput({ error: `Failed to parse arguments: ${parsed.parseError}` })
                    return
                }
                
                let args = parsed.args || {}
                // Auto-inject user_id if not present and this looks like a user-facing walker
                const userWalkers = ['get_next_lesson', 'record_lesson_progress', 'get_dashboard', 'recommend_next', 'update_mastery']
                if (userWalkers.includes(parsed.walker) && !('user_id' in args)) {
                    args.user_id = runAsUser
                }
                
                const res = await spawn(parsed.walker, args)
                setOutput(res)
            }
        } catch (e) {
            setOutput({ error: String(e) })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            {/* Mode Toggle */}
            <div className="flex gap-2 mb-3 items-center">
                <button
                    onClick={() => {
                        setMode('jac')
                        if (editorRef.current) {
                            editorRef.current.setValue('let a = 5;\nlet b = 7;\nlet sum = a + b;\nprint("Sum =", sum);')
                        }
                    }}
                    className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                        mode === 'jac' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    🔧 Jac Code
                </button>
                <button
                    onClick={() => {
                        setMode('walker')
                        if (editorRef.current) {
                            editorRef.current.setValue(`get_dashboard({ user_id: "${runAsUser}" })`)
                        }
                    }}
                    className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                        mode === 'walker' 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                >
                    🚀 Walker API
                </button>
                {mode === 'jac' && (
                    <span className="text-xs text-yellow-400 ml-2" title="Jac Code mode requires 'jac' CLI in your system PATH. For WSL users, run jac code directly in terminal instead.">
                        ⚠️ WSL: Run in terminal instead
                    </span>
                )}
                <span className="text-xs text-gray-500 ml-auto">
                    Ctrl+Enter to run
                </span>
            </div>

            <div className="border border-gray-600 rounded overflow-hidden">
                <Editor
                    height="300px"
                    defaultLanguage="python"
                    defaultValue={value}
                    onMount={handleEditorDidMount}
                    onChange={(val) => onChange && onChange(val)}
                    options={{ 
                        minimap: { enabled: false },
                        fontSize: 14,
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false
                    }}
                    theme="vs-dark"
                    loading={<div className="flex items-center justify-center h-[300px] bg-gray-800 text-gray-400">Loading code editor...</div>}
                />
            </div>
            <div className="mt-3 flex gap-3 items-center flex-wrap">
                <button 
                    id="run-code-btn"
                    className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded font-medium disabled:opacity-50 transition-colors" 
                    onClick={run}
                    disabled={loading || !editorReady}
                >
                    {!editorReady ? 'Loading Editor...' : loading ? 'Running...' : '▶ Run'}
                </button>
                <button 
                    className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded font-medium transition-colors" 
                    onClick={() => { if (editorRef.current) editorRef.current.setValue('') }}
                >
                    Clear
                </button>
                {mode === 'walker' && (
                    <label className="text-sm text-gray-300 flex items-center gap-2">
                        User ID: 
                        <input 
                            type="text" 
                            value={runAsUser} 
                            onChange={(e) => setRunAsUser(e.target.value)} 
                            className="border border-gray-600 bg-gray-700 text-white rounded px-3 py-1.5 w-36 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                        />
                    </label>
                )}
            </div>
            
            {/* Quick Actions - Different for each mode */}
            <div className="mt-3 flex gap-2 flex-wrap">
                <span className="text-xs text-gray-400 self-center">Examples:</span>
                {mode === 'jac' ? (
                    <>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue('let a = 5;\nlet b = 7;\nlet sum = a + b;\nprint("Sum =", sum);') }}
                        >
                            Variables
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue('for i in range(5) {\n    print("Count:", i);\n}') }}
                        >
                            For Loop
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue('let nums = [1, 2, 3, 4, 5];\nlet total = 0;\nfor n in nums {\n    total += n;\n}\nprint("Total:", total);') }}
                        >
                            List Sum
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue('node Person {\n    has name: str;\n    has age: int;\n}\n\nwith entry {\n    let p = Person(name="Alice", age=30);\n    print("Name:", p.name);\n    print("Age:", p.age);\n}') }}
                        >
                            Node
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue('node City {\n    has name: str;\n}\n\nwalker Explorer {\n    can discover with `root entry {\n        here ++> City(name="Paris");\n        here ++> City(name="Tokyo");\n        visit [-->];\n    }\n    can greet with City entry {\n        print("Visiting:", here.name);\n    }\n}\n\nwith entry {\n    root spawn Explorer();\n}') }}
                        >
                            Walker
                        </button>
                    </>
                ) : (
                    <>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue(`get_dashboard({ user_id: "${runAsUser}" })`) }}
                        >
                            Dashboard
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue(`get_next_lesson({ user_id: "${runAsUser}" })`) }}
                        >
                            Next Lesson
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue(`recommend_next({ user_id: "${runAsUser}" })`) }}
                        >
                            Recommendations
                        </button>
                        <button 
                            className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded transition-colors"
                            onClick={() => { if (editorRef.current) editorRef.current.setValue(`generate_quiz({ concept_name: "Walkers" })`) }}
                        >
                            Static Quiz
                        </button>
                    </>
                )}
            </div>
            
            {/* AI Generation Section */}
            {mode === 'walker' && (
                <div className="mt-3 p-3 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded border border-purple-700/50">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-purple-300">🤖 AI Generation (Jac byLLM + OpenAI):</span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                        <button 
                            className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded transition-colors"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { generateQuizWithAI } = await import('../api');
                                    const result = await generateQuizWithAI("Walkers", 3);
                                    setOutput(result);
                                } catch (e) {
                                    setOutput({ error: e.message });
                                }
                                setLoading(false);
                            }}
                        >
                            🎯 AI Quiz: Walkers
                        </button>
                        <button 
                            className="text-xs bg-purple-700 hover:bg-purple-600 text-white px-3 py-1.5 rounded transition-colors"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { generateQuizWithAI } = await import('../api');
                                    const result = await generateQuizWithAI("Nodes & edges", 3);
                                    setOutput(result);
                                } catch (e) {
                                    setOutput({ error: e.message });
                                }
                                setLoading(false);
                            }}
                        >
                            🎯 AI Quiz: Nodes
                        </button>
                        <button 
                            className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { generateLessonWithAI } = await import('../api');
                                    const result = await generateLessonWithAI("Graph Traversal in Jac", 2);
                                    setOutput(result);
                                } catch (e) {
                                    setOutput({ error: e.message });
                                }
                                setLoading(false);
                            }}
                        >
                            📚 AI Lesson: Graph Traversal
                        </button>
                        <button 
                            className="text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded transition-colors"
                            onClick={async () => {
                                setLoading(true);
                                try {
                                    const { generateConceptWithAI } = await import('../api');
                                    const result = await generateConceptWithAI("Spatial Computing", 1);
                                    setOutput(result);
                                } catch (e) {
                                    setOutput({ error: e.message });
                                }
                                setLoading(false);
                            }}
                        >
                            💡 AI Concept: Spatial Computing
                        </button>
                    </div>
                </div>
            )}
            
            <div className="mt-4">
                <h4 className="font-semibold text-gray-300 mb-2">Output</h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded max-h-64 overflow-auto text-sm font-mono border border-gray-700 whitespace-pre-wrap">
                    {output ? (typeof output === 'string' ? output : JSON.stringify(output, null, 2)) : '// Output will appear here'}
                </pre>
            </div>
        </div>
    )
}

