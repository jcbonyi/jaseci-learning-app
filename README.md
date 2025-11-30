# Interactive Learning Platform for Jac / Jaseci

An adaptive learning platform built with Jac backend and React frontend for teaching Jac/Jaseci programming concepts. Features **AI-powered dynamic content generation** using Google Gemini.

## Features

### 🤖 AI-Powered Dynamic Content
- **Lessons** are generated dynamically with Gemini AI
- **Quizzes** with 5 AI-generated multiple choice questions
- **Concepts** get AI-generated overviews, explanations, and examples
- Toggle between AI and static content

### 📊 Progress Dashboard
- View all 7 Jac concepts with progress bars and mastery indicators
- Click any concept card to see AI-generated explanations and examples
- Skill map visualization showing your learning progress
- Personalized recommendations for next concepts to study
- **Persistent notes** - Add personal notes to any concept (auto-saved!)

### 📖 Interactive Lessons
- **Tabbed interface** with Content, Examples, and Quiz sections
- AI-generated detailed explanations for each concept
- Multiple code examples with copy-to-clipboard functionality
- Difficulty ratings shown as stars
- **Quiz requirement** - Must pass quiz (≥70%) before completing lesson
- Auto-advances to next lesson on completion

### 📝 Quizzes
- **5 AI-generated** multiple choice questions per quiz
- Instant feedback showing correct/incorrect answers
- **Passing score: 70%** required to complete lessons
- Score tracking with pass/fail indicators
- Mastery automatically updated based on quiz performance

### 🔧 Code Playground
- **Two modes:**
  - **Jac Code** - Run actual Jac code snippets (requires jac in PATH)
  - **Walker API** - Call Jac walkers via the API
- Monaco Editor with syntax highlighting
- Quick action buttons for common operations

## Project Structure

```
JASECI_APP/
├── backend/
│   ├── main.jac           # All-in-one backend (nodes, walkers, AI)
│   ├── start_server.py    # Python launcher (loads .env)
│   ├── .env               # API keys (GEMINI_API_KEY)
│   └── README_BYLLM.md    # AI/LLM integration guide
├── frontend/
│   ├── api.js             # API client for calling Jac walkers
│   ├── App.jsx            # Main application component
│   ├── components/
│   │   ├── Dashboard.jsx      # Main dashboard with concept cards
│   │   ├── ConceptCard.jsx    # Individual concept display
│   │   ├── LessonPage.jsx     # Lesson content with tabs
│   │   ├── QuizPage.jsx       # Quiz interface
│   │   ├── CodeEditor.jsx     # Code playground component
│   │   └── SkillMap.jsx       # Progress visualization
│   └── vite.config.js     # Vite config with API proxy
├── README.md              # This file
├── INTEGRATION_TEST.md    # Testing guide
└── venv/                  # Python virtual environment
```

## Quick Start

### Prerequisites

- Python 3.10+ with `jaclang`, `jac-cloud`, and `byllm` installed
- Node.js 16+ with npm
- **Gemini API Key** (get free at https://aistudio.google.com/apikey)

### Backend Setup

1. **Install Python dependencies:**

```bash
# Create and activate virtual environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install jaclang jac-cloud byllm python-dotenv
```

2. **Set up API key:**

Create `backend/.env`:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

3. **Start the backend server:**

```bash
cd backend
python start_server.py
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

### Core Walkers

| Walker | Arguments | Returns |
|--------|-----------|---------|
| `create_user` | `user_id: string` | `{status, user}` |
| `get_next_lesson` | `user_id: string` | `{next_lesson: {...}}` |
| `record_lesson_progress` | `user_id, lesson_title, completed` | `{status, completed_lessons}` |
| `get_dashboard` | `user_id: string` | `{user, completed_lessons, concepts}` |
| `generate_quiz` | `concept_name: string` | `{quiz_id, concept, questions}` |
| `recommend_next` | `user_id: string` | `{recommendations}` |
| `update_mastery` | `user_id, concept_name, score` | `{status, concept, score}` |
| `save_note` | `user_id, concept_name, note_text` | `{status, concept}` |
| `get_notes` | `user_id: string` | `{notes: {...}}` |

### AI-Powered Walkers (Gemini)

| Walker | Arguments | Returns |
|--------|-----------|---------|
| `generate_quiz_with_ai` | `concept_name, num_questions` | AI-generated quiz questions |
| `generate_lesson_with_ai` | `topic, difficulty` | AI-generated lesson content |
| `generate_concept_with_ai` | `name, difficulty` | AI-generated concept |
| `get_lesson_dynamic` | `lesson_title, use_ai` | Dynamic lesson content |
| `get_concept_dynamic` | `concept_name, use_ai` | Dynamic concept content |

### Example API Calls

```bash
# Create a user
curl -X POST http://localhost:8000/walker/create_user \
  -H "Content-Type: application/json" \
  -d '{"user_id": "alice"}'

# Get AI-generated quiz (5 questions)
curl -X POST http://localhost:8000/walker/generate_quiz \
  -H "Content-Type: application/json" \
  -d '{"concept_name": "Walkers"}'

# Get dynamic lesson content
curl -X POST http://localhost:8000/walker/get_lesson_dynamic \
  -H "Content-Type: application/json" \
  -d '{"lesson_title": "Intro to Jac syntax", "use_ai": true}'
```

## Code Playground Usage

### Walker API Mode (Recommended)

Call walkers directly:

```javascript
get_dashboard({ user_id: "demo_user" })
generate_quiz({ concept_name: "Walkers" })
```

### Jac Code Mode

Run actual Jac code (requires jac in PATH):

```jac
let a = 5;
let b = 7;
print("Sum =", a + b);
```

## Data Persistence

- User progress, scores, and notes are stored in LocalDB
- Data persists between sessions
- To reset: restart the backend (a new session starts fresh)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `403 Forbidden` on walker calls | Use `python start_server.py` which sets auth flag |
| `API key not valid` error | Check `backend/.env` has valid `GEMINI_API_KEY` |
| AI content not loading | Ensure Gemini API key is set and `byllm` is installed |
| Frontend shows "API Offline" | Ensure backend is running on port 8000 |
| "Mark Complete" button disabled | You must pass the quiz (≥70%) first |
| Quiz only shows 3 questions | Update to latest code (now generates 5) |

## Tech Stack

- **Backend:** Jac (jaclang), jac-cloud, byllm
- **AI:** Google Gemini (gemini-2.0-flash) via LiteLLM
- **Frontend:** React 18, Vite 5, Tailwind CSS
- **Editor:** Monaco Editor (VS Code's editor)
- **Database:** LocalDB (file-based persistence)

## Additional Documentation

- `backend/README_BYLLM.md` - Guide for AI/Gemini integration
- `INTEGRATION_TEST.md` - Step-by-step testing walkthrough
