# Interactive Learning Platform for Jac / Jaseci

An adaptive learning platform built with Jac backend and React frontend for teaching Jac/Jaseci programming concepts. Features **AI-powered dynamic content generation** using Google Gemini.

## Features

### AI-Powered Dynamic Content
- **Lessons** are generated dynamically with Gemini AI (overview, detailed explanation, key points, examples)
- **Quizzes** with 5 AI-generated multiple choice questions (Jac-specific, concept-focused)
- **Concepts** get AI-generated overviews, detailed explanations, and code examples
- **Detailed Explanations** - Both lessons and concept cards show AI-generated detailed explanations with "AI Generated" badges
- Toggle between AI and static content

### Progress Dashboard
- View all 7 Jac concepts with progress bars and mastery indicators
- Click any concept card to see AI-generated explanations and examples
- Skill map visualization showing your learning progress
- Personalized recommendations for next concepts to study
- **Persistent notes** - Add personal notes to any concept (auto-saved!)
- **Breadcrumb navigation** - Always know where you are

### Interactive Lessons
- **Tabbed interface** with Content, Examples, and Quiz sections
- AI-generated detailed explanations for each concept
- Multiple code examples with copy-to-clipboard functionality
- **"Try it" buttons** - Click to load code examples directly into the playground
- Difficulty ratings shown as stars
- **Quiz requirement** - Must pass quiz (≥70%) before completing lesson
- Auto-advances to next lesson on completion

### Quizzes & Quiz Review
- **5 AI-generated** multiple choice questions per quiz
- **Jac-specific questions** - All questions are specifically about Jac programming language syntax and concepts
- **Concept-focused** - Questions test understanding of the specific concept being studied (e.g., "Walkers", "Nodes & edges")
- Instant feedback showing correct/incorrect answers
- **Passing score: 70%** required to complete lessons
- Score tracking with pass/fail indicators
- Mastery automatically updated based on quiz performance
- **Quiz History** - Review past quiz attempts and see where you went wrong
- **Quiz Review Mode** - Analyze incorrect answers to learn from mistakes

### Code Playground
- **Two modes:**
  - **Jac Code** - Run actual Jac code snippets (WSL users: run in terminal)
  - **Walker API** - Call Jac walkers via the API (recommended)
- Monaco Editor with syntax highlighting
- **Keyboard shortcut**: `Ctrl+Enter` to run code
- Quick action buttons for common operations
- AI generation buttons for dynamic content
- **Copy to clipboard** - Share code easily

### User Experience
- **Dark/Light theme toggle** - Switch between dark and light modes (persists)
- **Mobile responsive** - Works on phones and tablets
- **Skeleton loading states** - Smooth loading experience
- **Persistent data** - Your progress saves automatically to SQLite
- **API caching** - Faster load times with smart response caching (1-min TTL)
- **Offline support** - Service Worker caches app for offline access
- **Better error handling** - Clear error messages and API status indicator

### Learning Analytics Dashboard
- **Summary statistics** - Average scores, mastery counts, quiz attempts
- **Progress visualization** - See breakdown by status (Mastered, Passed, In Progress, Not Started)
- **Score distribution** - Understand your performance patterns
- **Concept breakdown** - Detailed view of each concept's progress with scores
- **Personalized tips** - Get suggestions based on your current progress

## Project Structure

```
JASECI_APP_FINAL/
├── app.jac                   # All-in-one: backend walkers + frontend code
├── src/                      # React components and API code
│   ├── components/          # React components
│   │   ├── Dashboard.jsx   # Main dashboard with concept cards
│   │   ├── ConceptCard.jsx # Individual concept display
│   │   ├── LessonPage.jsx  # Lesson content with tabs
│   │   ├── QuizPage.jsx    # Quiz interface
│   │   ├── CodeEditor.jsx  # Code playground
│   │   └── ...             # Other components
│   ├── api.js              # API client with jac-client integration
│   ├── client_runtime.js   # Jac client runtime utilities
│   ├── app.js              # Main React app component
│   ├── main.jsx            # Entry point
│   └── styles.css          # Styles
├── requirements.txt       # Python dependencies
├── .env                    # Environment variables (API keys)
├── package.json            # npm dependencies (jac-client, React, etc.)
├── vite.config.js          # Vite config with API proxy
├── index.html              # HTML entry point
└── README.md               # This file
```

## Quick Start

### Prerequisites

- Python 3.10+ with `jaclang` and `byllm` installed
- Node.js 16+ with npm
- **Gemini API Key** (get free at https://aistudio.google.com/apikey) - Optional for AI features

### Installation & Setup

#### Option 1: Single Command (Recommended)

```bash
npm run serve:all
```

This runs both backend and frontend servers in one terminal using `concurrently`.

#### Option 2: Two Separate Terminals

**Terminal 1: Backend Server**
```bash
jac serve app.jac
```

This will:
- Start the backend API server on port 8000
- Register all backend walkers (create_user, get_dashboard, etc.)
- Make walkers available at `/walker/{walker_name}`

**Terminal 2: Frontend Server**
```bash
npm run dev
```

This will:
- Start the Vite dev server on port 5173
- Serve the frontend React UI
- Proxy API calls to the backend on port 8000

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
pip install -r requirements.txt
# Or manually:
pip install jaclang byllm python-dotenv
```

2. **Set up API key (optional, for AI features):**

Create `.env` in the root directory:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

**Note:** AI features are disabled by default to avoid quota issues. Quizzes will use fallback questions if AI is unavailable.

### Frontend Setup

1. **Install dependencies:**

```bash
npm install
```

2. **Access the App**

- **Frontend UI**: http://localhost:5173
- **Backend API**: http://localhost:8000/walker/{walker_name}

### Data Persistence

User progress is automatically saved to session files (`app.session` and `app.session.users.json`).

**Your progress persists across server restarts!**

To reset all data, delete the session files:
```bash
rm -f app.session app.session.users.json
```

### Verify Walkers are Registered

After starting the server, you can check available walkers:
```bash
curl http://localhost:8000/walkers
```

You should see walkers like:
- create_user
- get_dashboard
- get_next_lesson
- generate_quiz
- etc.

## Concepts Covered

The platform teaches 8 Jac/Jaseci concepts in order:

| # | Concept | Description | Difficulty |
|---|---------|-------------|------------|
| 1 | **Jac syntax** | Language basics, variables, control flow | ⭐ |
| 2 | **Nodes & edges** | Graph structures, creating connections | ⭐ |
| 3 | **Walkers** | Agent traversal, visit, report | ⭐⭐ |
| 4 | **GraphOps** | Graph operations and filtering | ⭐⭐ |
| 5 | **OSP** | Object-Spatial Programming patterns | ⭐⭐ |
| 6 | **byLLM** | LLM-backed decorators | ⭐⭐⭐ |
| 7 | **AI agents** | Building intelligent agents | ⭐⭐⭐ |
| 8 | **jac-client** | Frontend integration with npm package | ⭐⭐ |

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

## AI Integration with byLLM

This app uses Jaseci's **`by llm()`** feature with Google Gemini to dynamically generate lesson content, quizzes, and concepts.

### What is byLLM?

`by llm()` is Jaseci's native LLM integration feature that allows you to:
- Implement functions/abilities using Large Language Models
- Get structured, typed outputs from LLM calls
- Use docstrings as prompts

### Setup

1. **Install Required Packages**

```bash
pip install byllm python-dotenv
```

Or use the requirements file:
```bash
pip install -r requirements.txt
```

2. **Get a Gemini API Key**

1. Go to https://aistudio.google.com/apikey
2. Create a new API key (it's free!)
3. Copy the key

3. **Set Up Environment**

Create `.env` in the root directory:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### How It Works

#### Import and Configure

In `app.jac`:
```jac
import from byllm.lib { Model }

glob llm = Model(model_name="gemini/gemini-2.0-flash");
```

#### Define Structured Outputs

```jac
obj QuizQuestion {
    has q: str;
    has options: list[str];
    has answer: str;
}

obj ConceptContent {
    has overview: str;
    has explanation: str;
    has example_titles: list[str];
    has example_codes: list[str];
}
```

#### Create LLM-Powered Functions

```jac
def generate_quiz_questions(topic: str, count: int) -> list[QuizQuestion] by llm();
"""Generate {count} multiple choice quiz questions about: {topic} in Jac programming.
Each QuizQuestion needs:
- q: the question text (string)
- options: exactly 4 answer choices (list of 4 strings)
- answer: the correct answer (must exactly match one of the options)
"""
```

### AI Walkers

#### `generate_quiz` / `generate_quiz_with_ai`

Generates quiz questions specifically about Jac programming language concepts. The AI is instructed to:
- Create questions ONLY about Jac programming (not Python, JavaScript, or other languages)
- Test understanding of the specific concept being studied
- Focus on Jac-specific syntax, keywords, and graph-based programming concepts
- Include concept details and code examples for context
- Generate practical, educational questions that test understanding, not memorization

**Generates 5 AI-powered multiple-choice quiz questions per quiz.**

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `concept_name` | str | required | Topic for questions |
| `num_questions` | int | 5 | Number of questions |

**Example:**
```javascript
// In Code Playground - Walker API mode
generate_quiz({ concept_name: "Walkers" })
```

#### `get_lesson_dynamic`

Gets lesson content with optional AI generation.

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `lesson_title` | str | required | Title of the lesson |
| `use_ai` | bool | true | Generate with AI |

#### `get_concept_dynamic`

Gets concept information with optional AI generation.

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `concept_name` | str | required | Name of the concept |
| `use_ai` | bool | true | Generate with AI |

### Supported LLM Providers

The `byllm` package supports multiple providers via LiteLLM:

| Provider | Model | Environment Variable |
|----------|-------|---------------------|
| **Google Gemini** | `gemini/gemini-2.0-flash` | `GEMINI_API_KEY` |
| OpenAI | `openai/gpt-4o-mini` | `OPENAI_API_KEY` |
| Anthropic | `anthropic/claude-3` | `ANTHROPIC_API_KEY` |

To switch providers, change the model in `app.jac`:
```jac
// For Gemini (default)
glob llm = Model(model_name="gemini/gemini-2.0-flash");

// For OpenAI
glob llm = Model(model_name="openai/gpt-4o-mini");
```

### Cost Information

| Provider | Model | Cost |
|----------|-------|------|
| **Gemini** | gemini-2.0-flash | **Free** (with limits) |
| OpenAI | gpt-4o-mini | $0.15/1M input tokens |
| OpenAI | gpt-4o | $5/1M input tokens |

**Gemini is recommended** for this app as it's free and fast!

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `403 Forbidden` on walker calls | Ensure you're using `jac serve app.jac` to start the server |
| `API key not valid` error | Check `.env` has valid `GEMINI_API_KEY` |
| AI content not loading | Ensure Gemini API key is set and `byllm` is installed |
| Frontend shows "API Offline" | Ensure backend is running on port 8000 |
| "Mark Complete" button disabled | You must pass the quiz (≥70%) first |
| Quiz only shows 3 questions | Update to latest code (now generates 5) |
| Progress not saving | Check session files exist in root directory |
| `jac serve` fails | Ensure jaclang==0.9.3 is installed |
| `get_dashboard` returns walker object | This is fixed - API now correctly parses `reports` array |
| `nd parameter` error | Fixed - API calls no longer send `nd` parameter |
| Dashboard shows "No data" | Ensure user is created first via `create_user` walker |
| Walker endpoints not found (404) | Ensure you're using compatible versions: `pip install jaclang==0.9.3` |
| "byllm not found" Error | Run `pip install byllm` |

## Tech Stack

- **Backend:** Jac (jaclang 0.9.3), byllm
- **AI:** Google Gemini (gemini-2.0-flash) via LiteLLM
- **Frontend:** React 18, Vite 5, Tailwind CSS
- **Editor:** Monaco Editor (VS Code's editor)
- **Database:** LocalDB (SQLite-based persistence)
- **Caching:** In-memory API response cache with TTL
- **Offline:** Service Worker with cache-first strategy

## Architecture

### Unified JAC File (`app.jac`)

The app uses a single `app.jac` file that contains:
- **Backend walkers** (server-side) - served by `jac serve app.jac` on port 8000
- **Frontend client code** (`cl` blocks) - needs to be bundled and served by Vite on port 5173

The frontend code imports React components from `src/` which need to be processed by Vite's bundler. That's why you need both:
- `jac serve app.jac` for the backend API
- `npm run dev` for the frontend UI

The Vite server automatically proxies API calls to the backend on port 8000.

### Graph-Based Data Model

- **Nodes:** Users, Concepts, Lessons, Quizzes
- **Edges:** Prerequisites, Mastery relationships
- **Walkers:** Traverse graph to perform operations

### Data Persistence

The backend uses **session files** for persistent storage:
- **Session files**: `app.session` and `app.session.users.json` (auto-generated in root directory)
- **Persists**: User progress, mastery scores, notes, completed lessons

**Your progress persists across server restarts!**

To reset all data:
```bash
rm -f app.session app.session.users.json
```

## Recent Updates

- **Single File Architecture** - All backend walkers and frontend code in `app.jac`
- **jac-client Integration** - Using `jac-client` npm package for frontend-backend communication
- **New Lesson Added** - "jac-client Integration" lesson covering npm package usage
- **Quiz Fallback System** - Quizzes work even when AI quota is exceeded (uses fallback questions)
- **Improved Error Handling** - Better error messages and graceful fallbacks
- **AI Features Optional** - AI disabled by default to avoid quota issues, with automatic fallback

## Additional Resources

- [Jaseci Documentation](https://docs.jaseci.org/)
- [Google AI Studio](https://aistudio.google.com/)
- [Jac Language Guide](https://www.jac-lang.org/)
- [byllm Package](https://pypi.org/project/byllm/)

---

*Built with Jac and React*
