import React, {useState, useEffect} from 'react'
import { recordLessonProgress, generateQuiz, updateMastery, getLessonDynamic } from '../api'
import { saveQuizToHistory } from './QuizHistory'

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
        
        // Save to quiz history
        if (lesson.concepts && lesson.concepts.length > 0) {
            const conceptName = typeof lesson.concepts[0] === 'string' 
                ? lesson.concepts[0] 
                : lesson.concepts[0];
            saveQuizToHistory(userId, {
                concept: conceptName,
                score: score,
                questions: quizData.questions,
                answers: quizAnswers
            })
        }
        
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
            "Intro to Jac syntax": `Jac is a data-spatial programming language that extends Python with graph-based computing concepts. It introduces a unique paradigm where data and code exist as spatial objects in a graph structure, enabling powerful patterns for distributed systems and agent-based programming.

The language maintains Python's familiar syntax while adding three fundamental abstractions: nodes for data storage, edges for relationships, and walkers for traversal and computation. This combination allows developers to think about programs as graphs where computation happens at specific locations.

Variables in Jac are declared using the 'let' keyword, similar to JavaScript, but with Python-like type hints. The language supports standard types including integers, floats, strings, booleans, lists, and dictionaries. Control flow structures like if/elif/else conditionals and for/while loops work similarly to Python, but code blocks use curly braces instead of indentation.

The 'with entry { }' block defines the program's entry point, similar to Python's 'if __name__ == "__main__":' pattern. This is where execution begins when a Jac program runs. Statements end with semicolons, providing clear statement boundaries.

Jac's syntax is designed to be intuitive for Python developers while introducing graph-based concepts gradually. The language allows you to write traditional Python-like code but also leverage powerful graph operations when needed. This makes it easy to learn for those familiar with Python while opening up new programming paradigms.

Understanding Jac syntax is the foundation for all other concepts. Once you grasp how variables, types, and control flow work, you can build more complex graph structures and traversal patterns. The syntax is intentionally simple to keep the focus on the powerful graph-based features that make Jac unique.

In practice, Jac syntax enables you to express complex relationships and computations in a natural way. Whether you're building data pipelines, agent systems, or distributed applications, the syntax provides the building blocks while the graph structure provides the power.`,

            "Nodes & edges": `Nodes and edges form the fundamental building blocks of Jac's graph-based programming model. Nodes are containers that hold data, similar to objects or structs in other languages, but with the added power of being part of a spatial graph structure.

Each node type is defined using the 'node' keyword followed by a name and a block containing field declarations. Fields are declared with 'has' keyword, specifying both the field name and its type. For example, 'node Person { has name: str; has age: int; }' creates a Person node type with name and age fields.

Creating node instances is straightforward - you call the node type like a function with field values: 'Person(name="Alice", age=30)'. Once created, nodes exist in the graph and can be connected to other nodes through edges.

Edges represent relationships between nodes. The simplest edge is created using the '++>' operator, which creates a generic bidirectional connection. For example, 'nodeA ++> nodeB' connects nodeA to nodeB. You can also create typed edges with specific properties by defining an edge type first, then using the ':edge_type:' syntax.

Accessing connected nodes is done through the arrow operator, which returns a list of all nodes connected from the current node. You can filter by node type using bracket notation with type filtering syntax, which only returns nodes of the specified type. This enables powerful graph queries and traversals.

The graph structure enables spatial programming where the location of data and code matters. Nodes can have abilities (methods) that execute when walkers visit them, creating location-aware computation. This spatial aspect is what makes Jac unique - code behavior can depend on where it executes in the graph.

Understanding nodes and edges is crucial because they form the foundation for all graph operations. Whether you're building social networks, knowledge graphs, or state machines, nodes and edges provide the structure. The relationships you create determine how data flows and how computation happens across the graph.`,

            "Walkers deep-dive": `Walkers are mobile agents that traverse the graph and execute code at each node they visit. Think of them as autonomous programs that move through your graph structure, performing operations at each location. This is fundamentally different from traditional function calls - walkers have their own state and can make decisions about where to go next.

Walkers are defined using the 'walker' keyword followed by a name and a block containing their definition. They can have parameters declared with 'has', abilities defined with 'can', and entry/exit behaviors that execute when entering or leaving nodes. For example, 'walker Explorer { has target: str; can search with NodeType entry { } }' creates a walker with a target parameter and a search ability.

Spawning a walker means starting it on a specific node. The syntax 'root spawn Explorer()' starts the Explorer walker on the root node. Once spawned, the walker begins executing its entry behavior and can then move to connected nodes using the 'visit' keyword.

The 'visit' statement with bracket notation tells the walker to visit all connected nodes. You can also filter which nodes to visit using bracket notation with type filtering to only visit nodes of a specific type. The walker automatically traverses the graph, executing code at each node it visits.

Within a walker, 'here' refers to the current node the walker is on, while 'self' refers to the walker instance itself. This distinction is crucial - 'here' gives you access to the node's data and abilities, while 'self' gives you access to the walker's parameters and state.

Walkers can use 'report' to return data from their traversal, and 'disengage' to stop the traversal early. This allows walkers to search for specific nodes, collect information, or perform operations across the entire graph structure.

The power of walkers lies in their ability to combine graph traversal with computation. They can make decisions about where to go based on the data they encounter, creating dynamic and adaptive behaviors. This makes walkers ideal for tasks like searching, data collection, graph analysis, and implementing complex algorithms that need to traverse relationships.

Understanding walkers is essential for leveraging Jac's full potential. They enable you to write programs that naturally work with graph structures, making complex operations like pathfinding, graph queries, and distributed computation intuitive and elegant.`,

            "GraphOps & OSP patterns": `GraphOps (Graph Operations) and OSP (Object-Spatial Programming) are advanced concepts that unlock the full power of Jac's graph-based paradigm. GraphOps provides powerful query and manipulation capabilities, while OSP introduces spatial awareness where code behavior depends on location in the graph.

GraphOps enables sophisticated graph queries and filtering operations. The bracket notation with type filtering syntax filters nodes by type, allowing you to find all nodes of a specific type connected to the current node. This is incredibly powerful for traversing heterogeneous graphs where different node types represent different concepts or entities.

Edge traversal operations using bracket notation return all connected nodes, while bracket notation with edge type filtering filters by edge type. This allows you to follow specific relationship types in your graph, creating precise traversal patterns. You can combine these with conditions and loops to implement complex graph algorithms.

OSP (Object-Spatial Programming) is Jac's unique paradigm where code and data exist as spatial objects in the graph. The 'here' keyword refers to the current node context, while 'self' refers to the walker or ability context. This spatial awareness enables location-dependent behavior - the same code can behave differently depending on where it executes.

Nodes can have abilities (methods) defined with 'can' blocks that execute when walkers visit them. These abilities are spatial - they're tied to the node's location in the graph. This creates natural patterns for state machines, where nodes represent states and abilities represent state-specific behaviors.

The combination of GraphOps and OSP enables powerful patterns like distributed computation, where different parts of a graph handle different aspects of a problem. You can build systems where nodes collaborate through graph traversal, each contributing their spatial knowledge and abilities.

Understanding GraphOps and OSP patterns is essential for building sophisticated Jac applications. They enable you to think about computation in spatial terms, where the structure of your graph directly influences how your program behaves. This paradigm is particularly powerful for agent-based systems, distributed applications, and complex data processing pipelines.

Mastering these concepts allows you to leverage Jac's unique strengths - the ability to express complex relationships and computations in a natural, graph-oriented way. Whether you're building recommendation systems, knowledge graphs, or distributed agents, GraphOps and OSP provide the tools to make your graph structure work for you.`,

            "byLLM & Agents": `The byLLM decorator and AI agents represent the cutting edge of Jac programming, combining graph-based computation with artificial intelligence. byLLM enables AI-powered code generation at runtime, while agents combine walkers with LLM capabilities to create intelligent, autonomous systems.

The 'by llm()' decorator is a powerful feature that allows you to delegate function implementation to a Large Language Model. When you decorate an ability with 'by llm()', the LLM generates the implementation based on the function signature, docstring, and context. This is incredibly powerful for tasks like text generation, classification, summarization, and creative content creation.

To use byLLM, you simply decorate an ability with 'by llm()' and provide a clear docstring explaining what the function should do. The LLM reads the docstring, understands the context from the graph structure, and generates appropriate code. This enables rapid prototyping and allows you to leverage AI capabilities without writing complex AI integration code.

AI agents in Jac combine walkers with LLM capabilities to create intelligent, autonomous graph traversers. An agent can make decisions about where to go in the graph, what data to process, and how to respond based on AI reasoning. This creates systems that can adapt and learn from the graph structure they traverse.

Agents can use byLLM-decorated abilities to generate responses, analyze data, or make decisions. They combine spatial awareness (knowing where they are in the graph) with AI reasoning (understanding what to do), creating powerful hybrid systems. This is ideal for chatbots, recommendation engines, and adaptive learning systems.

The power of agents lies in their ability to combine multiple Jac features. They use walkers for traversal, GraphOps for querying, OSP for spatial awareness, and byLLM for AI capabilities. This creates systems that are both structured (through the graph) and intelligent (through AI), enabling sophisticated applications.

Understanding byLLM and agents opens up entirely new possibilities for Jac applications. You can build systems that generate content dynamically, adapt to user behavior, and make intelligent decisions based on graph structure. This makes Jac particularly powerful for educational systems, content generation, and adaptive applications.

Mastering these concepts allows you to build the next generation of intelligent applications - systems that combine the structure and clarity of graph-based programming with the flexibility and intelligence of AI. Whether you're building tutoring systems, recommendation engines, or creative tools, byLLM and agents provide the AI capabilities you need.`,

            "jac-client Integration": `jac-client is an npm package that provides essential utilities for integrating Jac backend applications with frontend JavaScript and React applications. It handles the complexity of API communication, authentication, and token management, making it easy to build full-stack applications with Jac backends.

The package provides several key functions: jacSpawn for calling walkers, jacSignup and jacLogin for user authentication, jacLogout for ending sessions, and jacIsLoggedIn for checking authentication status. These functions abstract away the HTTP API details, providing a clean, promise-based interface that feels natural in JavaScript.

Installing jac-client is straightforward - simply run 'npm install jac-client' in your frontend project. Once installed, you can import the functions you need: 'import { jacSpawn, jacLogin, jacSignup } from "jac-client"'. The package handles all the underlying HTTP communication, including proper headers, request formatting, and response parsing.

The jacSpawn function is the core of the package - it allows you to call any walker from your frontend code. You simply provide the walker name and arguments, and jacSpawn handles the HTTP POST request, error handling, and response parsing. It automatically includes authentication tokens if the user is logged in, making authenticated API calls seamless.

Authentication functions like jacSignup and jacLogin handle user registration and login, automatically storing tokens in localStorage for subsequent API calls. The jacIsLoggedIn function checks if a valid token exists, and jacLogout clears the stored token. This provides a complete authentication flow without requiring manual token management.

The package also handles errors gracefully, throwing meaningful error messages that you can catch and display to users. This makes error handling in your frontend code much simpler - you don't need to parse HTTP responses or check status codes manually.

Understanding jac-client is essential for building modern Jac applications with React or other JavaScript frameworks. It bridges the gap between the graph-based backend and the component-based frontend, enabling you to leverage Jac's power from familiar frontend development patterns.

Mastering jac-client integration allows you to build full-stack applications that combine Jac's graph-based computation with modern frontend frameworks. Whether you're building dashboards, learning platforms, or data visualization tools, jac-client provides the connection layer that makes it all work together seamlessly.`
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

