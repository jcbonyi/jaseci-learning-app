# byLLM (OpenAI) Integration Guide

This guide explains how to configure LLM integration for enhanced quiz generation and AI-powered features.

## Current Implementation

The platform currently uses **static, concept-specific quiz questions** that are pre-defined in `main.jac`. Each concept has 3 multiple-choice questions with proper answers.

### Supported Concepts with Quizzes

| Concept | Questions |
|---------|-----------|
| Jac syntax | `has` keyword, node definition, statement endings |
| Nodes & edges | Edge operators, accessing connected nodes, edge keyword |
| Walkers | `report`, `disengage`, `visit` commands |
| GraphOps | Filtering by type, `-->` operator, incoming edges |
| OSP | `here` keyword, OSP meaning, computation location |
| byLLM | Decorator syntax, environment variable, function signature |
| AI agents | Walker + byLLM combination, agent benefits, OSP + byLLM |

## Adding OpenAI Integration (Optional)

To enable dynamic LLM-powered quiz generation:

### 1. Set Environment Variable

**PowerShell:**
```powershell
$env:OPENAI_API_KEY = "sk-..."
```

**Bash/WSL:**
```bash
export OPENAI_API_KEY="sk-..."
```

### 2. Verify API Key

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### 3. Modify Quiz Generation

Edit `backend/main.jac` and update the `generate_quiz` walker to call OpenAI:

```jac
walker generate_quiz_llm {
    has concept_name: str;
    has num_questions: int = 3;

    can generate with `root entry {
        # Find concept for context
        target_concept = None;
        for c in [-->(`?concept)] {
            if c.name == self.concept_name {
                target_concept = c;
                break;
            }
        }
        
        context = "";
        if target_concept is not None {
            context = target_concept.detailed_content;
        }
        
        # Build prompt
        prompt = f"""Generate {self.num_questions} multiple choice questions about {self.concept_name} in Jac/Jaseci.

Context: {context}

Return as JSON array with format:
[
  {{
    "q": "Question text",
    "type": "multiple",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Correct option text"
  }}
]""";

        # TODO: Call OpenAI API here
        # response = call_openai(prompt);
        # questions = parse_json(response);
        
        # For now, fall back to static questions
        questions = [...];  # Static fallback
        
        q = quiz(concept=self.concept_name, questions=questions, passing_score=70);
        here ++> q;
        report {"quiz_id": str(id(q)), "concept": self.concept_name, "questions": questions};
    }
}
```

## Alternative: Python Proxy for OpenAI

Create a Python proxy service that the Jac backend can call:

### `backend/openai_proxy.py`

```python
from fastapi import FastAPI
from openai import OpenAI
import json
import os

app = FastAPI()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.post("/generate-quiz")
async def generate_quiz(concept: str, context: str = "", num_questions: int = 3):
    prompt = f"""Generate {num_questions} multiple choice questions about {concept}.
    Context: {context}
    Return as JSON array with q, type, options, answer fields."""
    
    response = client.chat.completions.create(
        model="gpt-4",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    return json.loads(response.choices[0].message.content)
```

Run with:
```bash
pip install fastapi uvicorn openai
uvicorn openai_proxy:app --port 8001
```

Then call from Jac via HTTP (if your Jac version supports it).

## Security Best Practices

1. **Never commit API keys** - Use environment variables only
2. **Add to .gitignore:**
   ```
   .env
   *.env
   ```
3. **Rate limiting** - Cache generated quizzes to reduce API costs
4. **Cost monitoring** - Set usage limits in OpenAI dashboard
5. **Validate responses** - Always validate LLM output before using

## Quiz Question Format

The frontend expects questions in this format:

```json
{
  "q": "What keyword declares fields in Jac?",
  "type": "multiple",
  "options": ["var", "let", "has", "def"],
  "answer": "has"
}
```

- `type: "multiple"` → Radio button selection
- `type: "short"` → Text input (for open-ended questions)
- `answer` must exactly match one of the `options`

## Testing Quiz Generation

Use the Code Playground in Walker API mode:

```javascript
generate_quiz({ concept_name: "Walkers" })
```

Expected output:
```json
{
  "quiz_id": "...",
  "concept": "Walkers",
  "questions": [
    {
      "q": "What keyword is used to return data from a walker?",
      "type": "multiple",
      "options": ["return", "yield", "report", "output"],
      "answer": "report"
    },
    ...
  ],
  "passing_score": 70
}
```

## Future Enhancements

- [ ] Integrate OpenAI for dynamic question generation
- [ ] Add question difficulty levels
- [ ] Generate explanations for wrong answers
- [ ] Create adaptive quizzes based on user performance
- [ ] Support multiple LLM providers (Anthropic, Gemini, etc.)

---

For more information:
- [Jaseci Documentation](https://docs.jaseci.org/)
- [OpenAI API Docs](https://platform.openai.com/docs/)
- [LangChain for Jac](https://github.com/Jaseci-Labs) (future)
