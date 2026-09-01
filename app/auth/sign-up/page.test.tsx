import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SignUpPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('@/lib/supabase/auth', () => ({
  signUpWithEmail: vi.fn().mockResolvedValue({ error: null }),
  signInWithGitHub: vi.fn().mockResolvedValue({ error: null }),
  signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
}))

describe('Sign Up Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign up form', () => {
    render(<SignUpPage />)
    expect(screen.getByText('Create your account')).toBeDefined()
    expect(screen.getByText('Start building together in minutes')).toBeDefined()
  })

  it('renders all form fields', () => {
    render(<SignUpPage />)
    expect(screen.getByLabelText('Full name')).toBeDefined()
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
  })

  it('renders OAuth buttons', () => {
    render(<SignUpPage />)
    expect(screen.getByText('Continue with GitHub')).toBeDefined()
    expect(screen.getByText('Continue with Google')).toBeDefined()
  })

  it('renders create account button', () => {
    render(<SignUpPage />)
    expect(screen.getByText('Create account')).toBeDefined()
  })

  it('renders sign in link', () => {
    render(<SignUpPage />)
    expect(screen.getByText('Sign in')).toBeDefined()
  })

  it('allows typing in all fields', () => {
    render(<SignUpPage />)
    
    const nameInput = screen.getByLabelText('Full name')
    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')

    fireEvent.change(nameInput, { target: { value: 'John Doe' } })
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })

    expect((nameInput as HTMLInputElement).value).toBe('John Doe')
    expect((emailInput as HTMLInputElement).value).toBe('john@example.com')
    expect((passwordInput as HTMLInputElement).value).toBe('secret123')
  })

  it('shows password length hint', () => {
    render(<SignUpPage />)
    expect(screen.getByText('Must be at least 6 characters')).toBeDefined()
  })
})
