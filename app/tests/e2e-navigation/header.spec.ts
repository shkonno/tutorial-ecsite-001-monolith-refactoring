import { test, expect } from '@playwright/test'
import {
  clickAndVerifyNavigation,
  openSearchBox,
  closeSearchBox,
  loginAsUser,
  logout,
  waitForPageLoad,
} from '../helpers/navigation-helpers'

/**
 * ヘッダーナビゲーションテスト
 * Issue #52 - フロントエンドUI遷移の網羅的E2Eテスト
 * 
 * テスト対象: components/Header.tsx
 */

test.describe('ヘッダーナビゲーション - デスクトップビュー', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)
  })

  test('ロゴクリックでホームページに遷移', async ({ page }) => {
    // 別のページに移動
    await page.goto('/products')
    
    // ロゴをクリック
    await page.click('a[href="/"]')
    
    // ホームページに遷移したことを確認
    await expect(page).toHaveURL('/')
  })

  test('Storeリンクで商品一覧に遷移', async ({ page }) => {
    await clickAndVerifyNavigation(page, 'a[href="/products"]:has-text("Store")', '/products', {
      exact: true,
    })
  })

  test('Supportリンクで/aboutに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(page, 'a[href="/about"]:has-text("Support")', '/about', {
      exact: true,
    })
  })

  test('検索アイコンクリックで検索ボックス表示', async ({ page }) => {
    await openSearchBox(page)
    
    // 検索ボックスが表示されることを確認
    await expect(page.locator('input#global-search')).toBeVisible()
    await expect(page.locator('input#global-search')).toBeFocused()
  })

  test('検索ボックスをESCキーで閉じる', async ({ page }) => {
    await openSearchBox(page)
    await closeSearchBox(page)
    
    // 検索ボックスが非表示になることを確認
    await expect(page.locator('input#global-search')).not.toBeVisible()
  })

  test('カートアイコンでカートページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(page, 'a[href="/cart"][aria-label="カート"]', '/cart', {
      exact: true,
    })
  })

  test('未認証時: ログインリンクが表示される', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]:has-text("ログイン")')
    await expect(loginLink).toBeVisible()
  })

  test('未認証時: ログインリンクでログインページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(
      page,
      'a[href="/login"]:has-text("ログイン")',
      '/login',
      { exact: true }
    )
  })

  test('認証済み: サインアウトボタンが表示される', async ({ page }) => {
    await loginAsUser(page)
    
    const signOutButton = page.locator('button:has-text("サインアウト")')
    await expect(signOutButton).toBeVisible()
  })

  test('認証済み: サインアウトボタンでログアウト', async ({ page }) => {
    await loginAsUser(page)
    
    await logout(page)
    
    // ホームページに戻り、ログインリンクが表示されることを確認
    await expect(page).toHaveURL('/')
    await expect(page.locator('a[href="/login"]:has-text("ログイン")')).toBeVisible()
  })
})

test.describe('ヘッダーナビゲーション - スクロール時の挙動', () => {
  test('スクロール時にヘッダーのスタイルが変わる', async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)
    
    const header = page.locator('header#top')
    
    // 初期状態のクラスを確認
    const initialClass = await header.getAttribute('class')
    
    // ページをスクロール
    await page.evaluate(() => window.scrollTo(0, 100))
    await page.waitForTimeout(300)
    
    // スクロール後のクラスを確認
    const scrolledClass = await header.getAttribute('class')
    
    // クラスが変更されていることを確認（shadow が追加される）
    expect(scrolledClass).not.toBe(initialClass)
  })
})

test.describe('ヘッダーナビゲーション - アクセシビリティ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await waitForPageLoad(page)
  })

  test('ナビゲーションにaria-labelが設定されている', async ({ page }) => {
    const nav = page.locator('nav[aria-label="メインナビゲーション"]')
    await expect(nav).toBeVisible()
  })

  test('ロゴにaria-labelが設定されている', async ({ page }) => {
    const logo = page.locator('a[aria-label="ホームへ移動"]')
    await expect(logo).toBeVisible()
  })

  test('検索ボタンにaria-labelが設定されている', async ({ page }) => {
    const searchButton = page.locator('button[aria-label="サイト内検索"]')
    await expect(searchButton).toBeVisible()
  })

  test('カートリンクにaria-labelが設定されている', async ({ page }) => {
    const cartLink = page.locator('a[aria-label="カート"]')
    await expect(cartLink).toBeVisible()
  })

  test('検索ボックスにaria-expanded属性が設定されている', async ({ page }) => {
    const searchButton = page.locator('button[aria-label="サイト内検索"]')
    
    // 初期状態はfalse
    await expect(searchButton).toHaveAttribute('aria-expanded', 'false')
    
    // 開いた状態はtrue
    await openSearchBox(page)
    await expect(searchButton).toHaveAttribute('aria-expanded', 'true')
  })
})

test.describe('ヘッダーナビゲーション - エラーケース', () => {
  test('存在しないページへのリンクは404になる', async ({ page }) => {
    const response = await page.goto('/non-existent-page')
    expect(response?.status()).toBe(404)
  })
})

