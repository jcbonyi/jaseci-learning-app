# Interactive Learning Platform for Jac / Jaseci

An adaptive learning platform built with Jac backend and React frontend for teaching Jac/Jaseci programming concepts.

## Features

### 📊 Progress Dashboard
- View all 7 Jac concepts with progress bars and mastery indicators
- Click any concept card to see detailed explanations and examples
- Skill map visualization showing your learning progress
- Personalized recommendations for next concepts to study
- **Persistent notes** - Add personal notes to any concept (auto-saved!)

### 📖 Interactive Lessons
- **Tabbed interface** with Content, Examples, and Quiz sections
- Detailed explanations for each concept
- Multiple code examples with copy-to-clipboard functionality
- Difficulty ratings shown as stars
- **Quiz requirement** - Must pass quiz (≥70%) before completing lesson
- Auto-advances to next lesson on completion

### 📝 Quizzes
- Multiple choice questions for each concept
- Instant feedback showing correct/incorrect answers
- **Passing score: 70%** required to complete lessons
- Score tracking with pass/fail indicators
- Mastery automatically updated based on quiz performance
- Retry option for practice until passed

### 🔧 Code Playground
- **Two modes:**
  - **Jac Code** - Run actual Jac code snippets directly
  - **Walker API** - Call Jac walkers via the API
- Monaco Editor with syntax highlighting
- Quick action buttons for common operations
- Example code snippets for learning

## Project Structure

```
JASECI_APP/
├── backend/
│   ├── main.jac          # All-in-one backend (nodes, walkers, logic)
│   ├── models/           # Node definitions (concept, lesson, quiz, user)
│   └── walkers/          # Walker definitions
├── frontend/
│   ├── api.js            # API client for calling Jac walkers
│   ├── App.jsx           # Main application component
│   ├── components/
│   │   ├── Dashboard.jsx     # Main dashboard with concept cards
│   │   ├── ConceptCard.jsx   # Individual concept display
│   │   ├── LessonPage.jsx    # Lesson content with tabs
│   │   ├── QuizPage.jsx      # Quiz interface
│   │   ├── CodeEditor.jsx    # Code playground component
│   │   └── SkillMap.jsx      # Progress visualization
│   └── vite.config.js    # Vite config with Jac runner
├── start-backend.bat     # Windows batch script to start backend
├── start-backend.ps1     # PowerShell script to start backend
└── README.md
```

## Quick Start

### Prerequisites

- Python 3.10+ with `jaclang` and `jac-cloud` installed
- Node.js 16+ with npm

### Backend Setup

1. **Install Python dependencies:**

```bash
cd backend
python -m venv ../venv
# Windows:
..\venv\Scripts\activate
# Linux/Mac:
source ../venv/bin/activate

pip install jaclang jac-cloud
```

2. **Start the backend server:**

**Option A: Use startup script (recommended)**
```bash
# Windows - double-click start-backend.bat or run:
.\start-backend.bat

# PowerShell:
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

The server starts on `http://localhost:8000`.

### Frontend Setup

1. **Install dependencies and start:**

```bash
cd frontend
npm install
npm run dev
```

2. Open `http://localhost:5173` in your browser.

## Concepts Covered

The platform teaches 7 Jac/Jaseci concepts in order:

| # | Concept | Description | Difficulty |
|---|---------|-------------|------------|
| 1 | **Jac syntax** | Language basics, variables, control flow | ⭐ |
| 2 | **Nodes & edges** | Graph structures, creating connections | ⭐ |
| 3 | **Walkers** | Agent traversal, visit, report | ⭐⭐ |
| 4 | **GraphOps** | Graph operations and filtering | ⭐⭐ |
| 5 | **OSP** | Object-Spatial Programming patterns | ⭐⭐ |
| 6 | **byLLM** | LLM-backed decorators | ⭐⭐⭐ |
| 7 | **AI agents** | Building intelligent agents | ⭐⭐⭐ |

## API Endpoints

All walkers are exposed via HTTP at `POST /walker/{walker_name}`.

| Walker | Arguments | Returns |
|--------|-----------|---------|
| `create_user` | `user_id: string` | `{status, user}` |
| `get_next_lesson` | `user_id: string` | `{next_lesson: {...}}` |
| `record_lesson_progress` | `user_id, lesson_title, completed` | `{status, completed_lessons}` |
| `get_dashboard` | `user_id: string` | `{user, completed_lessons, concepts, concept_order}` |
| `generate_quiz` | `concept_name: string` | `{quiz_id, concept, questions}` |
| `evaluate_answer` | `quiz_id, submitted_answers` | `{score}` |
| `recommend_next` | `user_id: string` | `{recommendations}` |
| `update_mastery` | `user_id, concept_name, score` | `{status, concept, score}` |
| `save_note` | `user_id, concept_name, note_text` | `{status, concept}` |
| `get_notes` | `user_id: string` | `{notes: {...}}` |

### Example API Calls

```bash
# Create a user
curl -X POST http://localhost:8000/walker/create_user \
  -H "Content-Type: application/json" \
  -d '{"user_id": "alice"}'

# Get dashboard data
curl -X POST http://localhost:8000/walker/get_dashboard \
  -H "Content-Type: application/json" \
  -d '{"user_id": "alice"}'

# Generate a quiz
curl -X POST http://localhost:8000/walker/generate_quiz \
  -H "Content-Type: application/json" \
  -d '{"concept_name": "Walkers"}'
```

## Code Playground Usage

### Jac Code Mode (Default)

Run actual Jac code:

```jac
let a = 5;
let b = 7;
let sum = a + b;
print("Sum =", sum);
```

### Walker API Mode

Call walkers directly:

```javascript
get_dashboard({ user_id: "demo_user" })
```

## Data Persistence

- User progress, scores, and notes are stored in `.jac_mydb/` (LocalDB)
- Data persists between sessions
- To reset: delete `.jac_mydb/` folder and restart the backend

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `403 Forbidden` on walker calls | Start server with `REQUIRE_AUTH_BY_DEFAULT=false` or use startup scripts |
| `No concepts to display` | Delete `.jac_mydb/` folder and restart server |
| `HTTP 500` errors | Check server terminal for Jac syntax errors |
| Frontend shows "API Offline" | Ensure backend is running on port 8000 |
| Code Playground shows ENOENT | Restart frontend dev server (`npm run dev`) |
| Notes not saving | Ensure backend has `save_note` and `get_notes` walkers |
| "Mark Complete" button disabled | You must pass the quiz (≥70%) first - take the quiz! |

## Development Notes

- Frontend uses Vite's proxy to forward `/walker/*` and `/api/*` requests to the backend
- The Code Playground's Jac runner creates temp files and executes via `jac run`
- Authentication is disabled for development ease
- Quiz questions are concept-specific with proper multiple choice options

## Additional Documentation

- `backend/README_BYLLM.md` - Guide for LLM/OpenAI integration
- `INTEGRATION_TEST.md` - Step-by-step testing walkthrough

## Tech Stack

- **Backend:** Jac (jaclang), jac-cloud
- **Frontend:** React 18, Vite 5, Tailwind CSS
- **Editor:** Monaco Editor (VS Code's editor)
- **Database:** LocalDB (file-based persistence)
