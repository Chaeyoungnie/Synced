import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SignInPage from './page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

// Mock supabase auth
vi.mock('@/lib/supabase/auth', () => ({
  signInWithEmail: vi.fn().mockResolvedValue({ error: null }),
  signInWithGitHub: vi.fn().mockResolvedValue({ error: null }),
  signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
}))

describe('Sign In Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in form', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Welcome back')).toBeDefined()
    expect(screen.getByText('Sign in to your account to continue')).toBeDefined()
  })

  it('renders email and password inputs', () => {
    render(<SignInPage />)
    
    expect(screen.getByLabelText('Email')).toBeDefined()
    expect(screen.getByLabelText('Password')).toBeDefined()
  })

  it('renders OAuth buttons', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Continue with GitHub')).toBeDefined()
    expect(screen.getByText('Continue with Google')).toBeDefined()
  })

  it('renders sign in button', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Sign in with Email')).toBeDefined()
  })

  it('renders sign up link', () => {
    render(<SignInPage />)
    
    expect(screen.getByText('Sign up')).toBeDefined()
  })

  it('allows typing in email field', () => {
    render(<SignInPage />)
    
    const emailInput = screen.getByLabelText('Email')
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    
    expect((emailInput as HTMLInputElement).value).toBe('test@example.com')
  })

  it('allows typing in password field', () => {
    render(<SignInPage />)
    
    const passwordInput = screen.getByLabelText('Password')
    fireEvent.change(passwordInput, { target: { value: 'secret123' } })
    
    expect((passwordInput as HTMLInputElement).value).toBe('secret123')
  })
})
