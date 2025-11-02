import { test, expect } from '@playwright/test'
import {
  setMobileViewport,
  openMobileMenu,
  closeMobileMenu,
  loginAsUser,
  waitForPageLoad,
} from '../helpers/navigation-helpers'

/**
 * モバイルナビゲーションテスト
 * Issue #52 - フロントエンドUI遷移の網羅的E2Eテスト
 * 
 * テスト対象: components/Header.tsx（モバイルビュー）
 */

test.describe('モバイルヘッダーナビゲーション - 基本動作', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
  })

  test('モバイルビューでハンバーガーメニューアイコンが表示される', async ({ page }) => {
    const menuButton = page.locator('button[aria-label="メニュー"]')
    await expect(menuButton).toBeVisible()
  })

  test('ハンバーガーメニューをクリックしてメニューを開く', async ({ page }) => {
    await openMobileMenu(page)
    
    // メニューが展開されることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).toBeVisible()
  })

  test('メニューを開いた後、閉じるボタンが表示される', async ({ page }) => {
    await openMobileMenu(page)
    
    // 閉じるアイコン（X）が表示されることを確認
    const closeIcon = page.locator('button[aria-label="メニュー"]')
    await expect(closeIcon).toBeVisible()
  })

  test('メニューを開いて閉じる', async ({ page }) => {
    await openMobileMenu(page)
    await closeMobileMenu(page)
    
    // メニューが非表示になることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).not.toBeVisible()
  })

  test('メニューのaria-expanded属性が正しく設定される', async ({ page }) => {
    const menuButton = page.locator('button[aria-label="メニュー"]')
    
    // 初期状態はfalse
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
    
    // メニューを開く
    await openMobileMenu(page)
    await expect(menuButton).toHaveAttribute('aria-expanded', 'true')
    
    // メニューを閉じる
    await closeMobileMenu(page)
    await expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})

test.describe('モバイルメニュー - ナビゲーションリンク', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
    await openMobileMenu(page)
  })

  test('Storeリンクが表示される', async ({ page }) => {
    const storeLink = page.locator('[id*="mobile"] a[href="/products"]:has-text("Store")')
    await expect(storeLink).toBeVisible()
  })

  test('Supportリンクが表示される', async ({ page }) => {
    const supportLink = page.locator('[id*="mobile"] a[href="/about"]:has-text("Support")')
    await expect(supportLink).toBeVisible()
  })

  test('Storeリンクをクリックして商品一覧に遷移', async ({ page }) => {
    const storeLink = page.locator('[id*="mobile"] a[href="/products"]:has-text("Store")')
    await storeLink.click()
    
    await expect(page).toHaveURL('/products')
    
    // メニューが自動的に閉じることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).not.toBeVisible()
  })

  test('Supportリンクをクリックして/aboutに遷移', async ({ page }) => {
    const supportLink = page.locator('[id*="mobile"] a[href="/about"]:has-text("Support")')
    await supportLink.click()
    
    await expect(page).toHaveURL('/about')
    
    // メニューが自動的に閉じることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).not.toBeVisible()
  })
})

test.describe('モバイルメニュー - 認証関連', () => {
  test('未認証時: ログインリンクが表示される', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
    await openMobileMenu(page)
    
    const loginLink = page.locator('[id*="mobile"] a[href="/login"]:has-text("ログイン")')
    await expect(loginLink).toBeVisible()
  })

  test('未認証時: ログインリンクでログインページに遷移', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
    await openMobileMenu(page)
    
    const loginLink = page.locator('[id*="mobile"] a[href="/login"]:has-text("ログイン")')
    await loginLink.click()
    
    await expect(page).toHaveURL('/login')
  })

  test('認証済み: サインアウトボタンが表示される', async ({ page }) => {
    await setMobileViewport(page)
    await loginAsUser(page)
    await page.goto('/')
    await waitForPageLoad(page)
    await openMobileMenu(page)
    
    const signOutButton = page.locator('[id*="mobile"] button:has-text("サインアウト")')
    await expect(signOutButton).toBeVisible()
  })

  test('認証済み: サインアウトボタンでログアウト', async ({ page }) => {
    await setMobileViewport(page)
    await loginAsUser(page)
    await page.goto('/')
    await waitForPageLoad(page)
    await openMobileMenu(page)
    
    const signOutButton = page.locator('[id*="mobile"] button:has-text("サインアウト")')
    await signOutButton.click()
    
    // ホームページに戻ることを確認
    await page.waitForURL('/')
    await expect(page).toHaveURL('/')
    
    // メニューが閉じることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).not.toBeVisible()
  })
})

test.describe('モバイルビュー - その他のUI要素', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
  })

  test('ロゴが表示される', async ({ page }) => {
    const logo = page.locator('a[href="/"]:has-text("EC Studio")')
    await expect(logo).toBeVisible()
  })

  test('検索アイコンが表示される', async ({ page }) => {
    const searchButton = page.locator('button[aria-label="サイト内検索"]')
    await expect(searchButton).toBeVisible()
  })

  test('カートアイコンが表示される', async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"][aria-label="カート"]')
    await expect(cartLink).toBeVisible()
  })

  test('検索アイコンをクリックして検索ボックスを開く', async ({ page }) => {
    const searchButton = page.locator('button[aria-label="サイト内検索"]')
    await searchButton.click()
    
    // 検索ボックスが表示されることを確認
    await expect(page.locator('input#global-search')).toBeVisible()
  })

  test('カートアイコンをクリックしてカートページに遷移', async ({ page }) => {
    const cartLink = page.locator('a[href="/cart"][aria-label="カート"]')
    await cartLink.click()
    
    await expect(page).toHaveURL('/cart')
  })
})

test.describe('モバイルビュー - レスポンシブ動作', () => {
  test('デスクトップビューではハンバーガーメニューが非表示', async ({ page }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await waitForPageLoad(page)
    
    const menuButton = page.locator('button[aria-label="メニュー"]')
    
    // ハンバーガーメニューが非表示（md:hidden）
    await expect(menuButton).not.toBeVisible()
  })

  test('デスクトップビューではナビゲーションリンクが直接表示される', async ({ page }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto('/')
    await waitForPageLoad(page)
    
    // デスクトップ用のナビゲーションリンクが表示される
    const desktopNav = page.locator('div.hidden.md\\:flex')
    await expect(desktopNav).toBeVisible()
  })

  test('モバイルからデスクトップにリサイズするとメニューが閉じる', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
    
    // メニューを開く
    await openMobileMenu(page)
    
    // デスクトップサイズに変更
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(300)
    
    // モバイルメニューが非表示になることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).not.toBeVisible()
  })
})

test.describe('モバイルビュー - タッチ操作', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
  })

  test('メニューボタンをタップして開閉', async ({ page }) => {
    const menuButton = page.locator('button[aria-label="メニュー"]')
    
    // タップして開く
    await menuButton.tap()
    await page.waitForTimeout(300)
    
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).toBeVisible()
    
    // タップして閉じる
    await menuButton.tap()
    await page.waitForTimeout(300)
    
    await expect(mobileMenu).not.toBeVisible()
  })

  test('メニュー外をタップしても閉じない（意図的な動作）', async ({ page }) => {
    await openMobileMenu(page)
    
    // メニュー外の領域をタップ
    await page.tap('body', { position: { x: 10, y: 10 } })
    await page.waitForTimeout(300)
    
    // メニューは開いたまま（ハンバーガーメニューは通常クリックで閉じる）
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).toBeVisible()
  })
})

test.describe('モバイルビュー - アクセシビリティ', () => {
  test.beforeEach(async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
  })

  test('メニューボタンにaria-labelが設定されている', async ({ page }) => {
    const menuButton = page.locator('button[aria-label="メニュー"]')
    await expect(menuButton).toHaveAttribute('aria-label', 'メニュー')
  })

  test('メニューボタンにaria-controlsが設定されている', async ({ page }) => {
    const menuButton = page.locator('button[aria-label="メニュー"]')
    const ariaControls = await menuButton.getAttribute('aria-controls')
    
    // aria-controlsが設定されていることを確認
    expect(ariaControls).toBeTruthy()
  })

  test('メニューボタンにaria-expandedが設定されている', async ({ page }) => {
    const menuButton = page.locator('button[aria-label="メニュー"]')
    
    // aria-expanded属性が存在することを確認
    const ariaExpanded = await menuButton.getAttribute('aria-expanded')
    expect(ariaExpanded).toBeTruthy()
  })

  test('モバイルメニューにIDが設定されている', async ({ page }) => {
    await openMobileMenu(page)
    
    const mobileMenu = page.locator('[id*="mobile"]')
    const menuId = await mobileMenu.getAttribute('id')
    
    // IDが設定されていることを確認
    expect(menuId).toBeTruthy()
  })
})

test.describe('モバイルビュー - パフォーマンス', () => {
  test('メニューの開閉がスムーズに動作する', async ({ page }) => {
    await setMobileViewport(page)
    await page.goto('/')
    await waitForPageLoad(page)
    
    const menuButton = page.locator('button[aria-label="メニュー"]')
    
    // 複数回開閉してもエラーが発生しないことを確認
    for (let i = 0; i < 3; i++) {
      await menuButton.click()
      await page.waitForTimeout(100)
      await menuButton.click()
      await page.waitForTimeout(100)
    }
    
    // 最終的にメニューが閉じていることを確認
    const mobileMenu = page.locator('[id*="mobile"]')
    await expect(mobileMenu).not.toBeVisible()
  })
})

