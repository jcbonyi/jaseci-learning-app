# Integration Test & Demo Walkthrough

This document provides a step-by-step guide to test all features of the Interactive Learning Platform.

## Prerequisites

- **Python 3.10+** with `jaclang==0.8.10`, `jac-cloud==0.2.0`, `byllm`, and `python-dotenv` installed
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
│  - Theme toggle, achievements, analytics                        │
│  - Service Worker for offline support                          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
              fetch('/walker/...')
                       │ (proxied by Vite, cached by api.js)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│              Backend (jac-cloud server)                         │
│  - HTTP server on http://localhost:8000                        │
│  - All-in-one main.jac with nodes and walkers                  │
│  - Gemini AI integration via byllm                             │
│  - SQLite LocalDB for persistence (backend/data/)              │
└─────────────────────────────────────────────────────────────────┘
```

---

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
💾 Database path: C:\...\backend\data\jaseci_db
🚀 Starting Jac server...
   Press Ctrl+C to stop

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
- **Theme toggle** button (🌙/☀️) in the header
- Progress Dashboard with 7 concept cards
- Skill Map on the right
- Code Playground at the bottom
- **Achievements** section in the sidebar

---

## Step 2: Test Theme Toggle

### 2.1 Toggle Theme

1. Click the **🌙** (moon) icon in the header
2. The entire app switches to **light mode**
3. Click the **☀️** (sun) icon to switch back to **dark mode**
4. Refresh the page - **theme preference persists!**

---

## Step 3: Test Dashboard Features

### 3.1 Concept Cards

1. **View all concepts** - 7 cards showing Jac syntax → AI agents
2. **Check status indicators:**
   - Gray = Not Started (0%)
   - Yellow = In Progress (1-69%)
   - Blue = Proficient (70-84%)
   - Green = Mastered (85%+)

### 3.2 Concept Detail Panel with AI Content

1. Click on **"Jac syntax"** card
2. A detail panel opens with:
   - **🤖 AI Content** toggle checkbox
   - Navigation arrows (← Previous / Next →)
   - Progress bar with score
   - Three tabs: **📖 Content**, **💻 Examples**, **📝 Take Quiz**

### 3.3 Test AI-Generated Content

1. Ensure **"🤖 AI Content"** checkbox is checked
2. See **"⏳ Generating with Gemini..."** while loading
3. See **"✨ AI Content Loaded"** when done
4. Content shows **"AI Generated"** badge

### 3.4 Test "Try it" Buttons

1. Click **💻 Examples** tab
2. Each code example has a **"Try it →"** button
3. Click the button - code is loaded into the Code Playground
4. The playground scrolls into view automatically

---

## Step 4: Test Learning Analytics

### 4.1 Open Analytics Dashboard

1. In the sidebar, click **📈 Analytics** button
2. A modal opens showing:
   - **Summary cards**: Avg Score, Mastered, Lessons Done, Quiz Attempts
   - **Progress bar**: Visual breakdown by status
   - **Score distribution**: Chart showing score ranges
   - **Concept breakdown**: All concepts with scores
   - **Tips**: Personalized suggestions

### 4.2 Verify Analytics Data

1. Practice a few concepts (click +10% buttons)
2. Take some quizzes
3. Open Analytics again - data should update

---

## Step 5: Test Achievements

### 5.1 View Achievements

1. In the sidebar, find **🏅 Achievements** section
2. See 8 achievement badges
3. Unlocked achievements are highlighted
4. Hover for tooltips with requirements

### 5.2 Unlock Achievements

| Action | Achievement |
|--------|-------------|
| Complete first lesson | 🎯 First Steps |
| Complete 3 quizzes | 📝 Quiz Taker |
| Score 80%+ on any quiz | ⭐ Rising Star |
| Master any concept (85%+) | 🏆 Master |
| Complete all 7 concepts | 📚 Scholar |
| 3 lessons in a row | 🔥 Streak |
| Try all 7 concepts | 💡 Explorer |
| 100% mastery on any concept | 👑 Perfectionist |

---

## Step 6: Test Quiz & Quiz History

### 6.1 Take a Quiz

1. Click any concept card
2. Go to **📝 Take Quiz** tab
3. Answer all 5 questions
4. Submit and see results

### 6.2 Review Quiz History

1. After taking quizzes, find **📜 Quiz History** in the sidebar
2. Click to see all past attempts
3. Each entry shows:
   - Date/time
   - Score
   - Concept name
4. Click any attempt to **review answers**
5. See which answers were correct/incorrect

---

## Step 7: Test Progress Export/Import

### 7.1 Export Progress

1. Find the **Export/Import** buttons in the sidebar (next to "Your Progress")
2. Click **📥 Export**
3. A JSON file downloads with your progress

### 7.2 Import Progress

1. Click **📤 Import**
2. Select a previously exported JSON file
3. Progress is restored

---

## Step 8: Test Notes Feature

### 8.1 Add a Note

1. Click any concept card to open details
2. Scroll to "📝 Your Notes" section
3. Type something in the textarea
4. Watch for "💾 Saving..." indicator
5. See "✓ Saved" confirmation

### 8.2 Verify Persistence

1. Refresh the page (F5)
2. Click the same concept card
3. Your note should still be there!

---

## Step 9: Test Code Playground

### 9.1 Test Walker API Mode (Recommended)

1. Scroll to "Code Playground" section
2. Click **"🚀 Walker API"** button (should be default)
3. Editor shows: `get_dashboard({ user_id: "demo_user" })`
4. Click **"▶ Run (Ctrl+Enter)"**
5. Output shows JSON with user data, concepts, scores

### 9.2 Test Keyboard Shortcut

1. Click inside the editor
2. Press **Ctrl+Enter**
3. Code runs automatically!

### 9.3 Test Quick Buttons (Walker Mode)

| Button | Output |
|--------|--------|
| Dashboard | User's concept scores and progress |
| Next Lesson | Next recommended lesson |
| Recommendations | Weakest concepts to study |
| Static Quiz | Quiz questions (non-AI) |

### 9.4 Test AI Generation Buttons

In Walker API mode, find the purple **"🤖 AI Generation"** section:

| Button | Description |
|--------|-------------|
| 🎯 AI Quiz: Walkers | Generate 5 AI quiz questions |
| 🎯 AI Quiz: Nodes | Generate quiz about nodes |
| 📚 AI Lesson | Generate lesson content |
| 💡 AI Concept | Generate concept description |

### 9.5 Test Jac Code Mode

1. Click **"🔧 Jac Code"** button
2. Note the warning: "⚠️ WSL: Run in terminal instead"
3. Click **"Copy to clipboard"** to copy code
4. Run the code in your WSL/terminal with `jac` installed

---

## Step 10: Test Offline Support

### 10.1 Verify Service Worker

1. Open browser DevTools (F12)
2. Go to **Application** > **Service Workers**
3. You should see `sw.js` registered

### 10.2 Test Offline Mode

1. Stop the backend server (Ctrl+C)
2. Refresh the frontend page
3. Static content should still load (cached)
4. API calls will fail, but UI remains functional
5. Start backend again to restore full functionality

---

## Step 11: Test Breadcrumb Navigation

### 11.1 Navigate with Breadcrumbs

1. Click a concept card - breadcrumb shows: `Dashboard > [Concept Name]`
2. Click a lesson - breadcrumb shows: `Dashboard > Lessons > [Lesson Name]`
3. Click "Dashboard" in breadcrumb to go back
4. Breadcrumbs help you know where you are

---

## Step 12: Test API Caching

### 12.1 Verify Cache Hits

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Load the dashboard
4. See log: `[Cache SET] get_dashboard`
5. Navigate away and back
6. See log: `[Cache HIT] get_dashboard` (faster load!)

### 12.2 Cache Invalidation

1. Practice a concept (+10%)
2. See log: `[Cache INVALIDATED] demo_user`
3. Dashboard reloads fresh data

---

## Step 13: Test Mobile Responsiveness

### 13.1 Resize Browser

1. Open DevTools (F12)
2. Click **Toggle device toolbar** (phone icon)
3. Select mobile device (iPhone, Galaxy, etc.)
4. Verify:
   - Cards stack vertically
   - Sidebar collapses or scrolls
   - Text remains readable
   - Buttons are tap-friendly

---

## Step 14: API Testing (Optional)

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
| `jac serve` fails | Check `jaclang==0.8.10` and `jac-cloud==0.2.0` |
| "API Offline" | Ensure backend running on port 8000 |
| Notes not saving | Check `backend/data/` directory |
| Quiz shows 3 questions | Update code - should be 5 now |
| "Mark Complete" disabled | Pass the quiz first (≥70%) |
| Theme not persisting | Clear localStorage and try again |
| Achievements not updating | Refresh the page |

---

## ✅ Test Checklist

### Setup
- [ ] Backend starts with "✓ Gemini API key detected"
- [ ] Backend shows "💾 Database path: ..."
- [ ] Frontend shows "API Online"
- [ ] Service Worker registered

### Dashboard
- [ ] 7 concept cards displayed
- [ ] AI toggle works in concept detail panel
- [ ] AI content generates with loading indicator
- [ ] Content tab shows AI-generated overview
- [ ] Examples tab shows AI-generated code
- [ ] "Try it" buttons load code in playground

### Theme & UI
- [ ] Dark/light theme toggle works
- [ ] Theme persists after refresh
- [ ] Mobile responsive layout works
- [ ] Breadcrumb navigation works
- [ ] Skeleton loading states show

### Quizzes
- [ ] Quiz generates **5 AI questions**
- [ ] Quiz scoring works correctly
- [ ] Mark Complete disabled until quiz passed (≥70%)
- [ ] Mark Complete enabled after passing
- [ ] Quiz history shows past attempts
- [ ] Quiz review mode shows answers

### Progress
- [ ] Practice +10% updates score
- [ ] Notes auto-save and persist
- [ ] Export progress downloads JSON
- [ ] Import progress restores data
- [ ] API caching shows in console logs

### Code Playground
- [ ] Walker API mode works
- [ ] Ctrl+Enter keyboard shortcut runs code
- [ ] AI Generation buttons work
- [ ] Copy to clipboard works
- [ ] Example buttons work

### Achievements & Analytics
- [ ] 8 achievement badges shown
- [ ] Achievements unlock correctly
- [ ] Analytics modal opens
- [ ] Analytics shows correct stats

---

**All tests passing? 🎉 The app is fully functional!**
