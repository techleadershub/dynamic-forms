import { rest } from 'msw'
import { setupServer } from 'msw/node'

export const server = setupServer(
  rest.post('/api/start', (_req, res, ctx) => {
    return res(
      ctx.json({
        session_id: 'mock123',
        question: 'Mock question',
        type: 'multiple_choice',
        options: ['A', 'B', 'C'],
        is_complete: false,
        progress: { current: 1, min: 5, max: 15 },
      })
    )
  }),

  rest.post('/api/answer', (_req, res, ctx) => {
    return res(
      ctx.json({
        question: 'Next question',
        type: 'checkbox',
        options: ['X', 'Y', 'Z'],
        is_complete: false,
        progress: { current: 2, min: 5, max: 15 },
      })
    )
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

