import { rest } from 'msw'
import { setupServer } from 'msw/node'
import { startSurvey, submitAnswer, fetchSessions, fetchSessionDetail } from '@/lib/api'

const server = setupServer()
const API_BASE = 'http://localhost:8000'
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

describe('API Client', () => {
  it('startSurvey returns question data', async () => {
    server.use(
      rest.post(`${API_BASE}/api/start`, (_req, res, ctx) =>
        res(
          ctx.json({
            session_id: 'test123',
            question: 'Test question',
            type: 'multiple_choice',
            options: ['A', 'B'],
            is_complete: false,
            progress: { current: 1, min: 5, max: 15 },
          })
        )
      )
    )

    const result = await startSurvey()
    expect(result.session_id).toBe('test123')
    expect(result.question).toBe('Test question')
    expect(result.type).toBe('multiple_choice')
  })

  it('submitAnswer sends correct payload', async () => {
    let requestBody: any = null
    server.use(
      rest.post(`${API_BASE}/api/answer`, async (req, res, ctx) => {
        requestBody = await req.json()
        return res(
          ctx.json({
            question: 'Next question',
            type: 'free_text',
            is_complete: false,
            progress: { current: 2, min: 5, max: 15 },
          })
        )
      })
    )

    await submitAnswer({ session_id: 'session123', answer: 'Answer text' })
    expect(requestBody).toEqual({
      session_id: 'session123',
      answer: 'Answer text',
    })
  })

  it('submitAnswer handles checkbox arrays', async () => {
    let requestBody: any = null
    server.use(
      rest.post(`${API_BASE}/api/answer`, async (req, res, ctx) => {
        requestBody = await req.json()
        return res(
          ctx.json({
            question: 'Next',
            type: 'multiple_choice',
            options: ['X'],
            is_complete: false,
            progress: { current: 2, min: 5, max: 15 },
          })
        )
      })
    )

    await submitAnswer({ session_id: 'session123', answer: ['Option1', 'Option2'] })
    expect(requestBody.answer).toEqual(['Option1', 'Option2'])
  })

  it('getSessions fetches session list', async () => {
    server.use(
      rest.get(`${API_BASE}/api/admin/sessions`, (_req, res, ctx) =>
        res(
          ctx.json([
            {
              session_id: 's1',
              started_at: '2024-01-01T10:00:00',
              questions_asked: 5,
            },
          ])
        )
      )
    )

    const sessions = await fetchSessions()
    expect(sessions).toHaveLength(1)
    expect(sessions[0].session_id).toBe('s1')
  })

  it('getSession fetches session details', async () => {
    server.use(
      rest.get(`${API_BASE}/api/admin/session/:id`, (_req, res, ctx) =>
        res(
          ctx.json({
            session_id: 's1',
            started_at: '2024-01-01T10:00:00',
            completed_at: null,
            questions_asked: 3,
            conversation: [
              { question: 'Q1', answer: 'A1', type: 'multiple_choice' },
            ],
          })
        )
      )
    )

    const session = await fetchSessionDetail('s1')
    expect(session.session_id).toBe('s1')
    expect(session.conversation).toHaveLength(1)
  })
})

