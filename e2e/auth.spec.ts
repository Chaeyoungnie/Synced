import { test, expect } from '@playwright/test'

test.describe('Auth Pages', () => {
  test.describe('Sign Up', () => {
    test('loads the sign-up page', async ({ page }) => {
      await page.goto('/auth/sign-up')
      await expect(page.getByText('Create your account')).toBeVisible()
    })

    test('displays email and password fields', async ({ page }) => {
      await page.goto('/auth/sign-up')
      await expect(page.getByPlaceholder('name@example.com')).toBeVisible()
      await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    })

    test('displays full name field', async ({ page }) => {
      await page.goto('/auth/sign-up')
      await expect(page.getByPlaceholder('John Doe')).toBeVisible()
    })

    test('has OAuth buttons', async ({ page }) => {
      await page.goto('/auth/sign-up')
      await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
    })

    test('has link to sign-in', async ({ page }) => {
      await page.goto('/auth/sign-up')
      await expect(page.getByText('Sign in')).toBeVisible()
    })

    test('navigates to sign-in page', async ({ page }) => {
      await page.goto('/auth/sign-up')
      await page.getByText('Sign in').click()
      await page.waitForURL(/\/auth\/sign-in/)
    })
  })

  test.describe('Sign In', () => {
    test('loads the sign-in page', async ({ page }) => {
      await page.goto('/auth/sign-in')
      await expect(page.getByText('Welcome back')).toBeVisible()
    })

    test('displays email and password fields', async ({ page }) => {
      await page.goto('/auth/sign-in')
      await expect(page.getByPlaceholder('name@example.com')).toBeVisible()
      await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    })

    test('has OAuth buttons', async ({ page }) => {
      await page.goto('/auth/sign-in')
      await expect(page.getByRole('button', { name: /Continue with GitHub/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /Continue with Google/i })).toBeVisible()
    })

    test('has link to sign-up', async ({ page }) => {
      await page.goto('/auth/sign-in')
      await expect(page.getByText('Sign up')).toBeVisible()
    })

    test('navigates to sign-up page', async ({ page }) => {
      await page.goto('/auth/sign-in')
      await page.getByText('Sign up').click()
      await page.waitForURL(/\/auth\/sign-up/)
    })
  })
})
