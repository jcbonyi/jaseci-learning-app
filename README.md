# Interactive Learning Platform for Jac / Jaseci

An adaptive learning platform built with Jac backend and React frontend for teaching Jac/Jaseci programming concepts. Features **AI-powered dynamic content generation** using Google Gemini.

## ✨ Features

### 🤖 AI-Powered Dynamic Content
- **Lessons** are generated dynamically with Gemini AI (overview, detailed explanation, key points, examples)
- **Quizzes** with 5 AI-generated multiple choice questions (Jac-specific, concept-focused)
- **Concepts** get AI-generated overviews, detailed explanations, and code examples
- **Detailed Explanations** - Both lessons and concept cards show AI-generated detailed explanations with "AI Generated" badges
- Toggle between AI and static content

### 📊 Progress Dashboard
- View all 7 Jac concepts with progress bars and mastery indicators
- Click any concept card to see AI-generated explanations and examples
- Skill map visualization showing your learning progress
- Personalized recommendations for next concepts to study
- **Persistent notes** - Add personal notes to any concept (auto-saved!)
- **Export/Import progress** - Backup and restore your learning data
- **Breadcrumb navigation** - Always know where you are

### 📖 Interactive Lessons
- **Tabbed interface** with Content, Examples, and Quiz sections
- AI-generated detailed explanations for each concept
- Multiple code examples with copy-to-clipboard functionality
- **"Try it" buttons** - Click to load code examples directly into the playground
- Difficulty ratings shown as stars
- **Quiz requirement** - Must pass quiz (≥70%) before completing lesson
- Auto-advances to next lesson on completion

### 📝 Quizzes & Quiz Review
- **5 AI-generated** multiple choice questions per quiz
- **Jac-specific questions** - All questions are specifically about Jac programming language syntax and concepts
- **Concept-focused** - Questions test understanding of the specific concept being studied (e.g., "Walkers", "Nodes & edges")
- Instant feedback showing correct/incorrect answers
- **Passing score: 70%** required to complete lessons
- Score tracking with pass/fail indicators
- Mastery automatically updated based on quiz performance
- **Quiz History** - Review past quiz attempts and see where you went wrong
- **Quiz Review Mode** - Analyze incorrect answers to learn from mistakes

### 🏅 Achievement Badges
- Earn badges for milestones (First Steps, Quiz Taker, Master, Scholar, etc.)
- **8 achievements** to unlock as you progress:
  | Badge | Name | Requirement |
  |-------|------|-------------|
  | 🎯 | First Steps | Complete your first lesson |
  | 📝 | Quiz Taker | Complete 3 quizzes |
  | ⭐ | Rising Star | Score 80%+ on any quiz |
  | 🏆 | Master | Master any concept (85%+) |
  | 📚 | Scholar | Complete all 7 concepts |
  | 🔥 | Streak | 3 lessons in a row |
  | 💡 | Explorer | Try all 7 concepts |
  | 👑 | Perfectionist | 100% mastery on any concept |
- Track your accomplishments in the sidebar

### 🔧 Code Playground
- **Two modes:**
  - **Jac Code** - Run actual Jac code snippets (WSL users: run in terminal)
  - **Walker API** - Call Jac walkers via the API (recommended)
- Monaco Editor with syntax highlighting
- **Keyboard shortcut**: `Ctrl+Enter` to run code
- Quick action buttons for common operations
- AI generation buttons for dynamic content
- **Copy to clipboard** - Share code easily

### 🎨 User Experience
- **Dark/Light theme toggle** - Switch between dark and light modes (persists)
- **Mobile responsive** - Works on phones and tablets
- **Skeleton loading states** - Smooth loading experience
- **Persistent data** - Your progress saves automatically to SQLite
- **API caching** - Faster load times with smart response caching (1-min TTL)
- **Offline support** - Service Worker caches app for offline access
- **Better error handling** - Clear error messages and API status indicator

### 📈 Learning Analytics Dashboard
- **Summary statistics** - Average scores, mastery counts, quiz attempts
- **Progress visualization** - See breakdown by status (Mastered, Passed, In Progress, Not Started)
- **Score distribution** - Understand your performance patterns
- **Concept breakdown** - Detailed view of each concept's progress with scores
- **Personalized tips** - Get suggestions based on your current progress

## 📁 Project Structure

```
JASECI_APP/
├── backend/
│   ├── main.jac              # All-in-one backend (nodes, walkers, AI)
│   ├── start_server.py       # Python launcher (loads .env, sets DB path)
│   ├── requirements.txt      # Python dependencies (pinned versions)
│   ├── data/                 # Persistent user data (auto-created)
│   │   └── jaseci_db/        # SQLite database files
│   ├── .env                  # API keys (GEMINI_API_KEY)
│   └── README_BYLLM.md       # AI/LLM integration guide
├── frontend/
│   ├── api.js                # API client with caching & cache invalidation
│   ├── App.jsx               # Main app with theme & error handling
│   ├── main.jsx              # Entry point with Service Worker registration
│   ├── components/
│   │   ├── Dashboard.jsx     # Main dashboard with concept cards
│   │   ├── ConceptCard.jsx   # Individual concept display
│   │   ├── LessonPage.jsx    # Lesson content with tabs
│   │   ├── QuizPage.jsx      # Quiz interface
│   │   ├── CodeEditor.jsx    # Code playground (2 modes, keyboard shortcuts)
│   │   ├── SkillMap.jsx      # Progress visualization
│   │   ├── Skeleton.jsx      # Loading skeleton components
│   │   ├── Achievements.jsx  # Achievement badges system (8 badges)
│   │   ├── QuizHistory.jsx   # Quiz review mode
│   │   ├── ProgressManager.jsx # Export/import progress
│   │   ├── ThemeProvider.jsx # Dark/light theme toggle
│   │   ├── Breadcrumb.jsx    # Navigation breadcrumbs
│   │   ├── CodeContext.jsx   # "Try it" buttons for code examples
│   │   └── Analytics.jsx     # Learning analytics dashboard
│   ├── public/
│   │   └── sw.js             # Service Worker for offline support
│   └── vite.config.js        # Vite config with API proxy
├── README.md                 # This file
├── INTEGRATION_TEST.md       # Step-by-step testing guide
└── .gitignore                # Ignores node_modules, .env, data/
```

## 🚀 Quick Start

### Prerequisites

- Python 3.10+ with `jaclang` and `byllm` installed
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

# Install with pinned versions
pip install -r backend/requirements.txt
# Or manually:
pip install jaclang==0.9.3 byllm python-dotenv
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

Expected output:
```
💾 Database path: C:\...\backend\data\jaseci_db
✓ GEMINI_API_KEY is set (AIza...)
📋 Environment check:
   GEMINI_API_KEY: AIza...
   DATABASE_PATH: C:\...\backend\data\jaseci_db
🚀 Starting Jac server...
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Data Persistence

User progress is automatically saved to `backend/data/jaseci_db` (SQLite-based LocalDB).

**Your progress persists across server restarts!**

To reset all data, delete the `backend/data/` folder:
```bash
rm -rf backend/data/
```

For production, you can use MongoDB instead by setting `DATABASE_HOST` in `.env`:
```
DATABASE_HOST=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
```

### Frontend Setup

1. **Install dependencies and start:**

```bash
cd frontend
npm install
npm run dev
```

2. Open `http://localhost:5173` in your browser.

## 📚 Concepts Covered

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

## 🔌 API Endpoints

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

## 🎮 Code Playground Usage

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

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| `403 Forbidden` on walker calls | Use `python start_server.py` which sets `REQUIRE_AUTH_BY_DEFAULT=false` |
| `API key not valid` error | Check `backend/.env` has valid `GEMINI_API_KEY` |
| AI content not loading | Ensure Gemini API key is set and `byllm` is installed |
| Frontend shows "API Offline" | Ensure backend is running on port 8000 |
| "Mark Complete" button disabled | You must pass the quiz (≥70%) first |
| Quiz only shows 3 questions | Update to latest code (now generates 5) |
| Progress not saving | Check `backend/data/` directory exists |
| `jac serve` fails | Ensure jaclang==0.9.3 is installed |
| `get_dashboard` returns walker object | This is fixed - API now correctly parses `reports` array |
| `nd parameter` error | Fixed - API calls no longer send `nd` parameter |
| Dashboard shows "No data" | Ensure user is created first via `create_user` walker |

## 🛠 Tech Stack

- **Backend:** Jac (jaclang 0.9.3), byllm
- **AI:** Google Gemini (gemini-2.0-flash) via LiteLLM
- **Frontend:** React 18, Vite 5, Tailwind CSS
- **Editor:** Monaco Editor (VS Code's editor)
- **Database:** LocalDB (SQLite-based persistence)
- **Caching:** In-memory API response cache with TTL
- **Offline:** Service Worker with cache-first strategy

## 🔄 Recent Updates

- ✅ **GEMINI_API_KEY Integration** - Fully configured to use Google Gemini API
- ✅ **API Response Parsing** - Fixed to correctly parse `reports` array from jaclang 0.9.3 responses
- ✅ **Walker API Calls** - Removed `nd` parameter that was causing errors
- ✅ **Environment Variables** - Properly passed to subprocess in `start_server.py`
- ✅ **Health Check** - Improved to use root endpoint as fallback
- ✅ **Error Handling** - Better error messages and detection of walker execution issues
- ✅ **AI-Generated Detailed Explanations** - Both lessons and concept cards now show AI-generated detailed explanations with "AI Generated" badges
- ✅ **Improved Quiz Generation** - Enhanced AI prompts to ensure quizzes are specifically about Jac programming language and the concept being tested
- ✅ **Context-Aware Quizzes** - Quiz generation now includes concept details and code examples for more accurate, Jac-specific questions

## 📖 Additional Documentation

- `backend/README_BYLLM.md` - Guide for AI/Gemini integration
- `INTEGRATION_TEST.md` - Step-by-step testing walkthrough

---

*Built with ❤️ using Jac and React*
