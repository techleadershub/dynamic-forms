import { render, screen, fireEvent, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionForm } from '@/components/QuestionForm'

describe('QuestionForm', () => {
  it('renders multiple_choice with radio buttons', () => {
    const question = {
      question: "What's your role?",
      type: 'multiple_choice' as const,
      options: ['PM', 'Dev', 'Designer'],
    }

    const onSubmit = jest.fn()
    render(<QuestionForm question={question} isSubmitting={false} onSubmit={onSubmit} />)

    expect(screen.getByLabelText('PM')).toBeInTheDocument()
    expect(screen.getByLabelText('Dev')).toBeInTheDocument()
    expect(screen.getByLabelText('Designer')).toBeInTheDocument()
  })

  it('renders checkbox with checkboxes', () => {
    const question = {
      question: 'Which tools do you use?',
      type: 'checkbox' as const,
      options: ['Jira', 'Slack', 'Figma'],
    }

    const onSubmit = jest.fn()
    render(<QuestionForm question={question} isSubmitting={false} onSubmit={onSubmit} />)

    expect(screen.getByLabelText('Jira')).toBeInTheDocument()
    expect(screen.getByLabelText('Slack')).toBeInTheDocument()
    expect(screen.getByLabelText('Figma')).toBeInTheDocument()
  })

  it('renders free_text with textarea', () => {
    const question = {
      question: 'Tell me about your challenges',
      type: 'free_text' as const,
    }

    const onSubmit = jest.fn()
    render(<QuestionForm question={question} isSubmitting={false} onSubmit={onSubmit} />)

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Type your response...')).toBeInTheDocument()
  })

  it('calls onSubmit with selected value for multiple_choice', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    const question = {
      question: "What's your role?",
      type: 'multiple_choice' as const,
      options: ['PM', 'Dev'],
    }

    const user = userEvent.setup()
    render(<QuestionForm question={question} isSubmitting={false} onSubmit={onSubmit} />)

    await act(async () => {
      await user.click(screen.getByLabelText('PM'))
      await user.click(screen.getByRole('button', { name: /submit/i }))
    })

    expect(onSubmit).toHaveBeenCalledWith('PM')
  })

  it('calls onSubmit with selected array for checkbox', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    const question = {
      question: 'Which tools?',
      type: 'checkbox' as const,
      options: ['Jira', 'Slack'],
    }

    const user = userEvent.setup()
    render(<QuestionForm question={question} isSubmitting={false} onSubmit={onSubmit} />)

    await act(async () => {
      await user.click(screen.getByLabelText('Jira'))
      await user.click(screen.getByLabelText('Slack'))
      await user.click(screen.getByRole('button', { name: /submit/i }))
    })

    expect(onSubmit).toHaveBeenCalledWith(['Jira', 'Slack'])
  })

  it('calls onSubmit with text value for free_text', async () => {
    const onSubmit = jest.fn().mockResolvedValue(undefined)
    const question = {
      question: 'Tell me more',
      type: 'free_text' as const,
    }

    const user = userEvent.setup()
    render(<QuestionForm question={question} isSubmitting={false} onSubmit={onSubmit} />)

    const textarea = screen.getByRole('textbox')
    await act(async () => {
      await user.type(textarea, 'Test answer')
      await user.click(screen.getByRole('button', { name: /submit/i }))
    })

    expect(onSubmit).toHaveBeenCalledWith('Test answer')
  })
})

