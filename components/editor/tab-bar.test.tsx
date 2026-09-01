import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { TabBar, type Tab } from './tab-bar'

const mockTabs: Tab[] = [
  { id: '1', name: 'page.tsx', type: 'code' },
  { id: '2', name: 'styles.css', type: 'css' },
  { id: '3', name: 'config.json', type: 'json' },
]

describe('TabBar', () => {
  it('renders all tabs', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTab="1"
        onTabSelect={vi.fn()}
        onTabClose={vi.fn()}
      />,
    )

    expect(screen.getByText('page.tsx')).toBeInTheDocument()
    expect(screen.getByText('styles.css')).toBeInTheDocument()
    expect(screen.getByText('config.json')).toBeInTheDocument()
  })

  it('highlights the active tab', () => {
    render(
      <TabBar
        tabs={mockTabs}
        activeTab="2"
        onTabSelect={vi.fn()}
        onTabClose={vi.fn()}
      />,
    )

    const activeTab = screen.getByText('styles.css').closest('[class*="bg-background"]')
    expect(activeTab).toBeInTheDocument()
  })

  it('calls onTabSelect when clicking a tab', () => {
    const onTabSelect = vi.fn()
    render(
      <TabBar
        tabs={mockTabs}
        activeTab="1"
        onTabSelect={onTabSelect}
        onTabClose={vi.fn()}
      />,
    )

    fireEvent.click(screen.getByText('styles.css'))
    expect(onTabSelect).toHaveBeenCalledWith('2')
  })

  it('calls onTabClose when clicking close button', () => {
    const onTabClose = vi.fn()
    render(
      <TabBar
        tabs={mockTabs}
        activeTab="1"
        onTabSelect={vi.fn()}
        onTabClose={onTabClose}
      />,
    )

    const closeButtons = screen.getAllByLabelText(/Close/)
    fireEvent.click(closeButtons[0])
    expect(onTabClose).toHaveBeenCalledWith('1')
  })

  it('shows modified indicator for modified tabs', () => {
    const tabsWithModified: Tab[] = [
      { id: '1', name: 'page.tsx', type: 'code', modified: true },
    ]

    const { container } = render(
      <TabBar
        tabs={tabsWithModified}
        activeTab="1"
        onTabSelect={vi.fn()}
        onTabClose={vi.fn()}
      />,
    )

    // The modified indicator is an orange dot with animate-pulse
    const modifiedDot = container.querySelector('.bg-orange-400.animate-pulse')
    expect(modifiedDot).toBeInTheDocument()
  })

  it('renders empty when no tabs', () => {
    const { container } = render(
      <TabBar
        tabs={[]}
        activeTab=""
        onTabSelect={vi.fn()}
        onTabClose={vi.fn()}
      />,
    )

    expect(container.firstChild).toBeEmptyDOMElement()
  })
})
