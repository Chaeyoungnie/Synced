import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('loads the landing page', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Codebase/)
  })

  test('displays the hero section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Build in the')).toBeVisible()
    await expect(page.getByText('same direction.')).toBeVisible()
  })

  test('has navigation links', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Synced')).toBeVisible()
  })

  test('has CTA buttons', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /Open the workspace/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Get started/i })).toBeVisible()
  })

  test('navigates to editor on CTA click', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /Open the workspace/i }).first().click()
    await page.waitForURL(/\/editor/)
    await expect(page.getByText('Collaborative Editor')).toBeVisible()
  })

  test('displays pricing section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Start free.')).toBeVisible()
    await expect(page.getByText('Personal')).toBeVisible()
    await expect(page.getByText('Team')).toBeVisible()
  })

  test('displays FAQ section', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Good questions')).toBeVisible()
  })
})
