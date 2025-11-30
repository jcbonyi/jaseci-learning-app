# Integration Test & Demo Walkthrough

This document provides a step-by-step guide to test all features of the Interactive Learning Platform.

## Prerequisites

- **Python 3.10+** with `jaclang`, `jac-cloud`, `byllm`, and `python-dotenv` installed
- **Node.js 16+** with npm
- **Gemini API Key** in `backend/.env`

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                       │
│  - Vite dev server on http://localhost:5173                    │
│  - Dashboard with AI-powered concept cards                      │
│  - Lesson pages with dynamic AI content                        │
│  - Code Playground with Walker API mode                         │
│  - Persistent notes feature                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
              fetch('/walker/...')
                       │ (proxied by Vite)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│              Backend (jac-cloud server)                         │
│  - HTTP server on http://localhost:8000                        │
│  - All-in-one main.jac with nodes and walkers                  │
│  - Gemini AI integration via byllm                             │
│  - LocalDB for persistence                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Start the Application

### 1.1 Set Up API Key

Create `backend/.env`:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

Get a free key at: https://aistudio.google.com/apikey

### 1.2 Start Backend

```bash
cd backend
python start_server.py
```

Expected output:
```
✓ Gemini API key detected.
Starting Jac backend with command: jac serve main.jac
INFO - DATABASE_HOST is not available! Using LocalDB...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 1.3 Start Frontend

Open a new terminal:
```bash
cd frontend
npm install  # First time only
npm run dev
```

Expected output:
```
  VITE v5.x.x  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### 1.4 Verify Both Running

Open **http://localhost:5173/** - you should see:
- Header showing "Interactive Jac Tutor" with "● API Online" indicator
- Progress Dashboard with 7 concept cards
- Skill Map on the right
- Code Playground at the bottom

---

## Step 2: Test Dashboard Features

### 2.1 Concept Cards

1. **View all concepts** - 7 cards showing Jac syntax → AI agents
2. **Check status indicators:**
   - Gray = Not Started (0%)
   - Yellow = In Progress (1-69%)
   - Blue = Proficient (70-84%)
   - Green = Mastered (85%+)

### 2.2 Concept Detail Panel with AI Content

1. Click on **"Jac syntax"** card
2. A detail panel opens with:
   - **🤖 AI Content** toggle checkbox
   - Navigation arrows (← Previous / Next →)
   - Progress bar with score
   - Three tabs: **📖 Content**, **💻 Examples**, **📝 Take Quiz**

### 2.3 Test AI-Generated Content

1. Ensure **"🤖 AI Content"** checkbox is checked
2. See **"⏳ Generating with Gemini..."** while loading
3. See **"✨ AI Content Loaded"** when done
4. Content shows **"AI Generated"** badge

### 2.4 Test Content Tab

1. Click **📖 Content** tab (default)
2. Verify you see:
   - "Overview" section with AI-generated intro
   - "Detailed Explanation" section
   - "📝 Your Notes" section with textarea

### 2.5 Test Examples Tab

1. Click **💻 Examples** tab
2. Verify:
   - Multiple AI-generated code examples
   - Each has a title and "AI" badge
   - Code is properly formatted

### 2.6 Test Quiz Tab (5 Questions)

1. Click **📝 Take Quiz** tab
2. See **"🤖 Generating quiz questions with AI..."**
3. Verify:
   - **5 multiple choice questions** appear (AI-generated)
   - Select answers for all questions
   - Click "Submit Quiz" button
   - Score displayed (🎉 Passed! or 📚 Keep Learning!)
   - Click "Retry Quiz" to try again

### 2.7 Test Practice Buttons

1. In the detail panel, click **"+ Practice (+10%)"**
2. Score increases by 10%
3. Progress bar and Skill Map update immediately

---

## Step 3: Test Notes Feature

### 3.1 Add a Note

1. Click any concept card to open details
2. Scroll to "📝 Your Notes" section
3. Type something in the textarea
4. Watch for "💾 Saving..." indicator
5. See "✓ Saved" confirmation

### 3.2 Verify Persistence

1. Refresh the page (F5)
2. Click the same concept card
3. Your note should still be there!

---

## Step 4: Test Lesson Page with AI Content

### 4.1 View Lesson

1. Scroll to the Lesson section (below Dashboard)
2. Current lesson shows with:
   - Title and difficulty stars
   - **🤖 AI-Generated Content** toggle
   - Overview (AI-generated)

### 4.2 Test AI Content Toggle

1. Enable **"🤖 AI-Generated Content"** checkbox
2. See loading spinner: "Generating lesson overview with AI..."
3. Content updates with AI-generated material
4. **"✨ AI Content Loaded"** indicator appears

### 4.3 Test Lesson Tabs

1. **📖 Lesson Content** - AI-generated detailed explanation + key takeaways
2. **💻 Code Examples** - AI-generated examples
3. **📝 Take Quiz** - 5 AI-generated questions

### 4.4 Test Quiz Requirement

1. Notice the **"Mark Complete"** button is **disabled** (gray)
2. See the yellow warning: "You must pass the quiz (score ≥ 70%)..."
3. Click **"Take Quiz →"** link or the Quiz tab
4. Answer all 5 questions and submit
5. If score ≥ 70%:
   - "🎉 Passed!" message appears
   - "Mark Complete" button becomes **enabled** (blue)
6. If score < 70%:
   - "📚 Keep Learning!" message appears
   - Click "Retry Quiz" to try again

### 4.5 Test Mark Complete

1. After passing quiz, click **"✓ Mark Complete"** button
2. Lesson marked as complete
3. Dashboard refreshes automatically
4. Next lesson appears

---

## Step 5: Test Code Playground

### 5.1 Test Walker API Mode (Recommended)

1. Scroll to "Code Playground" section
2. Click **"🚀 Walker API"** button
3. Editor shows: `get_dashboard({ user_id: "demo_user" })`
4. Click **"▶ Run"**
5. Output shows JSON with user data, concepts, scores

### 5.2 Test Quick Buttons (Walker Mode)

| Button | Output |
|--------|--------|
| Dashboard | User's concept scores and progress |
| Next Lesson | Next recommended lesson |
| Recommendations | Weakest concepts to study |
| Static Quiz | Quiz questions (non-AI) |

### 5.3 Test AI Generation Buttons

In Walker API mode, find the purple **"🤖 AI Generation"** section:

| Button | Description |
|--------|-------------|
| 🎯 AI Quiz: Walkers | Generate 5 AI quiz questions |
| 🎯 AI Quiz: Nodes | Generate quiz about nodes |
| 📚 AI Lesson | Generate lesson content |
| 💡 AI Concept | Generate concept description |

---

## Step 6: Test Data Persistence

### 6.1 Make Changes

1. Practice a few concepts (click +10%)
2. Add notes to concepts
3. Complete a lesson (pass quiz first!)

### 6.2 Verify Persistence

1. Refresh the browser (F5)
2. All scores, notes, and completed lessons should persist

### 6.3 Reset Data (Optional)

To start fresh, restart the backend:
```bash
cd backend
python start_server.py
```

---

## Step 7: API Testing (Optional)

Test walkers directly via curl:

```bash
# Create user
curl -X POST http://localhost:8000/walker/create_user \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'

# Get dashboard
curl -X POST http://localhost:8000/walker/get_dashboard \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'

# Generate AI quiz (5 questions)
curl -X POST http://localhost:8000/walker/generate_quiz \
  -H "Content-Type: application/json" \
  -d '{"concept_name": "Walkers"}'

# Get dynamic lesson content (AI)
curl -X POST http://localhost:8000/walker/get_lesson_dynamic \
  -H "Content-Type: application/json" \
  -d '{"lesson_title": "Intro to Jac syntax", "use_ai": true}'

# Get dynamic concept content (AI)
curl -X POST http://localhost:8000/walker/get_concept_dynamic \
  -H "Content-Type: application/json" \
  -d '{"concept_name": "Walkers", "use_ai": true}'
```

---

## Summary of All Walkers

### Core Walkers

| Walker | Arguments | Returns |
|--------|-----------|---------|
| `create_user` | `user_id` | `{status, user}` |
| `get_next_lesson` | `user_id` | `{next_lesson}` |
| `record_lesson_progress` | `user_id, lesson_title, completed` | `{status, completed_lessons}` |
| `get_dashboard` | `user_id` | `{user, completed_lessons, concepts}` |
| `generate_quiz` | `concept_name` | `{quiz_id, questions}` (5 AI questions) |
| `recommend_next` | `user_id` | `{recommendations}` |
| `update_mastery` | `user_id, concept_name, score` | `{status, score}` |
| `save_note` | `user_id, concept_name, note_text` | `{status}` |
| `get_notes` | `user_id` | `{notes}` |

### AI-Powered Walkers

| Walker | Arguments | Returns |
|--------|-----------|---------|
| `get_lesson_dynamic` | `lesson_title, use_ai` | AI-generated lesson content |
| `get_concept_dynamic` | `concept_name, use_ai` | AI-generated concept content |
| `generate_quiz_with_ai` | `concept_name, num_questions` | AI quiz (default 5 questions) |
| `generate_lesson_with_ai` | `topic, difficulty` | Full AI lesson |
| `generate_concept_with_ai` | `name, difficulty` | Full AI concept |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `API key not valid` | Check `backend/.env` has valid `GEMINI_API_KEY` |
| AI content not loading | Ensure `byllm` installed: `pip install byllm` |
| `npm install` fails | Ensure Node.js 16+ (`node --version`) |
| `jac serve` fails | Check `main.jac` for syntax errors |
| "API Offline" | Ensure backend running on port 8000 |
| Notes not saving | Restart backend |
| Quiz shows 3 questions | Update code - should be 5 now |
| "Mark Complete" disabled | Pass the quiz first (≥70%) |

---

## ✅ Test Checklist

- [ ] Backend starts with "✓ Gemini API key detected"
- [ ] Frontend shows "API Online"
- [ ] 7 concept cards displayed
- [ ] AI toggle works in concept detail panel
- [ ] AI content generates with loading indicator
- [ ] Content tab shows AI-generated overview
- [ ] Examples tab shows AI-generated code
- [ ] Quiz generates **5 AI questions**
- [ ] Quiz scoring works correctly
- [ ] Practice +10% updates score
- [ ] Notes auto-save and persist
- [ ] Lesson page shows AI-generated content
- [ ] Mark Complete disabled until quiz passed
- [ ] Mark Complete enabled after passing (≥70%)
- [ ] Walker API mode works in Code Playground
- [ ] AI Generation buttons work

---

**All tests passing? 🎉 The app is fully functional with AI!**
