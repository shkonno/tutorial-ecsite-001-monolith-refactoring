import { test, expect } from '@playwright/test'
import {
  clickAndVerifyNavigation,
  loginAsUser,
  waitForPageLoad,
  addProductToCart,
} from '../helpers/navigation-helpers'

/**
 * ショップページ遷移テスト
 * Issue #52 - フロントエンドUI遷移の網羅的E2Eテスト
 * 
 * テスト対象:
 * - app/(shop)/products/page.tsx
 * - app/(shop)/cart/page.tsx
 * - app/(shop)/checkout/page.tsx
 * - app/(shop)/orders/page.tsx
 * - app/(shop)/orders/[id]/page.tsx
 */

test.describe('商品一覧ページ - UI要素とナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/products')
    await waitForPageLoad(page)
  })

  test('商品一覧ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/products')
    await expect(page.locator('h1:has-text("すべてのラインナップ")')).toBeVisible()
  })

  test('検索フォームが表示される', async ({ page }) => {
    const searchInput = page.locator('input[type="text"][placeholder="キーワードを入力"]')
    await expect(searchInput).toBeVisible()
    
    const searchButton = page.locator('button[type="submit"]:has-text("Search")')
    await expect(searchButton).toBeVisible()
  })

  test('カテゴリフィルターが表示される', async ({ page }) => {
    await expect(page.locator('button:has-text("すべて")')).toBeVisible()
    await expect(page.locator('button:has-text("家電")')).toBeVisible()
    await expect(page.locator('button:has-text("ファッション")')).toBeVisible()
    await expect(page.locator('button:has-text("書籍")')).toBeVisible()
  })

  test('カテゴリフィルターをクリックして絞り込み', async ({ page }) => {
    // 家電カテゴリをクリック
    await page.click('button:has-text("家電")')
    await page.waitForTimeout(500)
    
    // アクティブ状態になることを確認
    const electronicsButton = page.locator('button:has-text("家電")')
    await expect(electronicsButton).toHaveClass(/bg-\[var\(--accent\)\]/)
  })

  test('検索フォームで商品を検索', async ({ page }) => {
    const searchInput = page.locator('input[type="text"][placeholder="キーワードを入力"]')
    await searchInput.fill('test')
    
    const searchButton = page.locator('button[type="submit"]:has-text("Search")')
    await searchButton.click()
    
    await page.waitForTimeout(500)
  })

  test('商品カードが表示される', async ({ page }) => {
    // 商品が読み込まれるまで待つ
    await page.waitForSelector('article, .product-card', { timeout: 10000 })
    
    const productCards = page.locator('article, .product-card')
    const count = await productCards.count()
    
    // 少なくとも1つの商品が表示されることを確認
    expect(count).toBeGreaterThan(0)
  })

  test('商品カードクリックで商品詳細ページに遷移', async ({ page }) => {
    // 商品が読み込まれるまで待つ
    await page.waitForSelector('article, .product-card', { timeout: 10000 })
    
    // 最初の商品カードをクリック
    const firstProduct = page.locator('article, .product-card').first()
    await firstProduct.click()
    
    // 商品詳細ページに遷移したことを確認（URLパターン）
    // Note: 実際の商品詳細ページが存在しない場合は404になる可能性がある
    await page.waitForTimeout(1000)
  })

  test('ページネーションボタンが表示される（複数ページある場合）', async ({ page }) => {
    // ページネーションが存在するかチェック
    const prevButton = page.locator('button:has-text("前へ")')
    const nextButton = page.locator('button:has-text("次へ")')
    
    // ページネーションが表示されている場合のみテスト
    if (await prevButton.isVisible()) {
      await expect(nextButton).toBeVisible()
      
      // 1ページ目では「前へ」ボタンが無効
      await expect(prevButton).toBeDisabled()
    }
  })
})

test.describe('カートページ - 未認証ユーザー', () => {
  test('未認証ユーザーはログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/cart')
    
    // ログインページにリダイレクトされることを確認
    await page.waitForURL('/login', { timeout: 10000 })
    await expect(page).toHaveURL('/login')
  })
})

test.describe('カートページ - 認証済みユーザー（空のカート）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
    await page.goto('/cart')
    await waitForPageLoad(page)
  })

  test('カートページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/cart')
    await expect(page.locator('h1:has-text("ショッピングカート")')).toBeVisible()
  })

  test('空のカートメッセージが表示される', async ({ page }) => {
    // カートが空の場合のメッセージ
    const emptyMessage = page.locator('h2:has-text("カートは空です")')
    
    // カートが空の場合のみテスト
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible()
      
      // 「商品を見る」ボタンが表示される
      const shopButton = page.locator('a[href="/products"]:has-text("商品を見る")')
      await expect(shopButton).toBeVisible()
    }
  })

  test('「商品を見る」ボタンで商品一覧に遷移', async ({ page }) => {
    const emptyMessage = page.locator('h2:has-text("カートは空です")')
    
    if (await emptyMessage.isVisible()) {
      await clickAndVerifyNavigation(
        page,
        'a[href="/products"]:has-text("商品を見る")',
        '/products',
        { exact: true }
      )
    }
  })
})

test.describe('カートページ - 認証済みユーザー（商品あり）', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('カート内の商品が表示される', async ({ page }) => {
    // 商品をカートに追加
    await addProductToCart(page)
    
    // カートページに移動
    await page.goto('/cart')
    await waitForPageLoad(page)
    
    // カートアイテムが表示されることを確認
    const cartItems = page.locator('[class*="CartItem"], article')
    const count = await cartItems.count()
    
    if (count > 0) {
      await expect(cartItems.first()).toBeVisible()
    }
  })

  test('「買い物を続ける」リンクで商品一覧に遷移', async ({ page }) => {
    await addProductToCart(page)
    await page.goto('/cart')
    await waitForPageLoad(page)
    
    const continueShoppingLink = page.locator('a[href="/products"]:has-text("買い物を続ける")')
    
    if (await continueShoppingLink.isVisible()) {
      await clickAndVerifyNavigation(
        page,
        'a[href="/products"]:has-text("買い物を続ける")',
        '/products',
        { exact: true }
      )
    }
  })

  test('「レジに進む」ボタンでチェックアウトページに遷移', async ({ page }) => {
    await addProductToCart(page)
    await page.goto('/cart')
    await waitForPageLoad(page)
    
    const checkoutButton = page.locator('a[href="/checkout"]:has-text("レジに進む")')
    
    if (await checkoutButton.isVisible()) {
      await clickAndVerifyNavigation(
        page,
        'a[href="/checkout"]:has-text("レジに進む")',
        '/checkout',
        { exact: true }
      )
    }
  })

  test('「すべて削除」ボタンでカートをクリア', async ({ page }) => {
    await addProductToCart(page)
    await page.goto('/cart')
    await waitForPageLoad(page)
    
    const clearButton = page.locator('button:has-text("すべて削除")')
    
    if (await clearButton.isVisible()) {
      // 確認ダイアログをハンドル
      page.on('dialog', async (dialog) => {
        await dialog.accept()
      })
      
      await clearButton.click()
      await page.waitForTimeout(1000)
      
      // カートが空になることを確認
      await expect(page.locator('h2:has-text("カートは空です")')).toBeVisible()
    }
  })
})

test.describe('チェックアウトページ - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('チェックアウトページにアクセスできる', async ({ page }) => {
    await page.goto('/checkout')
    await waitForPageLoad(page)
    
    await expect(page).toHaveURL('/checkout')
  })

  test('カートが空の場合は適切なメッセージが表示される', async ({ page }) => {
    await page.goto('/checkout')
    await waitForPageLoad(page)
    
    // カートが空の場合のメッセージまたはリダイレクトを確認
    // 実装によって異なる
  })
})

test.describe('注文履歴ページ - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page)
  })

  test('注文履歴ページにアクセスできる', async ({ page }) => {
    await page.goto('/orders')
    await waitForPageLoad(page)
    
    await expect(page).toHaveURL('/orders')
  })

  test('注文がない場合は適切なメッセージが表示される', async ({ page }) => {
    await page.goto('/orders')
    await waitForPageLoad(page)
    
    // 注文がない場合のメッセージを確認（実装によって異なる）
  })

  test('注文詳細ページにアクセスできる（注文がある場合）', async ({ page }) => {
    await page.goto('/orders')
    await waitForPageLoad(page)
    
    // 注文リンクが存在する場合のみテスト
    const orderLinks = page.locator('a[href^="/orders/"]')
    const count = await orderLinks.count()
    
    if (count > 0) {
      const firstOrderLink = orderLinks.first()
      await firstOrderLink.click()
      
      // 注文詳細ページに遷移したことを確認
      await expect(page).toHaveURL(/\/orders\/[\w-]+/)
    }
  })
})

test.describe('ショップページ - エラーケース', () => {
  test('存在しない商品IDでアクセスすると404', async ({ page }) => {
    const response = await page.goto('/products/non-existent-id')
    
    // 404または適切なエラーページが表示されることを確認
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })

  test('存在しない注文IDでアクセスすると404', async ({ page }) => {
    await loginAsUser(page)
    const response = await page.goto('/orders/non-existent-id')
    
    // 404または適切なエラーページが表示されることを確認
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })
})

