# Integration Test & Demo Walkthrough

This document provides a step-by-step guide to test all features of the Interactive Learning Platform.

## Prerequisites

- **Python 3.10+** with `jaclang` and `jac-cloud` installed
- **Node.js 16+** with npm
- Both backend and frontend running (see Quick Start in README.md)

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)                       │
│  - Vite dev server on http://localhost:5173                    │
│  - Dashboard with interactive concept cards                     │
│  - Lesson pages with detailed content & examples               │
│  - Code Playground with Jac Code & Walker API modes            │
│  - Persistent notes feature                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
              fetch('/walker/...')
              fetch('/api/run-jac')
                       │ (proxied by Vite)
                       │
┌──────────────────────▼──────────────────────────────────────────┐
│              Backend (jac-cloud server)                         │
│  - HTTP server on http://localhost:8000                        │
│  - All-in-one main.jac with nodes and walkers                  │
│  - LocalDB for persistence (.jac_mydb/)                        │
│  - 10 walkers for all app functionality                        │
└─────────────────────────────────────────────────────────────────┘
```

## Step 1: Start the Application

### 1.1 Start Backend

**Option A: Use startup script (Windows)**
```powershell
# Double-click start-backend.bat
# Or in PowerShell:
.\start-backend.ps1
```

**Option B: Manual start**
```bash
cd backend
# Windows PowerShell:
$env:REQUIRE_AUTH_BY_DEFAULT="false"; jac serve main.jac

# Linux/Mac/WSL:
REQUIRE_AUTH_BY_DEFAULT=false jac serve main.jac
```

Expected output:
```
INFO - DATABASE_HOST is not available! Using LocalDB...
INFO:     Started server process [...]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 1.2 Start Frontend

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

### 1.3 Verify Both Running

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

### 2.2 Concept Detail Panel

1. Click on **"Jac syntax"** card
2. A detail panel opens with:
   - Navigation arrows (← Previous / Next →)
   - Progress bar with score
   - Three tabs: **📖 Content**, **💻 Examples**, **📝 Take Quiz**

### 2.3 Test Content Tab

1. Click **📖 Content** tab (default)
2. Verify you see:
   - "📘 Detailed Explanation" section
   - "🎯 Key Takeaways" section
   - "📝 Your Notes" section with textarea

### 2.4 Test Examples Tab

1. Click **💻 Code Examples** tab
2. Verify:
   - Multiple code examples displayed
   - Each has a title and copy button
   - Click "📋 Copy" - should show "✓ Copied!"

### 2.5 Test Quiz Tab

1. Click **📝 Take Quiz** tab
2. Verify:
   - 3 multiple choice questions appear
   - Select answers for all questions
   - Click "Submit Quiz" button
   - Score displayed (🎉 Passed! or 📚 Keep Learning!)
   - Click "Retry Quiz" to try again

### 2.6 Test Practice Buttons

1. In the detail panel, click **"+ Practice (+10%)"**
2. Score increases by 10%
3. Progress bar and Skill Map update immediately

### 2.7 Test Mark Mastered

1. Click **"Mark Mastered"**
2. Score jumps to 100%
3. Card shows "Mastered" badge

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

## Step 4: Test Lesson Page

### 4.1 View Lesson

1. Scroll to the Lesson section (below Dashboard)
2. Current lesson shows with:
   - Title and difficulty stars
   - Concept tags
   - Overview in gradient box

### 4.2 Test Lesson Tabs

1. **📖 Lesson Content** - Detailed explanation + key takeaways
2. **💻 Code Examples** - Multiple examples with copy buttons
3. **📝 Take Quiz** - Multiple choice quiz

### 4.3 Test Quiz Requirement

1. Notice the **"Mark Complete"** button is **disabled** (gray)
2. See the yellow warning: "You must pass the quiz (score ≥ 70%)..."
3. Click **"Take Quiz →"** link or the Quiz tab
4. Answer all questions and submit
5. If score ≥ 70%:
   - "🎉 Passed!" message appears
   - "Mark Complete" button becomes **enabled** (blue)
   - Message shows: "✓ Quiz passed! You can now mark this lesson complete."
6. If score < 70%:
   - "📚 Keep Learning!" message appears
   - Click "Retry Quiz" to try again
   - "Mark Complete" remains disabled

### 4.4 Test Mark Complete

1. After passing quiz, click **"✓ Mark Complete"** button
2. Lesson marked as complete
3. Dashboard refreshes automatically
4. Next lesson appears (if available)

---

## Step 5: Test Code Playground

### 5.1 Test Jac Code Mode (Default)

1. Scroll to "Code Playground" section
2. Ensure **"🔧 Jac Code"** button is selected (green)
3. The editor should have sample code:
   ```jac
   let a = 5;
   let b = 7;
   let sum = a + b;
   print("Sum =", sum);
   ```
4. Click **"▶ Run"**
5. Output shows: `Sum = 12`

### 5.2 Test Example Buttons

Click the example buttons and run each:

| Button | Code | Expected Output |
|--------|------|-----------------|
| Variables | `let a = 5; ...` | `Sum = 12` |
| For Loop | `for i in range(5) ...` | Count: 0, 1, 2, 3, 4 |
| List Sum | `let nums = [1,2,3,4,5]; ...` | `Total: 15` |
| Node | `node person { ... }` | Name and age printed |
| Walker | `walker explorer { ... }` | Visits cities |

### 5.3 Test Walker API Mode

1. Click **"🚀 Walker API"** button
2. Editor changes to: `get_dashboard({ user_id: "demo_user" })`
3. Click **"▶ Run"**
4. Output shows JSON with user data, concepts, scores

### 5.4 Test Quick Buttons (Walker Mode)

| Button | Output |
|--------|--------|
| Dashboard | User's concept scores and progress |
| Next Lesson | Next recommended lesson |
| Recommendations | Weakest concepts to study |
| Generate Quiz | Quiz questions for a concept |

---

## Step 6: Test Data Persistence

### 6.1 Make Changes

1. Practice a few concepts (click +10%)
2. Add notes to concepts
3. Complete a lesson

### 6.2 Verify Persistence

1. Refresh the browser (F5)
2. All scores, notes, and completed lessons should persist

### 6.3 Reset Data (Optional)

To start fresh:
```bash
cd backend
rm -rf .jac_mydb __jac_gen__ __pycache__
# Restart the backend
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

# Save a note
curl -X POST http://localhost:8000/walker/save_note \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user", "concept_name": "Walkers", "note_text": "Important concept!"}'

# Get notes
curl -X POST http://localhost:8000/walker/get_notes \
  -H "Content-Type: application/json" \
  -d '{"user_id": "test_user"}'

# Generate quiz
curl -X POST http://localhost:8000/walker/generate_quiz \
  -H "Content-Type: application/json" \
  -d '{"concept_name": "Walkers"}'
```

---

## Summary of All Walkers

| Walker | Arguments | Returns |
|--------|-----------|---------|
| `create_user` | `user_id` | `{status, user}` |
| `get_next_lesson` | `user_id` | `{next_lesson: {...}}` or `{recommended_review}` |
| `record_lesson_progress` | `user_id, lesson_title, completed` | `{status, completed_lessons}` |
| `get_dashboard` | `user_id` | `{user, completed_lessons, concepts, concept_order}` |
| `generate_quiz` | `concept_name` | `{quiz_id, concept, questions, passing_score}` |
| `evaluate_answer` | `quiz_id, submitted_answers` | `{score}` |
| `recommend_next` | `user_id` | `{recommendations}` |
| `update_mastery` | `user_id, concept_name, score` | `{status, concept, score}` |
| `save_note` | `user_id, concept_name, note_text` | `{status, concept}` |
| `get_notes` | `user_id` | `{notes: {...}}` |

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm install` fails | Ensure Node.js 16+ (`node --version`). Try `npm cache clean --force`. |
| `jac serve` fails | Check `main.jac` for syntax errors. Ensure jaclang installed. |
| `403 Forbidden` | Use startup scripts or set `REQUIRE_AUTH_BY_DEFAULT=false`. |
| "No concepts to display" | Delete `.jac_mydb/` and restart backend. |
| "API Offline" | Ensure backend running on port 8000. |
| Code Playground ENOENT error | Restart frontend (`npm run dev`). |
| Notes not saving | Check backend has `save_note` walker. Restart backend. |
| Quiz shows JSON instead of questions | Update frontend - quiz should show multiple choice. |
| "Mark Complete" is disabled | You must pass the quiz first (score ≥ 70%). Take the quiz! |
| Can't complete lesson | Pass the quiz, then the Mark Complete button will enable. |

---

## ✅ Test Checklist

- [ ] Backend starts successfully
- [ ] Frontend shows "API Online"
- [ ] 7 concept cards displayed
- [ ] Concept detail panel opens on click
- [ ] Content tab shows detailed explanation
- [ ] Examples tab shows code with copy buttons
- [ ] Quiz tab shows multiple choice questions
- [ ] Quiz scoring works correctly
- [ ] Practice +10% updates score
- [ ] Mark Mastered sets 100%
- [ ] Notes auto-save and persist
- [ ] Lesson page displays with tabs
- [ ] **Mark Complete disabled until quiz passed**
- [ ] **Quiz requirement warning displayed**
- [ ] **Mark Complete enabled after passing quiz (≥70%)**
- [ ] Mark Complete advances to next lesson
- [ ] Code Playground Jac mode runs code
- [ ] Code Playground Walker mode calls API
- [ ] All data persists after refresh

---

**All tests passing? 🎉 The app is fully functional!**
