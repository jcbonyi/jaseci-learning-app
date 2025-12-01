// api.js - wrapper for calling Jac walkers via HTTP API
// Compatible with jaclang 0.8+ REST API format
// When running `jac serve backend/main.jac`, walkers are exposed as REST endpoints

// In development with Vite proxy, use relative URL; otherwise use full URL
const API_BASE = import.meta.env.VITE_API_URL || '';

// ============================================
// API Response Cache
// ============================================
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute cache TTL
const CACHEABLE_WALKERS = ['get_dashboard', 'get_notes', 'recommend_next']; // Walkers safe to cache

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
        cache.delete(key); // Expired
    }
    return null;
}

function setCache(walkerName, args, data) {
    if (!CACHEABLE_WALKERS.includes(walkerName)) return;
    if (data.error) return; // Don't cache errors
    
    const key = getCacheKey(walkerName, args);
    cache.set(key, { data, timestamp: Date.now() });
    console.log(`[Cache SET] ${walkerName}`);
}

// Invalidate cache for a user (call after mutations)
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

/**
 * Call a Jac walker via the HTTP API (jaclang 0.8+ format)
 * @param {string} walkerName - Name of the walker to call
 * @param {object} args - Arguments to pass to the walker
 * @param {string} nodeId - Optional node ID to run walker on (default: root)
 * @returns {Promise<object>} - Walker response
 */
// Token helpers
const TOKEN_KEY = 'jac_token';

export function getToken() {
    try {
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
        return null;
    }
}

export function setToken(token) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {}
}

export async function callWalker(walkerName, args = {}, nodeId = '') {
    // Check cache first
    const cached = getCached(walkerName, args);
    if (cached) return cached;
    
    try {
        // Build headers and include Authorization if token present
        const headers = { 'Content-Type': 'application/json' };
        const token = getToken();
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Send args directly - jac-cloud expects flat JSON body
        const body = JSON.stringify(args);

        const response = await fetch(`${API_BASE}/walker/${walkerName}`, {
            method: 'POST',
            headers,
            body,
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log(`Walker ${walkerName} raw response:`, data);

        // jaclang returns in 'result' or includes 'error'
        let result;
        if (data.error) result = { error: data.error };
        else if (data.result) result = data.result;
        else if (data.returns && data.returns.length > 0) result = data.returns[0];
        else if (data.reports && data.reports.length > 0) result = data.reports[0];
        else result = data;

        // Cache the result
        setCache(walkerName, args, result);
        
        return result;
    } catch (error) {
        console.error(`Error calling walker ${walkerName}:`, error);
        return { error: String(error) };
    }
}

/**
 * Spawn a walker - alias for callWalker
 */
export async function spawn(walkerName, args = {}) {
    return await callWalker(walkerName, args);
}

// ============================================
// Walker API functions
// ============================================

// Initialize the graph with sample data
export async function initGraph() {
    return await callWalker('spawn_init', {});
}

// Create a new user
export async function createUser(userId) {
    return await callWalker('create_user', { user_id: userId });
}

// Get the next recommended lesson for a user
export async function getNextLesson(userId) {
    return await callWalker('get_next_lesson', { user_id: userId });
}

// Record lesson completion progress
export async function recordLessonProgress(userId, lessonTitle, completed) {
    const result = await callWalker('record_lesson_progress', {
        user_id: userId,
        lesson_title: lessonTitle,
        completed: completed
    });
    invalidateCache(userId); // Clear cache after mutation
    return result;
}

// Get user dashboard with all concept scores
export async function getDashboard(userId) {
    return await callWalker('get_dashboard', { user_id: userId });
}

// Generate a quiz for a concept
export async function generateQuiz(concept) {
    return await callWalker('generate_quiz', { concept_name: concept });
}

// Evaluate quiz answers
export async function evaluateAnswer(quizId, answers) {
    return await callWalker('evaluate_answer', {
        quiz_id: quizId,
        submitted_answers: answers
    });
}

// Update mastery score for a concept
export async function updateMastery(userId, conceptName, score) {
    const result = await callWalker('update_mastery', {
        user_id: userId,
        concept_name: conceptName,
        score: score
    });
    invalidateCache(userId); // Clear cache after mutation
    return result;
}

// Get recommended next concepts to study
export async function recommendNext(userId) {
    return await callWalker('recommend_next', { user_id: userId });
}

// Save a note for a concept
export async function saveNote(userId, conceptName, noteText) {
    return await callWalker('save_note', {
        user_id: userId,
        concept_name: conceptName,
        note_text: noteText
    });
}

// Get all notes for a user
export async function getNotes(userId) {
    return await callWalker('get_notes', { user_id: userId });
}

// ============================================
// AI/LLM-Powered Generation (Jac byLLM walkers)
// ============================================

// Generate quiz questions using AI (calls Jac byLLM walker)
export async function generateQuizWithAI(conceptName, numQuestions = 3) {
    return await callWalker('generate_quiz_with_ai', {
        concept_name: conceptName,
        num_questions: numQuestions
    });
}

// Generate lesson content using AI (calls Jac byLLM walker)
export async function generateLessonWithAI(topic, difficulty = 1) {
    return await callWalker('generate_lesson_with_ai', {
        topic: topic,
        difficulty: difficulty
    });
}

// Generate a new concept using AI (calls Jac byLLM walker)
export async function generateConceptWithAI(name, difficulty = 1) {
    return await callWalker('generate_concept_with_ai', {
        name: name,
        difficulty: difficulty
    });
}

// Get lesson with dynamic AI-generated content
export async function getLessonDynamic(lessonTitle, useAI = true) {
    return await callWalker('get_lesson_dynamic', {
        lesson_title: lessonTitle,
        use_ai: useAI
    });
}

// Get concept with dynamic AI-generated content
export async function getConceptDynamic(conceptName, useAI = true) {
    return await callWalker('get_concept_dynamic', {
        concept_name: conceptName,
        use_ai: useAI
    });
}

// ============================================
// Utility functions
// ============================================

// Health check for the API
export async function healthCheck() {
    try {
        const response = await fetch(`${API_BASE}/healthz`);
        return response.ok;
    } catch {
        return false;
    }
}

// ==========================
// Authentication endpoints
// ==========================

export async function authCreateUser(username, password) {
    try {
        const res = await fetch(`${API_BASE}/user/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) return { error: data.error || data };
        // server returns token on create
        if (data.token) setToken(data.token);
        return data;
    } catch (err) {
        return { error: String(err) };
    }
}

export async function authLogin(username, password) {
    try {
        const res = await fetch(`${API_BASE}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) return { error: data.error || data };
        if (data.token) setToken(data.token);
        return data;
    } catch (err) {
        return { error: String(err) };
    }
}

export function authLogout() {
    setToken(null);
}

// Get API base URL (for debugging)
export function getApiBase() {
    return API_BASE || window.location.origin;
}
