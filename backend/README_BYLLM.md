# Jaseci byLLM + Gemini AI Integration Guide

This guide explains how to use Jaseci's **`by llm()`** feature with Google Gemini to dynamically generate lesson content, quizzes, and concepts.

## What is byLLM?

`by llm()` is Jaseci's native LLM integration feature that allows you to:
- Implement functions/abilities using Large Language Models
- Get structured, typed outputs from LLM calls
- Use docstrings as prompts

## Quick Setup

### 1. Install Required Packages

```bash
pip install byllm python-dotenv
```

Or use the requirements file:
```bash
pip install -r backend/requirements.txt
```

### 2. Get a Gemini API Key

1. Go to https://aistudio.google.com/apikey
2. Create a new API key (it's free!)
3. Copy the key

### 3. Set Up Environment

Create `backend/.env`:
```
GEMINI_API_KEY=your-gemini-api-key-here
```

### 4. Start the Backend

```bash
cd backend
python start_server.py
```

You should see:
```
💾 Database path: C:\...\backend\data\jaseci_db
✓ GEMINI_API_KEY is set (AIza...)
📋 Environment check:
   GEMINI_API_KEY: AIza...
   DATABASE_PATH: C:\...\backend\data\jaseci_db
🚀 Starting Jac server...
```

## How It Works

### Import and Configure

In `main.jac`:
```jac
import from byllm.lib { Model }

glob llm = Model(model_name="gemini/gemini-2.0-flash");
```

### Define Structured Outputs

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

### Create LLM-Powered Functions

```jac
def generate_quiz_questions(topic: str, count: int) -> list[QuizQuestion] by llm();
"""Generate {count} multiple choice quiz questions about: {topic} in Jac programming.
Each QuizQuestion needs:
- q: the question text (string)
- options: exactly 4 answer choices (list of 4 strings)
- answer: the correct answer (must exactly match one of the options)
"""
```

## Available AI Walkers

### `generate_quiz` / `generate_quiz_with_ai`

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

**Response:**
```json
{
  "concept": "Walkers",
  "questions": [
    {
      "q": "What keyword stops a walker's traversal in Jac?",
      "type": "multiple",
      "options": ["stop", "disengage", "exit", "return"],
      "answer": "disengage"
    },
    {
      "q": "How do you spawn a walker named 'finder' on a user node in Jac?",
      "type": "multiple",
      "options": ["finder(user)", "spawn finder with user entry", "finder.spawn(user)", "call finder(user)"],
      "answer": "spawn finder with user entry"
    }
  ],
  "generated_by": "AI"
}
```

---

### `get_lesson_dynamic`

Gets lesson content with optional AI generation.

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `lesson_title` | str | required | Title of the lesson |
| `use_ai` | bool | true | Generate with AI |

**Example:**
```javascript
get_lesson_dynamic({ lesson_title: "Intro to Jac syntax", use_ai: true })
```

**Response:**
```json
{
  "title": "Intro to Jac syntax",
  "overview": "This lesson covers...",
  "detailed_content": "Jac is a graph-based...",
  "key_points": ["Variables use let", "Semicolons required"],
  "examples": [
    {"title": "Hello World", "code": "print(\"Hello!\");"}
  ],
  "generated_by": "AI"
}
```

---

### `get_concept_dynamic`

Gets concept information with optional AI generation.

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `concept_name` | str | required | Name of the concept |
| `use_ai` | bool | true | Generate with AI |

**Example:**
```javascript
get_concept_dynamic({ concept_name: "Nodes & edges", use_ai: true })
```

**Response:**
```json
{
  "name": "Nodes & edges",
  "description": "Nodes are fundamental...",
  "detailed_content": "In Jac, nodes represent...",
  "examples": [
    {"title": "Basic Node", "code": "node Person { has name: str; }"}
  ],
  "generated_by": "AI"
}
```

---

### `generate_lesson_with_ai`

Generates complete lesson content for any topic.

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `topic` | str | required | Topic to create lesson about |
| `difficulty` | int | 1 | 1=beginner, 2=intermediate, 3=advanced |

---

### `generate_concept_with_ai`

Creates a new concept with AI-generated content.

**Arguments:**
| Name | Type | Default | Description |
|------|------|---------|-------------|
| `name` | str | required | Name of the concept |
| `difficulty` | int | 1 | Difficulty level 1-3 |

## byLLM Implementation Details

### Single Unified Call Pattern

To avoid content mixing, we use a single AI call that returns all fields:

```jac
obj ConceptContent {
    has overview: str;
    has explanation: str;
    has example_titles: list[str];
    has example_codes: list[str];
}

def generate_full_concept(name: str, level: str) -> ConceptContent by llm();
"""Generate educational content about the Jac programming concept: {name} for {level} level.

Return a ConceptContent object with these EXACT fields:

1. overview: A brief 2-3 sentence introduction. Plain text only, NO code.

2. explanation: A detailed 3-4 paragraph explanation. Plain text only, NO code.

3. example_titles: A list of 2 short titles for code examples.

4. example_codes: A list of 2 Jac code snippets (matching the titles).
"""
```

### Walker Using the Function

```jac
walker get_concept_dynamic {
    has concept_name: str;
    has use_ai: bool = True;

    can get with `root entry {
        if self.use_ai {
            content = generate_full_concept(self.concept_name, "beginner");
            
            # Build examples from parallel lists
            formatted_examples = [];
            for i in range(len(content.example_titles)) {
                formatted_examples.append({
                    "title": content.example_titles[i],
                    "code": content.example_codes[i]
                });
            }
            
            report {
                "name": self.concept_name,
                "description": content.overview,
                "detailed_content": content.explanation,
                "examples": formatted_examples,
                "generated_by": "AI"
            };
        }
    }
}
```

## Data Persistence

The backend uses **LocalDB** (SQLite-based) for persistent storage:

- **Database location**: `backend/data/jaseci_db/`
- **Persists**: User progress, mastery scores, notes, completed lessons
- **Auto-created**: Directory created automatically on first run

### Reset Data

To clear all data:
```bash
rm -rf backend/data/
```

### Use MongoDB (Production)

Set in `backend/.env`:
```
DATABASE_HOST=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
```

## Frontend Integration

The frontend's `api.js` includes:

### API Response Caching

```javascript
// Cacheable walkers (read-only operations)
const CACHEABLE_WALKERS = ['get_dashboard', 'get_notes', 'recommend_next'];
const CACHE_TTL = 60000; // 1 minute

// Cache invalidation after mutations
export function invalidateCache(pattern = '') { ... }
```

### Usage in Components

```javascript
import { getDashboard, updateMastery, invalidateCache } from '../api';

// Cached request (fast if recent)
const dashboard = await getDashboard('demo_user');

// Mutation (invalidates cache automatically)
await updateMastery('demo_user', 'Walkers', 80);
```

## Supported LLM Providers

The `byllm` package supports multiple providers via LiteLLM:

| Provider | Model | Environment Variable |
|----------|-------|---------------------|
| **Google Gemini** | `gemini/gemini-2.0-flash` | `GEMINI_API_KEY` |
| OpenAI | `openai/gpt-4o-mini` | `OPENAI_API_KEY` |
| Anthropic | `anthropic/claude-3` | `ANTHROPIC_API_KEY` |

To switch providers, change the model in `main.jac`:
```jac
// For Gemini (default)
glob llm = Model(model_name="gemini/gemini-2.0-flash");

// For OpenAI
glob llm = Model(model_name="openai/gpt-4o-mini");
```

## Security Best Practices

1. **Never commit API keys** - Use `.env` files only

2. **Add to `.gitignore`:**
   ```
   .env
   *.env
   backend/data/
   ```

3. **Use `python-dotenv`** - The `start_server.py` loads keys automatically

4. **Rate limiting** - Gemini has generous free limits but monitor usage

## Cost Information

| Provider | Model | Cost |
|----------|-------|------|
| **Gemini** | gemini-2.0-flash | **Free** (with limits) |
| OpenAI | gpt-4o-mini | $0.15/1M input tokens |
| OpenAI | gpt-4o | $5/1M input tokens |

**Gemini is recommended** for this app as it's free and fast!

## Version Requirements

For compatibility, use these exact versions:

```txt
jaclang==0.9.3
byllm>=0.4.0
python-dotenv>=1.0.0
```

Install from `requirements.txt`:
```bash
pip install -r backend/requirements.txt
```

## Troubleshooting

### "API key not valid" Error

```bash
# Check if key is in .env
cat backend/.env

# Should show:
# GEMINI_API_KEY=AIza...
```

### "byllm not found" Error

```bash
pip install byllm
```

### AI content not loading

1. Check backend terminal for errors
2. Verify API key is valid
3. Try restarting the backend

### Content appears in wrong fields

This was fixed by using unified `ConceptContent` and `LessonContent` objects that return all fields in a single AI call.

### Walker endpoints not found (404)

Ensure you're using compatible versions:
```bash
pip install jaclang==0.9.3
```

## Related Resources

- [Jaseci Documentation](https://docs.jaseci.org/)
- [Google AI Studio](https://aistudio.google.com/)
- [Jac Language Guide](https://www.jac-lang.org/)
- [byllm Package](https://pypi.org/project/byllm/)

---

*Last updated: December 2025*
