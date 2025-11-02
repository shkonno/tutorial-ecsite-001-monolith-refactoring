import { test, expect } from '@playwright/test'
import { clickAndVerifyNavigation, waitForPageLoad } from '../helpers/navigation-helpers'

/**
 * 認証ページ遷移テスト
 * Issue #52 - フロントエンドUI遷移の網羅的E2Eテスト
 * 
 * テスト対象:
 * - app/(auth)/login/page.tsx
 * - app/(auth)/register/page.tsx
 */

test.describe('ログインページ - UI要素とナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await waitForPageLoad(page)
  })

  test('ログインページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h2:has-text("アカウントにログイン")')).toBeVisible()
  })

  test('メールアドレス入力欄が表示される', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]#email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', 'メールアドレス')
  })

  test('パスワード入力欄が表示される', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]#password')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveAttribute('placeholder', 'パスワード')
  })

  test('ログインボタンが表示される', async ({ page }) => {
    const loginButton = page.locator('button[type="submit"]:has-text("ログイン")')
    await expect(loginButton).toBeVisible()
    await expect(loginButton).toBeEnabled()
  })

  test('「新規アカウントを作成」リンクで登録ページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(
      page,
      'a[href="/register"]:has-text("新規アカウントを作成")',
      '/register',
      { exact: true }
    )
  })

  test('「ログイン状態を保持」チェックボックスが表示される', async ({ page }) => {
    const rememberCheckbox = page.locator('input[type="checkbox"]#remember-me')
    await expect(rememberCheckbox).toBeVisible()
  })

  test('「パスワードをお忘れですか？」リンクが表示される', async ({ page }) => {
    const forgotPasswordLink = page.locator('a:has-text("パスワードをお忘れですか？")')
    await expect(forgotPasswordLink).toBeVisible()
  })

  test('テスト用アカウント情報が表示される', async ({ page }) => {
    await expect(page.locator('text=管理者: admin@example.com')).toBeVisible()
    await expect(page.locator('text=一般ユーザー: user@example.com')).toBeVisible()
  })
})

test.describe('ログインページ - フォーム送信', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await waitForPageLoad(page)
  })

  test('有効な認証情報でログイン成功', async ({ page }) => {
    await page.fill('input[type="email"]#email', 'user@example.com')
    await page.fill('input[type="password"]#password', 'password123')
    await page.click('button[type="submit"]')
    
    // ホームページにリダイレクトされることを確認
    await page.waitForURL('/', { timeout: 10000 })
    await expect(page).toHaveURL('/')
  })

  test('無効な認証情報でログイン失敗', async ({ page }) => {
    await page.fill('input[type="email"]#email', 'invalid@example.com')
    await page.fill('input[type="password"]#password', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.bg-red-50')).toBeVisible()
  })

  test('空のフォームは送信できない（HTML5バリデーション）', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]#email')
    const passwordInput = page.locator('input[type="password"]#password')
    
    // required属性が設定されていることを確認
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })
})

test.describe('登録ページ - UI要素とナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await waitForPageLoad(page)
  })

  test('登録ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h2:has-text("新規アカウント作成")')).toBeVisible()
  })

  test('名前入力欄が表示される', async ({ page }) => {
    const nameInput = page.locator('input[type="text"]#name')
    await expect(nameInput).toBeVisible()
    await expect(nameInput).toHaveAttribute('placeholder', '名前')
  })

  test('メールアドレス入力欄が表示される', async ({ page }) => {
    const emailInput = page.locator('input[type="email"]#email')
    await expect(emailInput).toBeVisible()
    await expect(emailInput).toHaveAttribute('placeholder', 'メールアドレス')
  })

  test('パスワード入力欄が表示される', async ({ page }) => {
    const passwordInput = page.locator('input[type="password"]#password')
    await expect(passwordInput).toBeVisible()
    await expect(passwordInput).toHaveAttribute('placeholder', 'パスワード（6文字以上）')
  })

  test('パスワード確認入力欄が表示される', async ({ page }) => {
    const confirmPasswordInput = page.locator('input[type="password"]#confirm-password')
    await expect(confirmPasswordInput).toBeVisible()
    await expect(confirmPasswordInput).toHaveAttribute('placeholder', 'パスワード（確認）')
  })

  test('アカウント作成ボタンが表示される', async ({ page }) => {
    const registerButton = page.locator('button[type="submit"]:has-text("アカウント作成")')
    await expect(registerButton).toBeVisible()
    await expect(registerButton).toBeEnabled()
  })

  test('「既存のアカウントでログイン」リンクでログインページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(
      page,
      'a[href="/login"]:has-text("既存のアカウントでログイン")',
      '/login',
      { exact: true }
    )
  })

  test('利用規約リンクが表示される', async ({ page }) => {
    const termsLink = page.locator('a[href="/terms"]:has-text("利用規約")')
    await expect(termsLink).toBeVisible()
  })

  test('プライバシーポリシーリンクが表示される', async ({ page }) => {
    const privacyLink = page.locator('a[href="/privacy"]:has-text("プライバシーポリシー")')
    await expect(privacyLink).toBeVisible()
  })
})

test.describe('登録ページ - フォームバリデーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register')
    await waitForPageLoad(page)
  })

  test('パスワードが一致しない場合エラー表示', async ({ page }) => {
    await page.fill('input#name', 'Test User')
    await page.fill('input#email', 'test@example.com')
    await page.fill('input#password', 'password123')
    await page.fill('input#confirm-password', 'different123')
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=パスワードが一致しません')).toBeVisible()
  })

  test('パスワードが6文字未満の場合エラー表示', async ({ page }) => {
    await page.fill('input#name', 'Test User')
    await page.fill('input#email', 'test@example.com')
    await page.fill('input#password', '12345')
    await page.fill('input#confirm-password', '12345')
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('text=パスワードは6文字以上である必要があります')).toBeVisible()
  })

  test('必須フィールドが空の場合は送信できない', async ({ page }) => {
    const nameInput = page.locator('input#name')
    const emailInput = page.locator('input#email')
    const passwordInput = page.locator('input#password')
    const confirmPasswordInput = page.locator('input#confirm-password')
    
    // required属性が設定されていることを確認
    await expect(nameInput).toHaveAttribute('required')
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
    await expect(confirmPasswordInput).toHaveAttribute('required')
  })
})

test.describe('認証ページ - アクセシビリティ', () => {
  test('ログインページ: フォーム要素にラベルが設定されている', async ({ page }) => {
    await page.goto('/login')
    await waitForPageLoad(page)
    
    // スクリーンリーダー用のラベルが設定されていることを確認
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('label[for="password"]')).toBeVisible()
  })

  test('登録ページ: フォーム要素にラベルが設定されている', async ({ page }) => {
    await page.goto('/register')
    await waitForPageLoad(page)
    
    // スクリーンリーダー用のラベルが設定されていることを確認
    await expect(page.locator('label[for="name"]')).toBeVisible()
    await expect(page.locator('label[for="email"]')).toBeVisible()
    await expect(page.locator('label[for="password"]')).toBeVisible()
    await expect(page.locator('label[for="confirm-password"]')).toBeVisible()
  })
})

test.describe('認証ページ - エラーケース', () => {
  test('ログイン: ネットワークエラー時の挙動', async ({ page }) => {
    await page.goto('/login')
    await waitForPageLoad(page)
    
    // ネットワークをオフラインにする
    await page.context().setOffline(true)
    
    await page.fill('input[type="email"]#email', 'user@example.com')
    await page.fill('input[type="password"]#password', 'password123')
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認
    await expect(page.locator('.bg-red-50')).toBeVisible()
    
    // ネットワークを復旧
    await page.context().setOffline(false)
  })
})

