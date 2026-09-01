import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import DashboardPage from './page'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

vi.mock('@/hooks/use-user', () => ({
  useUser: vi.fn(() => ({
    user: null,
    loading: false,
    signOut: vi.fn(),
  })),
}))

vi.mock('@/lib/supabase/client', () => ({
  isSupabaseConfigured: vi.fn(() => false),
}))

vi.mock('@/lib/supabase/workspaces', () => ({
  createWorkspace: vi.fn(),
  getWorkspaces: vi.fn(),
  deleteWorkspace: vi.fn(),
}))

describe('Dashboard Page', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders workspaces heading', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Workspaces')).toBeDefined()
  })

  it('shows demo mode indicator', () => {
    render(<DashboardPage />)
    expect(screen.getByText(/Demo mode/)).toBeDefined()
  })

  it('renders mock workspace cards', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Collaborative Editor')).toBeDefined()
    expect(screen.getByText('API Gateway')).toBeDefined()
    expect(screen.getByText('ML Pipeline')).toBeDefined()
    expect(screen.getByText('Mobile App')).toBeDefined()
  })

  it('renders search input', () => {
    render(<DashboardPage />)
    expect(screen.getByPlaceholderText('Search workspaces...')).toBeDefined()
  })

  it('renders new workspace button', () => {
    render(<DashboardPage />)
    expect(screen.getByText('New')).toBeDefined()
  })

  it('renders create new workspace card', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Create new workspace')).toBeDefined()
  })

  it('filters workspaces by search', () => {
    render(<DashboardPage />)
    
    const searchInput = screen.getByPlaceholderText('Search workspaces...')
    fireEvent.change(searchInput, { target: { value: 'API' } })

    expect(screen.getByText('API Gateway')).toBeDefined()
    expect(screen.queryByText('ML Pipeline')).toBeNull()
  })

  it('opens create dialog when clicking New', () => {
    render(<DashboardPage />)
    
    fireEvent.click(screen.getByText('New'))

    expect(screen.getByText('Create workspace')).toBeDefined()
    expect(screen.getByLabelText('Name')).toBeDefined()
    expect(screen.getByLabelText('Description')).toBeDefined()
  })

  it('opens create dialog when clicking create card', () => {
    render(<DashboardPage />)
    
    fireEvent.click(screen.getByText('Create new workspace'))

    expect(screen.getByText('Create workspace')).toBeDefined()
  })

  it('shows sign in link when not authenticated', () => {
    render(<DashboardPage />)
    expect(screen.getByText('Sign in')).toBeDefined()
  })
})
