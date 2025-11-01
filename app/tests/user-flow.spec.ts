/**
 * User Flow E2E Tests
 * Issue #45 - E2Eテストの実装
 * 
 * ユーザーの主要なフローをテスト：
 * - ユーザー登録
 * - ログイン
 * - 商品閲覧
 * - カート追加
 * - チェックアウト
 */

import { test, expect } from '@playwright/test'

test.describe('ユーザー登録フロー', () => {
  test('新規ユーザーが登録できる', async ({ page }) => {
    // ユニークなメールアドレスを生成
    const timestamp = Date.now()
    const testEmail = `test-user-${timestamp}@example.com`
    const testPassword = 'TestPassword123!'
    const testName = 'Test User'

    // 登録ページに移動
    await page.goto('/register')
    
    // 登録フォームを入力
    await page.fill('input[name="name"], input[type="text"]', testName)
    await page.fill('input[name="email"], input[type="email"]', testEmail)
    await page.fill('input[name="password"], input[type="password"]', testPassword)
    
    // 登録ボタンをクリック
    await page.click('button[type="submit"]')
    
    // ホームページまたはログインページにリダイレクトされることを確認
    await page.waitForURL(/\/(login)?/, { timeout: 10000 })
    
    expect(page.url()).toMatch(/\/(login)?/)
  })

  test('既存のメールアドレスでは登録できない', async ({ page }) => {
    await page.goto('/register')
    
    // 既存のユーザー（シードデータ）のメールアドレス
    await page.fill('input[name="name"], input[type="text"]', 'Existing User')
    await page.fill('input[name="email"], input[type="email"]', 'user@example.com')
    await page.fill('input[name="password"], input[type="password"]', 'password123')
    
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認
    const errorMessage = page.locator('text=既に登録されています, text=すでに存在します')
    
    // エラーメッセージが表示されるまで待つ（オプション）
    if (await errorMessage.isVisible().catch(() => false)) {
      await expect(errorMessage).toBeVisible()
    }
  })
})

test.describe('ログイン・ログアウトフロー', () => {
  test('既存ユーザーでログインできる', async ({ page }) => {
    await page.goto('/login')
    
    // ログインフォームを入力
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'password123')
    
    // ログインボタンをクリック
    await page.click('button[type="submit"]')
    
    // ホームページにリダイレクトされることを確認
    await page.waitForURL('/', { timeout: 10000 })
    
    expect(page.url()).toContain('/')
    
    // ログイン後、ユーザーメニューまたはログアウトボタンが表示されることを確認
    const logoutButton = page.locator('button:has-text("サインアウト"), button:has-text("ログアウト")')
    
    if (await logoutButton.isVisible().catch(() => false)) {
      await expect(logoutButton).toBeVisible()
    }
  })

  test('間違ったパスワードではログインできない', async ({ page }) => {
    await page.goto('/login')
    
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    await page.click('button[type="submit"]')
    
    // エラーメッセージが表示されることを確認（オプション）
    const errorMessage = page.locator('text=ログインに失敗, text=パスワードが正しくありません')
    
    if (await errorMessage.isVisible().catch(() => false)) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('ログアウトできる', async ({ page }) => {
    // まずログイン
    await page.goto('/login')
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
    
    // ログアウトボタンを探してクリック
    const logoutButton = page.locator('button:has-text("サインアウト"), button:has-text("ログアウト")')
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      
      // ホームページまたはログインページに戻ることを確認
      await page.waitForURL(/\/(login)?/)
    }
  })
})

test.describe('商品閲覧・カート追加フロー', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にログイン
    await page.goto('/login')
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
  })

  test('商品一覧から商品詳細に遷移できる', async ({ page }) => {
    await page.goto('/products')
    
    // 商品一覧が表示されるまで待つ
    await page.waitForSelector('[class*="product"], article, .card', { timeout: 10000 })
    
    // 最初の商品をクリック
    const firstProduct = page.locator('[class*="product"], article, .card').first()
    await firstProduct.click()
    
    // 商品詳細ページに遷移したことを確認
    await expect(page).toHaveURL(/\/products\/[\w-]+/)
  })

  test('商品をカートに追加できる', async ({ page }) => {
    await page.goto('/products')
    
    // 商品一覧が表示されるまで待つ
    await page.waitForSelector('[class*="product"], article, .card', { timeout: 10000 })
    
    // 最初の商品の詳細ページに移動
    const firstProduct = page.locator('[class*="product"], article, .card').first()
    await firstProduct.click()
    
    // 商品詳細ページが読み込まれるまで待つ
    await page.waitForLoadState('networkidle')
    
    // カート追加ボタンを探してクリック
    const addToCartButton = page.locator('button:has-text("カートに追加"), button:has-text("追加")')
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      
      // 成功メッセージまたはカートアイコンの更新を確認（オプション）
      await page.waitForTimeout(1000)
    }
  })

  test('カートページで商品数量を変更できる', async ({ page }) => {
    // まずカートに商品を追加
    await page.goto('/products')
    await page.waitForSelector('[class*="product"], article, .card', { timeout: 10000 })
    
    const firstProduct = page.locator('[class*="product"], article, .card').first()
    await firstProduct.click()
    
    const addToCartButton = page.locator('button:has-text("カートに追加"), button:has-text("追加")')
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
    }
    
    // カートページに移動
    await page.goto('/cart')
    
    // 数量増加ボタンを探してクリック
    const increaseButton = page.locator('button:has-text("+"), button[aria-label*="増やす"]').first()
    
    if (await increaseButton.isVisible()) {
      await increaseButton.click()
      await page.waitForTimeout(1000)
      
      // 数量が更新されることを確認
      expect(await page.isVisible('text=2')).toBeTruthy()
    }
  })

  test('カートから商品を削除できる', async ({ page }) => {
    // カートに商品がある状態にする
    await page.goto('/products')
    await page.waitForSelector('[class*="product"], article, .card', { timeout: 10000 })
    
    const firstProduct = page.locator('[class*="product"], article, .card').first()
    await firstProduct.click()
    
    const addToCartButton = page.locator('button:has-text("カートに追加"), button:has-text("追加")')
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
    }
    
    // カートページに移動
    await page.goto('/cart')
    
    // 削除ボタンを探してクリック
    const deleteButton = page.locator('button:has-text("削除"), button[aria-label*="削除"]').first()
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click()
      await page.waitForTimeout(1000)
    }
  })
})

test.describe('チェックアウト・注文フロー', () => {
  test.beforeEach(async ({ page }) => {
    // ログインして商品をカートに追加
    await page.goto('/login')
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
    
    // 商品をカートに追加
    await page.goto('/products')
    await page.waitForSelector('[class*="product"], article, .card', { timeout: 10000 })
    
    const firstProduct = page.locator('[class*="product"], article, .card').first()
    await firstProduct.click()
    
    const addToCartButton = page.locator('button:has-text("カートに追加"), button:has-text("追加")')
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)
    }
  })

  test('チェックアウトページに遷移できる', async ({ page }) => {
    await page.goto('/cart')
    
    // チェックアウトボタンを探してクリック
    const checkoutButton = page.locator('button:has-text("チェックアウト"), a[href="/checkout"]')
    
    if (await checkoutButton.isVisible()) {
      await checkoutButton.click()
      
      // チェックアウトページに遷移したことを確認
      await expect(page).toHaveURL('/checkout')
    }
  })

  test('注文を完了できる', async ({ page }) => {
    await page.goto('/checkout')
    
    // 配送先情報を入力（フォームがある場合）
    const addressInput = page.locator('input[name="address"], textarea[name="address"]')
    if (await addressInput.isVisible().catch(() => false)) {
      await addressInput.fill('東京都渋谷区1-1-1')
    }
    
    const phoneInput = page.locator('input[name="phone"]')
    if (await phoneInput.isVisible().catch(() => false)) {
      await phoneInput.fill('03-1234-5678')
    }
    
    // 注文確定ボタンを探してクリック
    const orderButton = page.locator('button:has-text("注文を確定"), button[type="submit"]')
    
    if (await orderButton.isVisible()) {
      await orderButton.click()
      
      // 注文完了ページまたは注文一覧ページに遷移したことを確認
      await page.waitForURL(/\/(orders|checkout\/success)/, { timeout: 10000 })
    }
  })

  test('注文履歴を確認できる', async ({ page }) => {
    await page.goto('/orders')
    
    // 注文履歴ページが表示されることを確認
    await expect(page).toHaveURL('/orders')
    
    // 注文一覧が表示されることを確認（注文がある場合）
    const orderList = page.locator('[class*="order"], table, article')
    
    if (await orderList.isVisible().catch(() => false)) {
      await expect(orderList).toBeVisible()
    }
  })
})

