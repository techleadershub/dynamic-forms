# Testing Strategy - Dynamic Discovery Chatbot

## Overview
Comprehensive testing strategy for backend API, frontend components, and full integration. Tests should be run independently before integration and together for end-to-end validation.

---

## Testing Philosophy

1. **Backend First**: Test API endpoints independently with mock AI responses
2. **Frontend Second**: Test components with mock API responses
3. **Integration Last**: Test full flow with real AI calls
4. **Isolation**: Each layer testable without dependencies

---

## Backend Testing

### Test Framework
- **pytest** 7.4.0
- **httpx** (for async FastAPI testing)
- **pytest-asyncio** (async test support)

### Test Structure
```
backend/
  tests/
    __init__.py
    test_api.py              # API endpoint tests
    test_ai_service.py       # AI service tests (mocked)
    test_session_manager.py  # JSON file operations
    conftest.py              # Fixtures and test config
    fixtures/
      sample_config.json     # Test config
      sample_session.json    # Sample session data
```

### Test Categories

#### 1. Unit Tests - Session Manager
**File**: `test_session_manager.py`

```python
Tests:
- test_create_session()          # Create new session JSON
- test_load_session()            # Load existing session
- test_save_answer()             # Append answer to session
- test_session_not_found()       # Handle missing session
- test_invalid_json_handling()   # Handle corrupted files
```

**Example**:
```python
def test_create_session(session_manager):
    session_id = session_manager.create_session(config)
    assert session_id is not None
    assert os.path.exists(f"data/sessions/{session_id}.json")

def test_load_session(session_manager, sample_session):
    session = session_manager.load_session(sample_session["session_id"])
    assert session["questions_asked"] == 2
    assert len(session["conversation"]) == 2
```

---

#### 2. Unit Tests - AI Service (Mocked)
**File**: `test_ai_service.py`

**Strategy**: Mock OpenAI API responses to test prompt building and response parsing without API calls.

```python
Tests:
- test_generate_first_question()        # First question generation
- test_generate_followup_question()      # Question with history
- test_parse_valid_response()            # JSON parsing
- test_handle_invalid_json()             # Error handling
- test_form_type_selection()             # Type decision logic
- test_completion_detection()            # is_complete flag
```

**Mock Setup**:
```python
@pytest.fixture
def mock_openai_response():
    return {
        "question": "What's your role?",
        "type": "multiple_choice",
        "options": ["PM", "Dev", "Designer"],
        "is_complete": False
    }

@patch('openai.ChatCompletion.create')
def test_generate_first_question(mock_openai, ai_service, config):
    mock_openai.return_value = MockResponse(mock_openai_response)
    result = ai_service.generate_question(config, [])
    assert result["type"] == "multiple_choice"
    assert len(result["options"]) == 3
```

---

#### 3. API Integration Tests
**File**: `test_api.py`

**Strategy**: Test FastAPI endpoints with test client, mock AI service.

```python
Tests:
- test_start_survey()                   # POST /api/start
- test_start_returns_valid_question()    # Response structure
- test_submit_answer()                   # POST /api/answer
- test_answer_updates_session()          # Session persistence
- test_max_questions_reached()           # Completion logic
- test_invalid_session_id()              # Error handling
- test_checkbox_answer_format()          # Array handling
- test_free_text_answer_format()         # String handling
- test_admin_list_sessions()             # GET /api/admin/sessions
- test_admin_get_session()               # GET /api/admin/session/:id
```

**Example**:
```python
@pytest.fixture
def client():
    from app import app
    return TestClient(app)

def test_start_survey(client, mock_ai_service):
    response = client.post("/api/start")
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert "question" in data
    assert "type" in data
    assert data["progress"]["current"] == 1

def test_submit_answer(client, mock_session):
    response = client.post("/api/answer", json={
        "session_id": "test123",
        "answer": "Product Manager"
    })
    assert response.status_code == 200
    data = response.json()
    assert "question" in data
    assert data["progress"]["current"] == 2
```

---

#### 4. Test Fixtures
**File**: `conftest.py`

```python
@pytest.fixture
def config():
    return {
        "purpose": "Test survey",
        "min_questions": 3,
        "max_questions": 10,
        "ai_model": "gpt-4o-mini"
    }

@pytest.fixture
def sample_session():
    return {
        "session_id": "test123",
        "questions_asked": 2,
        "conversation": [
            {"question": "Q1", "answer": "A1", "type": "multiple_choice"},
            {"question": "Q2", "answer": "A2", "type": "checkbox"}
        ]
    }

@pytest.fixture
def mock_ai_service(monkeypatch):
    def mock_generate(*args, **kwargs):
        return {
            "question": "Test question",
            "type": "multiple_choice",
            "options": ["A", "B", "C"],
            "is_complete": False
        }
    monkeypatch.setattr("ai_service.generate_question", mock_generate)
```

---

### Backend Test Commands

```bash
# Run all tests
pytest backend/tests/

# Run specific test file
pytest backend/tests/test_api.py

# Run with coverage
pytest backend/tests/ --cov=backend --cov-report=html

# Run with verbose output
pytest backend/tests/ -v

# Run specific test
pytest backend/tests/test_api.py::test_start_survey
```

---

## Frontend Testing

### Test Framework
- **Jest** 29.7.0
- **React Testing Library** 14.1.2
- **MSW (Mock Service Worker)** 2.0.0 (API mocking)

### Test Structure
```
frontend/
  src/
    __tests__/
      components/
        ChatInterface.test.tsx
        QuestionForm.test.tsx
        MessageBubble.test.tsx
        ProgressBar.test.tsx
      lib/
        api.test.ts
      app/
        page.test.tsx
        admin/
          page.test.tsx
    __mocks__/
      api.ts                    # Mock API responses
```

### Test Categories

#### 1. Component Unit Tests

**File**: `QuestionForm.test.tsx`

```typescript
Tests:
- renders multiple_choice with radio buttons
- renders checkbox with checkboxes
- renders free_text with textarea
- handles radio button selection
- handles checkbox multi-selection
- handles text input submission
- calls onSubmit with correct data
```

**Example**:
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionForm from '@/components/QuestionForm';

test('renders multiple_choice with radio buttons', () => {
  const question = {
    question: "What's your role?",
    type: "multiple_choice",
    options: ["PM", "Dev", "Designer"]
  };
  
  render(<QuestionForm {...question} onSubmit={jest.fn()} />);
  
  expect(screen.getByText("What's your role?")).toBeInTheDocument();
  expect(screen.getByLabelText("PM")).toBeInTheDocument();
  expect(screen.getByLabelText("Dev")).toBeInTheDocument();
});

test('calls onSubmit with selected value', () => {
  const onSubmit = jest.fn();
  const question = {
    question: "What's your role?",
    type: "multiple_choice",
    options: ["PM", "Dev"]
  };
  
  render(<QuestionForm {...question} onSubmit={onSubmit} />);
  
  fireEvent.click(screen.getByLabelText("PM"));
  fireEvent.click(screen.getByText("Submit"));
  
  expect(onSubmit).toHaveBeenCalledWith("PM");
});
```

---

**File**: `ChatInterface.test.tsx`

```typescript
Tests:
- renders initial question on mount
- displays user answers in chat
- displays bot questions in chat
- shows loading state during API call
- handles API errors gracefully
- shows completion message when is_complete
- updates progress indicator
```

**Example**:
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { server } from '@/__mocks__/server';
import ChatInterface from '@/components/ChatInterface';

test('renders initial question on mount', async () => {
  server.use(
    rest.post('/api/start', (req, res, ctx) => {
      return res(ctx.json({
        session_id: "test123",
        question: "What's your role?",
        type: "multiple_choice",
        options: ["PM", "Dev"]
      }));
    })
  );
  
  render(<ChatInterface />);
  
  await waitFor(() => {
    expect(screen.getByText("What's your role?")).toBeInTheDocument();
  });
});
```

---

#### 2. API Client Tests

**File**: `api.test.ts`

```typescript
Tests:
- startSurvey() makes POST request
- startSurvey() returns correct data structure
- submitAnswer() sends correct payload
- submitAnswer() handles checkbox arrays
- getSessions() fetches session list
- getSession() fetches session details
- handles network errors
- handles invalid responses
```

**Example**:
```typescript
import { server } from '@/__mocks__/server';
import { startSurvey, submitAnswer } from '@/lib/api';

test('startSurvey returns question data', async () => {
  server.use(
    rest.post('/api/start', (req, res, ctx) => {
      return res(ctx.json({
        session_id: "test123",
        question: "Test question",
        type: "multiple_choice",
        options: ["A", "B"]
      }));
    })
  );
  
  const result = await startSurvey();
  expect(result.session_id).toBe("test123");
  expect(result.question).toBe("Test question");
});
```

---

#### 3. Integration Tests (Frontend)

**File**: `page.test.tsx` (Main chat page)

```typescript
Tests:
- complete survey flow (start → answer → next question)
- handles all three form types
- updates chat history correctly
- shows progress updates
- handles completion
```

**Example**:
```typescript
test('complete survey flow', async () => {
  // Mock API responses
  server.use(
    rest.post('/api/start', ...),
    rest.post('/api/answer', ...)
  );
  
  render(<Page />);
  
  // Wait for first question
  await waitFor(() => screen.getByText("Q1"));
  
  // Submit answer
  fireEvent.click(screen.getByLabelText("Option A"));
  fireEvent.click(screen.getByText("Submit"));
  
  // Wait for next question
  await waitFor(() => screen.getByText("Q2"));
  
  // Verify chat history
  expect(screen.getByText("Option A")).toBeInTheDocument();
});
```

---

#### 4. Mock Setup

**File**: `__mocks__/server.ts`

```typescript
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.post('/api/start', (req, res, ctx) => {
    return res(ctx.json({
      session_id: "mock123",
      question: "Mock question",
      type: "multiple_choice",
      options: ["A", "B", "C"],
      is_complete: false,
      progress: { current: 1, min: 5, max: 15 }
    }));
  }),
  
  rest.post('/api/answer', (req, res, ctx) => {
    return res(ctx.json({
      question: "Next question",
      type: "checkbox",
      options: ["X", "Y", "Z"],
      is_complete: false,
      progress: { current: 2, min: 5, max: 15 }
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

### Frontend Test Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test QuestionForm.test.tsx

# Run with verbose output
npm test -- --verbose
```

---

## Integration Testing

### End-to-End Tests

**Framework**: **Playwright** or **Cypress**

**Strategy**: Test full flow with real backend and mocked AI (or test AI key).

### Test Scenarios

#### 1. Complete Survey Flow
```
Test: User completes full survey
Steps:
1. Visit homepage
2. First question appears
3. Select answer (multiple_choice)
4. Next question appears
5. Select multiple answers (checkbox)
6. Next question appears
7. Type free text answer
8. Continue until completion
9. Verify completion message
10. Verify all answers saved
```

#### 2. Form Type Switching
```
Test: All form types work correctly
Steps:
1. Start survey
2. Answer multiple_choice question
3. Verify checkbox question appears
4. Answer checkbox question
5. Verify free_text question appears
6. Answer free_text question
7. Verify next question appears
```

#### 3. Progress Tracking
```
Test: Progress updates correctly
Steps:
1. Start survey (min: 5, max: 15)
2. Answer 3 questions
3. Verify progress shows "3 / 5-15"
4. Answer 2 more questions
5. Verify progress shows "5 / 5-15"
6. Continue until max
7. Verify completion at max
```

#### 4. Admin Dashboard
```
Test: Admin can view sessions
Steps:
1. Complete a survey
2. Visit /admin
3. Verify session appears in list
4. Click session
5. Verify full Q&A displayed
6. Verify timestamps shown
```

#### 5. Error Handling
```
Test: Network errors handled
Steps:
1. Start survey
2. Disconnect network
3. Submit answer
4. Verify error message shown
5. Reconnect network
6. Retry submission
7. Verify continues normally
```

---

### Integration Test Setup

**File**: `e2e/survey.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('complete survey flow', async ({ page }) => {
  // Start backend server (or use test server)
  await page.goto('http://localhost:3000');
  
  // Wait for first question
  await expect(page.getByText(/What's your role/i)).toBeVisible();
  
  // Answer multiple choice
  await page.getByLabel('Product Manager').click();
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Wait for next question
  await page.waitForSelector('text=/How many/i');
  
  // Answer checkbox
  await page.getByLabel('Team collaboration').check();
  await page.getByLabel('Project tracking').check();
  await page.getByRole('button', { name: 'Submit' }).click();
  
  // Continue...
  
  // Verify completion
  await expect(page.getByText(/Thank you/i)).toBeVisible();
});
```

---

### Manual Testing Checklist

#### Backend
- [ ] Start survey returns valid question
- [ ] Answer submission updates session
- [ ] Max questions triggers completion
- [ ] Admin endpoints return correct data
- [ ] Error handling works (invalid session, etc.)
- [ ] JSON files created/updated correctly

#### Frontend
- [ ] Chat interface renders correctly
- [ ] All three form types render
- [ ] Answers submit correctly
- [ ] Progress updates
- [ ] Loading states show
- [ ] Error messages display
- [ ] Admin page lists sessions
- [ ] Admin page shows Q&A

#### Integration
- [ ] Full survey flow works
- [ ] All form types work
- [ ] Progress tracking accurate
- [ ] Completion detection works
- [ ] Admin can view results
- [ ] Error recovery works

---

## Test Data Management

### Test Config
**File**: `backend/tests/fixtures/test_config.json`
```json
{
  "purpose": "Test survey purpose",
  "context": "Test context",
  "min_questions": 3,
  "max_questions": 10,
  "ai_model": "gpt-4o-mini",
  "openai_api_key": "test-key"
}
```

### Mock AI Responses
**File**: `backend/tests/fixtures/mock_ai_responses.json`
```json
{
  "first_question": {
    "question": "What's your role?",
    "type": "multiple_choice",
    "options": ["PM", "Dev", "Designer"],
    "is_complete": false
  },
  "second_question": {
    "question": "Which tools do you use?",
    "type": "checkbox",
    "options": ["Jira", "Slack", "Figma"],
    "is_complete": false
  }
}
```

---

## CI/CD Testing Strategy

### Pre-commit
- Run backend unit tests
- Run frontend unit tests
- Lint checks

### Pull Request
- Full backend test suite
- Full frontend test suite
- Integration tests (if time permits)

### Before Deployment
- All tests pass
- Manual smoke tests
- Performance checks (if applicable)

---

## Testing Priorities

### Must Have (MVP)
1. ✅ Backend API endpoint tests
2. ✅ Frontend component tests (QuestionForm)
3. ✅ Basic integration test (happy path)
4. ✅ Error handling tests

### Should Have
1. ✅ AI service mocked tests
2. ✅ Session manager tests
3. ✅ Admin page tests
4. ✅ Multiple form type tests

### Nice to Have
1. E2E tests with Playwright
2. Performance tests
3. Load tests
4. Visual regression tests

---

## Test Coverage Goals

- **Backend**: 80%+ coverage
- **Frontend**: 70%+ coverage
- **Critical paths**: 100% coverage (start, answer, completion)

---

## Running All Tests

### Backend
```bash
cd backend
pytest tests/ -v --cov
```

### Frontend
```bash
cd frontend
npm test -- --coverage
```

### Integration
```bash
# Start backend
USE_FAKE_AI=1 uv run uvicorn backend.app:app --port 8000

# Start frontend
cd frontend && npm run dev

# Run E2E
npm run test:e2e
```

---

## Summary

**Backend Testing**:
- Unit tests with mocked AI
- API tests with test client
- Session manager tests
- Isolated, fast, reliable

**Frontend Testing**:
- Component tests with React Testing Library
- API client tests with MSW
- Integration tests for user flows
- Mocked backend responses

**Integration Testing**:
- E2E tests with Playwright
- Full flow validation
- Real backend (or test server)
- Manual testing checklist

**Key Principle**: Test independently first, then integrate. Mock external dependencies (AI, API) for fast, reliable tests.

