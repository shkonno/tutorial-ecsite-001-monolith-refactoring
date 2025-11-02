import { Page, expect } from '@playwright/test'

/**
 * ナビゲーションテスト用の共通ヘルパー関数
 */

/**
 * 管理者ユーザーでログイン
 */
export async function loginAsAdmin(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'admin@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  // ログイン完了を待つ
  await page.waitForURL('/')
}

/**
 * 一般ユーザーでログイン
 */
export async function loginAsUser(page: Page) {
  await page.goto('/login')
  await page.fill('input[type="email"]', 'user@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')
  // ログイン完了を待つ
  await page.waitForURL('/')
}

/**
 * ログアウト
 */
export async function logout(page: Page) {
  // デスクトップビューでサインアウトボタンをクリック
  const signOutButton = page.locator('button:has-text("サインアウト")')
  if (await signOutButton.isVisible()) {
    await signOutButton.click()
    await page.waitForURL('/')
  }
}

/**
 * リンクのクリックと遷移確認
 */
export async function clickAndVerifyNavigation(
  page: Page,
  selector: string,
  expectedUrl: string | RegExp,
  options?: { exact?: boolean }
) {
  await page.click(selector)
  if (typeof expectedUrl === 'string') {
    if (options?.exact) {
      await expect(page).toHaveURL(expectedUrl)
    } else {
      await expect(page).toHaveURL(new RegExp(expectedUrl))
    }
  } else {
    await expect(page).toHaveURL(expectedUrl)
  }
}

/**
 * モバイルビューポートに切り替え
 */
export async function setMobileViewport(page: Page) {
  await page.setViewportSize({ width: 375, height: 667 })
}

/**
 * デスクトップビューポートに切り替え
 */
export async function setDesktopViewport(page: Page) {
  await page.setViewportSize({ width: 1920, height: 1080 })
}

/**
 * モバイルメニューを開く
 */
export async function openMobileMenu(page: Page) {
  const menuButton = page.locator('button[aria-label="メニュー"]')
  await menuButton.click()
  // メニューが開くのを待つ
  await page.waitForTimeout(300)
}

/**
 * モバイルメニューを閉じる
 */
export async function closeMobileMenu(page: Page) {
  const menuButton = page.locator('button[aria-label="メニュー"]')
  await menuButton.click()
  // メニューが閉じるのを待つ
  await page.waitForTimeout(300)
}

/**
 * 検索ボックスを開く
 */
export async function openSearchBox(page: Page) {
  const searchButton = page.locator('button[aria-label="サイト内検索"]')
  await searchButton.click()
  // 検索ボックスが開くのを待つ
  await expect(page.locator('input#global-search')).toBeVisible()
}

/**
 * 検索ボックスを閉じる（ESCキー）
 */
export async function closeSearchBox(page: Page) {
  await page.keyboard.press('Escape')
  // 検索ボックスが閉じるのを待つ
  await expect(page.locator('input#global-search')).not.toBeVisible()
}

/**
 * 全リンクのステータスコードを確認
 */
export async function verifyAllLinksStatus(page: Page) {
  const links = await page.$$eval('a[href]', (links) =>
    links
      .map((link) => link.getAttribute('href'))
      .filter((href) => href && href.startsWith('/'))
  )

  const results: { url: string; status: number }[] = []

  for (const link of links) {
    try {
      const response = await page.goto(link!)
      const status = response?.status() || 0
      results.push({ url: link!, status })
      
      // 400以上のステータスコードはエラー
      if (status >= 400) {
        console.error(`❌ リンク切れ: ${link} (ステータス: ${status})`)
      }
    } catch (error) {
      console.error(`❌ リンクエラー: ${link}`, error)
      results.push({ url: link!, status: 0 })
    }
  }

  return results
}

/**
 * ページが正常に読み込まれたことを確認
 */
export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
  await page.waitForLoadState('domcontentloaded')
}

/**
 * 特定の要素が表示されるまで待つ
 */
export async function waitForElement(page: Page, selector: string) {
  await page.waitForSelector(selector, { state: 'visible' })
}

/**
 * カートに商品を追加（テスト用）
 */
export async function addProductToCart(page: Page, productId: string = '1') {
  await page.goto(`/products`)
  // 最初の商品カードをクリック
  const productCard = page.locator('article, .product-card').first()
  await productCard.click()
  
  // カートに追加ボタンをクリック
  const addToCartButton = page.locator('button:has-text("カートに追加"), button:has-text("Add to Cart")')
  if (await addToCartButton.isVisible()) {
    await addToCartButton.click()
    // カート追加完了を待つ
    await page.waitForTimeout(500)
  }
}

/**
 * テストデータのクリーンアップ（必要に応じて実装）
 */
export async function cleanupTestData(page: Page) {
  // カートをクリア
  await page.goto('/cart')
  const deleteButtons = page.locator('button:has-text("削除"), button:has-text("Delete")')
  const count = await deleteButtons.count()
  for (let i = 0; i < count; i++) {
    await deleteButtons.first().click()
    await page.waitForTimeout(300)
  }
}

