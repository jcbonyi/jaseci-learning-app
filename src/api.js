// api.js - wrapper for calling Jac walkers via HTTP API
// Custom implementation to avoid 'nd' parameter that jac-client adds

// API base URL - use relative path when served by jac serve
const API_BASE = '';

// Cache for API responses
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache TTL
const CACHEABLE_WALKERS = ['get_dashboard', 'get_notes', 'recommend_next'];

function getCacheKey(walkerName, args) {
    return `${walkerName}:${JSON.stringify(args)}`;
}

function getCached(walkerName, args) {
    if (!CACHEABLE_WALKERS.includes(walkerName)) return null;
    
    const key = getCacheKey(walkerName, args);
    const entry = cache.get(key);
    
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        console.log(`[Cache HIT] ${walkerName}`);
        return entry.data;
    }
    
    if (entry) {
        cache.delete(key);
    }
    return null;
}

function setCache(walkerName, args, data) {
    if (!CACHEABLE_WALKERS.includes(walkerName)) return;
    if (data.error) return;
    
    const key = getCacheKey(walkerName, args);
    cache.set(key, { data, timestamp: Date.now() });
    console.log(`[Cache SET] ${walkerName}`);
}

export function invalidateCache(pattern = '') {
    if (pattern) {
        for (const key of cache.keys()) {
            if (key.includes(pattern)) {
                cache.delete(key);
            }
        }
    } else {
        cache.clear();
    }
    console.log(`[Cache INVALIDATED] ${pattern || 'all'}`);
}

// Call a Jac walker via HTTP API
// Custom implementation to avoid 'nd' parameter that jac-client adds
async function jacSpawn(walker, fields = {}) {
    const url = API_BASE ? `${API_BASE}/walker/${walker}` : `/walker/${walker}`;
    // Use jac-client's token management
    const token = localStorage.getItem('jac_token') || '';
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        },
        // Don't include 'nd' parameter - walkers don't expect it
        body: JSON.stringify(fields)
    });

    const responseText = await response.text();
    
    if (!response.ok) {
        let errorMessage = `Walker ${walker} failed`;
        try {
            const errorJson = JSON.parse(responseText);
            errorMessage = errorJson.error || errorJson.message || errorMessage;
        } catch {
            errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}`);
    }
}

export async function callWalker(walkerName, args = {}) {
    const cached = getCached(walkerName, args);
    if (cached) return cached;
    
    try {
        const data = await jacSpawn(walkerName, args);
        
        let result;
        
        if (data.error) {
            result = { error: data.error };
        } else if (data.reports && data.reports.length > 0) {
            result = data.reports[0];
        } else if (data.returns && data.returns.length > 0) {
            result = data.returns[0];
        } else if (data.context) {
            if (data.context.report !== undefined) {
                result = Array.isArray(data.context.report) ? data.context.report[0] : data.context.report;
            } else if (data.context.reports && data.context.reports.length > 0) {
                result = data.context.reports[0];
            } else {
                result = data.context;
            }
        } else if (data.result !== undefined) {
            result = data.result;
        } else {
            result = data;
        }

        setCache(walkerName, args, result);
        return result;
    } catch (error) {
        console.error(`Error calling walker ${walkerName}:`, error);
        return { error: String(error) };
    }
}

// Walker API functions
export async function createUser(userId) {
    return await callWalker('create_user', { user_id: userId });
}

export async function getNextLesson(userId) {
    return await callWalker('get_next_lesson', { user_id: userId });
}

export async function recordLessonProgress(userId, lessonTitle, completed) {
    const result = await callWalker('record_lesson_progress', {
        user_id: userId,
        lesson_title: lessonTitle,
        completed: completed
    });
    invalidateCache(userId);
    return result;
}

export async function getDashboard(userId) {
    return await callWalker('get_dashboard', { user_id: userId });
}

export async function generateQuiz(concept) {
    return await callWalker('generate_quiz', { concept_name: concept });
}

export async function updateMastery(userId, conceptName, score) {
    const result = await callWalker('update_mastery', {
        user_id: userId,
        concept_name: conceptName,
        score: score
    });
    invalidateCache(userId);
    return result;
}

export async function recommendNext(userId) {
    return await callWalker('recommend_next', { user_id: userId });
}

export async function saveNote(userId, conceptName, noteText) {
    return await callWalker('save_note', {
        user_id: userId,
        concept_name: conceptName,
        note_text: noteText
    });
}

export async function getNotes(userId) {
    return await callWalker('get_notes', { user_id: userId });
}

export async function getConceptDynamic(conceptName, useAI = true) {
    return await callWalker('get_concept_dynamic', {
        concept_name: conceptName,
        use_ai: useAI
    });
}

export async function getLessonDynamic(lessonTitle, useAI = true) {
    return await callWalker('get_lesson_dynamic', {
        lesson_title: lessonTitle,
        use_ai: useAI
    });
}

export async function generateQuizWithAI(conceptName, numQuestions = 5) {
    return await callWalker('generate_quiz_with_ai', {
        concept_name: conceptName,
        num_questions: numQuestions
    });
}

export async function generateLessonWithAI(topic, difficulty = 1) {
    return await callWalker('generate_lesson_with_ai', {
        topic: topic,
        difficulty: difficulty
    });
}

export async function generateConceptWithAI(name, difficulty = 1) {
    return await callWalker('generate_concept_with_ai', {
        name: name,
        difficulty: difficulty
    });
}

export async function evaluateAnswer(quizId, answers) {
    return await callWalker('evaluate_answer', {
        quiz_id: quizId,
        submitted_answers: answers
    });
}

export async function spawn(walkerName, args = {}) {
    return await callWalker(walkerName, args);
}

export async function healthCheck() {
    try {
        const url = API_BASE ? `${API_BASE}/` : '/';
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        return response.ok;
    } catch {
        try {
            const url = API_BASE ? `${API_BASE}/walkers` : '/walkers';
            const response = await fetch(url, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            return response.ok;
        } catch {
            return false;
        }
    }
}

