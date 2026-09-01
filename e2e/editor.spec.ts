import { test, expect } from '@playwright/test'

test.describe('Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/editor')
    await page.waitForLoadState('networkidle')
  })

  test('loads the editor page', async ({ page }) => {
    await expect(page.getByText('Collaborative Editor')).toBeVisible()
  })

  test('displays the sidebar with file tree', async ({ page }) => {
    await expect(page.getByText('page.tsx')).toBeVisible()
    await expect(page.getByText('editor-shell.tsx')).toBeVisible()
    await expect(page.getByText('globals.css')).toBeVisible()
  })

  test('displays the code editor', async ({ page }) => {
    await expect(page.getByText('import')).toBeVisible()
    await expect(page.getByText('EditorShell')).toBeVisible()
  })

  test('displays the collaboration panel', async ({ page }) => {
    await expect(page.getByText('Collaboration')).toBeVisible()
    await expect(page.getByText('PEOPLE')).toBeVisible()
  })

  test('opens command palette on Ctrl+K', async ({ page }) => {
    await page.keyboard.press('Control+k')
    await expect(page.getByPlaceholder('Type a command...')).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('opens file search on Ctrl+P', async ({ page }) => {
    await page.keyboard.press('Control+p')
    await expect(page.getByPlaceholder('Search files by name...')).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('opens keybindings modal on Ctrl+Shift+P', async ({ page }) => {
    await page.keyboard.press('Control+Shift+p')
    await expect(page.getByText('Keyboard Shortcuts')).toBeVisible()
    await page.keyboard.press('Escape')
  })

  test('can click on a file in sidebar to open it', async ({ page }) => {
    await page.getByText('editor-shell.tsx').first().click()
    await expect(page.getByText('editor-shell.tsx').nth(1)).toBeVisible()
  })

  test('displays the status bar', async ({ page }) => {
    await expect(page.getByText('Ready')).toBeVisible()
    await expect(page.getByText('TypeScript')).toBeVisible()
    await expect(page.getByText('UTF-8')).toBeVisible()
  })

  test('displays the demo mode banner', async ({ page }) => {
    await expect(page.getByText('Free personal sample')).toBeVisible()
  })

  test('can toggle the sidebar', async ({ page }) => {
    const collapseBtn = page.getByLabel('Collapse sidebar').first()
    await collapseBtn.click()
    // Sidebar should collapse
    await expect(page.getByLabel('Expand sidebar').first()).toBeVisible()
  })

  test('displays the header with all buttons', async ({ page }) => {
    await expect(page.getByText('Saved')).toBeVisible()
    await expect(page.getByRole('button', { name: /Invite/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Share/i })).toBeVisible()
  })
})
