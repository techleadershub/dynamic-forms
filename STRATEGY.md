# Dynamic Discovery Chatbot - Comprehensive Strategy

## Overview
An AI-powered interactive chatbot that generates contextual questions based on survey purpose and user answers. Dynamically switches between multiple choice, checkbox, and free text inputs for optimal user experience.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                    │
│  - Chat Interface                                        │
│  - Dynamic Form Elements (radio/checkbox/text)          │
│  - Admin Dashboard                                       │
└────────────────────┬────────────────────────────────────┘
                     │ HTTP/JSON
┌────────────────────▼────────────────────────────────────┐
│              Backend API (FastAPI)                       │
│  - Session Management                                    │
│  - Question Generation                                    │
│  - Answer Processing                                     │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│            AI Service (OpenAI GPT-4o-mini)               │
│  - Question Generation with Context                      │
│  - Form Type Decision                                    │
│  - Completion Detection                                  │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│              Storage (JSON Files)                        │
│  - Session Data (data/sessions/{session_id}.json)        │
│  - Configuration (config.json)                            │
└─────────────────────────────────────────────────────────┘
```

---

## Backend Strategy

### Technology Stack
- **Framework**: FastAPI 0.115.0
- **Server**: Uvicorn 0.32.0
- **AI**: OpenAI Python SDK 1.54.0
- **Python**: 3.11
- **Package Manager**: uv
- **Storage**: JSON files

### Project Structure
```
backend/
  app.py                      # FastAPI app, routes
  ai_service.py               # OpenAI integration, prompt management
  session_manager.py          # JSON file operations
  config.py                   # Config loading
data/
  sessions/                   # {session_id}.json files
config.json                   # Survey configuration
pyproject.toml                # uv dependencies
```

### API Endpoints

#### 1. POST /api/start
**Purpose**: Initialize new survey session

**Request**: None (or optional config override)

**Response**:
```json
{
  "session_id": "abc123",
  "question": "What's your role?",
  "type": "multiple_choice",
  "options": ["Product Manager", "Developer", "Designer", "Other"],
  "is_complete": false,
  "progress": {
    "current": 1,
    "min": 5,
    "max": 15
  }
}
```

**Flow**:
1. Generate session_id (UUID)
2. Load config.json
3. Call AI service to generate first question
4. Save initial session state to JSON
5. Return question + metadata

---

#### 2. POST /api/answer
**Purpose**: Submit answer and get next question

**Request**:
```json
{
  "session_id": "abc123",
  "answer": "Product Manager"  // string for multiple_choice/free_text
  // OR
  "answer": ["Jira", "Slack"]  // array for checkbox
}
```

**Response**:
```json
{
  "question": "How many people are on your team?",
  "type": "multiple_choice",
  "options": ["1-5", "6-20", "21-50", "50+"],
  "is_complete": false,
  "progress": {
    "current": 2,
    "min": 5,
    "max": 15
  }
}
```

**Flow**:
1. Load session from JSON
2. Append answer to conversation history
3. Check if max questions reached → return completion
4. Call AI service with full history
5. Save updated session
6. Return next question

---

#### 3. GET /api/admin/sessions
**Purpose**: List all survey sessions

**Response**:
```json
{
  "sessions": [
    {
      "session_id": "abc123",
      "started_at": "2024-01-01T10:00:00",
      "questions_asked": 8,
      "is_complete": true
    }
  ]
}
```

**Flow**:
1. Scan data/sessions/ directory
2. Load each JSON file
3. Extract metadata
4. Return list

---

#### 4. GET /api/admin/session/:session_id
**Purpose**: View full Q&A for a session

**Response**:
```json
{
  "session_id": "abc123",
  "started_at": "2024-01-01T10:00:00",
  "completed_at": "2024-01-01T10:05:00",
  "conversation": [
    {
      "question": "What's your role?",
      "answer": "Product Manager",
      "type": "multiple_choice"
    },
    {
      "question": "Tell me about your challenges",
      "answer": "We struggle with team alignment...",
      "type": "free_text"
    }
  ]
}
```

**Flow**:
1. Load session JSON
2. Format conversation history
3. Return full data

---

### Session Data Structure

**File**: `data/sessions/{session_id}.json`

```json
{
  "session_id": "abc123",
  "started_at": "2024-01-01T10:00:00",
  "completed_at": null,
  "questions_asked": 3,
  "conversation": [
    {
      "question": "What's your role?",
      "answer": "Product Manager",
      "type": "multiple_choice",
      "timestamp": "2024-01-01T10:00:05"
    },
    {
      "question": "How many people are on your team?",
      "answer": "6-20",
      "type": "multiple_choice",
      "timestamp": "2024-01-01T10:00:15"
    }
  ],
  "config": {
    "purpose": "...",
    "min_questions": 5,
    "max_questions": 15
  }
}
```

---

### Configuration File

**File**: `config.json`

```json
{
  "purpose": "Understand customer needs for SaaS product",
  "context": "Target audience: Small businesses. Focus areas: pain points, budget, team size",
  "min_questions": 5,
  "max_questions": 15,
  "ai_model": "gpt-4o-mini",
  "openai_api_key": "sk-..." // or use OPENAI_API_KEY env var
}
```

---

## AI Strategy

### Prompt Design

#### System Prompt
```
You are conducting a discovery survey. Generate contextual questions that build on previous answers.

Guidelines:
- Never repeat questions
- Build naturally on previous answers
- Prefer structured inputs (options/checkboxes) for ease - use 60% structured, 40% free text
- Track coverage and explore gaps
- If purpose satisfied AND min questions met, set is_complete: true
- Keep questions conversational

Question Type Rules:
- "multiple_choice": Single answer, clear categories (roles, sizes, yes/no, preferences)
- "checkbox": Multiple selections make sense (tools, pain points, features, challenges)
- "free_text": Needs explanation, context, or detailed narrative

Return valid JSON only.
```

#### User Prompt Template
```
Purpose: {purpose}
Context: {context}

Examples of good question generation:

Example 1:
Purpose: "Understand customer needs for SaaS product"
Q1: "What's your role?" → type: "multiple_choice", options: ["Product Manager", "Developer", "Designer", "Executive", "Other"]
A1: "Product Manager"
Q2: "How many people are on your team?" → type: "multiple_choice", options: ["1-5", "6-20", "21-50", "50+"]
A2: "6-20"
Q3: "What are your main pain points?" → type: "checkbox", options: ["Team collaboration", "Project tracking", "Budget management", "Reporting", "Other"]
A3: ["Team collaboration", "Project tracking"]
Q4: "Tell me more about your team collaboration challenges" → type: "free_text" (needs detail)

Example 2:
Purpose: "Customer onboarding for SaaS"
Q1: "Which tools do you currently use?" → type: "checkbox", options: ["Jira", "Asana", "Trello", "Monday.com", "None"]
A1: ["Jira", "Slack"]
Q2: "What's missing in your current setup?" → type: "free_text" (needs explanation)

Conversation History:
{conversation_history}

Questions asked: {questions_asked} / {max_questions} (min: {min_questions})

Generate the next question following the examples. Consider:
- What's been covered vs what's missing
- Natural flow from last answer
- Appropriate form type (prefer structured when possible)

Return JSON:
{
  "question": "Your question here",
  "type": "multiple_choice" | "checkbox" | "free_text",
  "options": ["option1", "option2", ...] (required if type is not free_text),
  "is_complete": false,
  "reasoning": "Why this question now"
}
```

### Conversation History Format

```
Q1: What's your role?
A1: Product Manager
Q2: How many people are on your team?
A2: 6-20
Q3: What are your main pain points?
A3: Team collaboration, Project tracking
```

### AI Service Flow

1. **First Question**:
   - Load config (purpose, context)
   - Call OpenAI with system + user prompt (no history)
   - Parse JSON response
   - Return question

2. **Subsequent Questions**:
   - Load session JSON
   - Format conversation history
   - Build prompt with history
   - Call OpenAI
   - Parse JSON response
   - Check `is_complete` flag
   - Return question

3. **Completion Detection**:
   - AI returns `is_complete: true` when purpose satisfied
   - Backend also checks: `questions_asked >= max_questions`
   - Either condition triggers completion

### Error Handling

- **Invalid JSON from AI**: Retry with stricter prompt
- **Missing fields**: Use defaults (type: "free_text" if options missing)
- **API errors**: Return error message, allow retry

---

## Frontend Strategy

### Technology Stack
- **Framework**: Next.js 14.2.18
- **React**: 18.3.1
- **TypeScript**: 5.6.2
- **Styling**: TailwindCSS 3.4.14

### Project Structure
```
frontend/
  src/
    app/
      page.tsx                 # Main chat page
      admin/
        page.tsx               # Admin dashboard
    components/
      ChatInterface.tsx        # Main chat container
      MessageBubble.tsx        # Question/answer display
      QuestionForm.tsx         # Dynamic form renderer
      ProgressBar.tsx          # Progress indicator
    lib/
      api.ts                   # API client functions
      types.ts                 # TypeScript interfaces
```

### Component Architecture

#### ChatInterface (Main Container)
```typescript
State:
- messages: Array<{role: "bot" | "user", content: string}>
- currentQuestion: {question, type, options, is_complete}
- sessionId: string
- isLoading: boolean
- progress: {current, min, max}

Flow:
1. On mount → POST /api/start → Set first question
2. User submits answer → POST /api/answer → Update messages, set next question
3. If is_complete → Show completion screen
```

#### QuestionForm (Dynamic Renderer)
```typescript
Props: {question, type, options, onSubmit}

Logic:
if (type === "multiple_choice") {
  Render: Radio buttons (single select)
  Submit: Selected value (string)
}

if (type === "checkbox") {
  Render: Checkboxes (multi-select)
  Submit: Selected array (string[])
}

if (type === "free_text") {
  Render: Textarea + Submit button
  Submit: Text value (string)
}
```

#### MessageBubble
```typescript
Props: {role: "bot" | "user", content: string}

Display:
- Bot: Left-aligned, different color
- User: Right-aligned, different color
```

### API Client (lib/api.ts)

```typescript
// Start survey
async function startSurvey() {
  const res = await fetch('/api/start', { method: 'POST' });
  return res.json();
}

// Submit answer
async function submitAnswer(sessionId: string, answer: string | string[]) {
  const res = await fetch('/api/answer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, answer })
  });
  return res.json();
}

// Get sessions (admin)
async function getSessions() {
  const res = await fetch('/api/admin/sessions');
  return res.json();
}

// Get session details (admin)
async function getSession(sessionId: string) {
  const res = await fetch(`/api/admin/session/${sessionId}`);
  return res.json();
}
```

### TypeScript Types (lib/types.ts)

```typescript
interface Question {
  question: string;
  type: "multiple_choice" | "checkbox" | "free_text";
  options?: string[];
  is_complete: boolean;
  reasoning?: string;
}

interface Progress {
  current: number;
  min: number;
  max: number;
}

interface SurveyResponse extends Question {
  session_id: string;
  progress: Progress;
}

interface ConversationItem {
  question: string;
  answer: string | string[];
  type: string;
  timestamp: string;
}

interface Session {
  session_id: string;
  started_at: string;
  completed_at: string | null;
  questions_asked: number;
  conversation: ConversationItem[];
}
```

---

## Communication Flow

### Complete User Journey

1. **User visits** `/` → Frontend loads
2. **Frontend calls** `POST /api/start`
3. **Backend**:
   - Generates session_id
   - Loads config.json
   - Calls AI service (first question)
   - Saves session JSON
   - Returns question + metadata
4. **Frontend**:
   - Displays question in chat
   - Renders form based on `type`:
     - `multiple_choice` → Radio buttons
     - `checkbox` → Checkboxes
     - `free_text` → Textarea
5. **User submits answer**
6. **Frontend calls** `POST /api/answer` with answer
7. **Backend**:
   - Loads session JSON
   - Appends answer to conversation
   - Checks max questions
   - Calls AI service with full history
   - Saves updated session
   - Returns next question
8. **Frontend**:
   - Adds user answer to chat
   - Displays next question
   - Updates progress
9. **Repeat steps 5-8** until `is_complete: true` or max reached
10. **Completion**:
    - Show completion message
    - Option to view summary

### Admin Flow

1. **Admin visits** `/admin`
2. **Frontend calls** `GET /api/admin/sessions`
3. **Backend**:
   - Scans `data/sessions/` directory
   - Loads each JSON file
   - Returns session list
4. **Frontend** displays list
5. **Admin clicks session** → Frontend calls `GET /api/admin/session/:id`
6. **Backend** returns full conversation
7. **Frontend** displays Q&A

---

## Data Flow Diagram

```
User Action
    ↓
Frontend Component
    ↓
API Client (lib/api.ts)
    ↓ HTTP Request
Backend API (app.py)
    ↓
Session Manager (load/save JSON)
    ↓
AI Service (ai_service.py)
    ↓
OpenAI API
    ↓ JSON Response
AI Service (parse response)
    ↓
Backend API (format response)
    ↓ HTTP Response
API Client
    ↓
Frontend Component (update state)
    ↓
UI Renders
```

---

## Key Design Decisions

1. **JSON Storage**: Simple, no database needed for MVP
2. **Single AI Call**: One call per question, context in prompt
3. **Dynamic Form Types**: AI decides, UI renders accordingly
4. **Completion Detection**: AI + backend checks (min/max)
5. **No State Management Library**: React useState sufficient
6. **Simple Admin**: Read JSON files, display data

---

## Error Handling Strategy

### Backend
- **Invalid session_id**: Return 404
- **AI API failure**: Return 500 with retry suggestion
- **Invalid JSON from AI**: Log error, return generic question
- **Config missing**: Return 500 with clear error

### Frontend
- **Network errors**: Show error message, allow retry
- **Invalid response**: Show error, suggest refresh
- **Loading states**: Show spinner during AI generation

---

## Security Considerations

1. **API Key**: Store in environment variable, not config.json (for production)
2. **Session IDs**: Use UUIDs (not predictable)
3. **Input Validation**: Validate answers before saving
4. **CORS**: Configure for frontend domain
5. **Rate Limiting**: Consider adding for production

---

## Future Enhancements (Post-MVP)

1. **Database**: Migrate from JSON to PostgreSQL
2. **Authentication**: Add admin login
3. **Analytics**: Track question effectiveness
4. **Export**: CSV/PDF export of results
5. **Multi-survey**: Support multiple survey configs
6. **Real-time**: WebSocket for live updates
7. **Validation Layer**: Override AI form type if needed

---

## Implementation Checklist

### Backend
- [ ] Setup FastAPI project with uv
- [ ] Create config.json structure
- [ ] Implement session_manager.py (JSON operations)
- [ ] Implement ai_service.py (OpenAI integration)
- [ ] Create API endpoints (start, answer, admin)
- [ ] Add error handling
- [ ] Test AI prompt responses

### Frontend
- [ ] Setup Next.js project
- [ ] Create TypeScript types
- [ ] Implement API client
- [ ] Build ChatInterface component
- [ ] Build QuestionForm (dynamic renderer)
- [ ] Build MessageBubble component
- [ ] Build ProgressBar component
- [ ] Create admin page
- [ ] Add styling with TailwindCSS
- [ ] Test complete flow

### Integration
- [ ] Connect frontend to backend
- [ ] Test end-to-end flow
- [ ] Handle edge cases
- [ ] Add loading states
- [ ] Polish UI/UX

---

## Ready for Implementation

This document covers:
✅ Backend architecture and API design
✅ AI prompt strategy and conversation flow
✅ Frontend component structure
✅ Communication protocols
✅ Data storage format
✅ Error handling
✅ Complete user journey

**Next Step**: Begin implementation following this strategy.

