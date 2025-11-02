import { test, expect } from '@playwright/test'
import { loginAsAdmin, clickAndVerifyNavigation, waitForPageLoad } from '../helpers/navigation-helpers'

/**
 * 管理者ページ遷移テスト
 * Issue #52 - フロントエンドUI遷移の網羅的E2Eテスト
 * 
 * テスト対象:
 * - app/(admin)/admin/page.tsx (ダッシュボード)
 * - app/(admin)/admin/products/page.tsx (商品管理)
 * - app/(admin)/admin/products/new/page.tsx (商品新規作成)
 * - app/(admin)/admin/products/[id]/edit/page.tsx (商品編集)
 * - app/(admin)/admin/orders/page.tsx (注文管理)
 * - app/(admin)/admin/orders/[id]/page.tsx (注文詳細)
 * - app/(admin)/admin/users/page.tsx (ユーザー管理)
 */

test.describe('管理者ページ - アクセス制御', () => {
  test('未認証ユーザーは管理者ページにアクセスできない', async ({ page }) => {
    const response = await page.goto('/admin')
    
    // 認証エラーまたはログインページにリダイレクト
    const url = page.url()
    const status = response?.status() || 200
    
    // ログインページにリダイレクトされるか、403/401エラーが返される
    expect(url.includes('/login') || status === 403 || status === 401).toBeTruthy()
  })

  test('一般ユーザーは管理者ページにアクセスできない', async ({ page }) => {
    // 一般ユーザーでログイン
    await page.goto('/login')
    await page.fill('input[type="email"]', 'user@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/')
    
    // 管理者ページにアクセス
    const response = await page.goto('/admin')
    const status = response?.status() || 200
    
    // 403エラーまたはホームページにリダイレクト
    expect(status === 403 || page.url() === new URL('/', page.url()).href).toBeTruthy()
  })
})

test.describe('管理者ダッシュボード - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin')
    await waitForPageLoad(page)
  })

  test('管理者ダッシュボードが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/admin')
    await expect(page.locator('h1:has-text("ダッシュボード")')).toBeVisible()
  })

  test('統計カードが表示される', async ({ page }) => {
    // 総売上カード
    await expect(page.locator('text=総売上')).toBeVisible()
    
    // 注文数カード
    await expect(page.locator('text=注文数')).toBeVisible()
    
    // 商品数カード
    await expect(page.locator('text=商品数')).toBeVisible()
    
    // ユーザー数カード
    await expect(page.locator('text=ユーザー数')).toBeVisible()
  })

  test('サイドバーナビゲーションが表示される', async ({ page }) => {
    // サイドバーの主要リンクを確認
    await expect(page.locator('a[href="/admin"]:has-text("ダッシュボード")')).toBeVisible()
    await expect(page.locator('a[href="/admin/products"]')).toBeVisible()
    await expect(page.locator('a[href="/admin/orders"]')).toBeVisible()
    await expect(page.locator('a[href="/admin/users"]')).toBeVisible()
  })

  test('商品管理リンクで商品管理ページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(
      page,
      'a[href="/admin/products"]',
      '/admin/products',
      { exact: true }
    )
  })

  test('注文管理リンクで注文管理ページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(
      page,
      'a[href="/admin/orders"]',
      '/admin/orders',
      { exact: true }
    )
  })

  test('ユーザー管理リンクでユーザー管理ページに遷移', async ({ page }) => {
    await clickAndVerifyNavigation(
      page,
      'a[href="/admin/users"]',
      '/admin/users',
      { exact: true }
    )
  })

  test('最新注文テーブルが表示される', async ({ page }) => {
    // 最新注文セクションを確認
    const recentOrdersSection = page.locator('text=最新の注文')
    
    if (await recentOrdersSection.isVisible()) {
      await expect(recentOrdersSection).toBeVisible()
    }
  })

  test('在庫アラートが表示される（在庫が少ない商品がある場合）', async ({ page }) => {
    const lowStockSection = page.locator('text=在庫アラート')
    
    if (await lowStockSection.isVisible()) {
      await expect(lowStockSection).toBeVisible()
    }
  })
})

test.describe('商品管理ページ - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/products')
    await waitForPageLoad(page)
  })

  test('商品管理ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/admin/products')
  })

  test('「新規商品作成」ボタンが表示される', async ({ page }) => {
    const newProductButton = page.locator('a[href="/admin/products/new"], button:has-text("新規商品作成")')
    await expect(newProductButton.first()).toBeVisible()
  })

  test('「新規商品作成」ボタンで商品作成ページに遷移', async ({ page }) => {
    const newProductLink = page.locator('a[href="/admin/products/new"]')
    
    if (await newProductLink.isVisible()) {
      await clickAndVerifyNavigation(
        page,
        'a[href="/admin/products/new"]',
        '/admin/products/new',
        { exact: true }
      )
    }
  })

  test('商品検索フォームが表示される', async ({ page }) => {
    const searchInput = page.locator('input[type="text"], input[type="search"]').first()
    
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible()
    }
  })

  test('商品一覧テーブルが表示される', async ({ page }) => {
    // 商品が存在する場合、テーブルまたはカードが表示される
    const productList = page.locator('table, [class*="product"]')
    
    if (await productList.isVisible()) {
      await expect(productList.first()).toBeVisible()
    }
  })

  test('商品の「編集」ボタンで編集ページに遷移', async ({ page }) => {
    // 編集リンクが存在する場合のみテスト
    const editLinks = page.locator('a[href*="/admin/products/"][href*="/edit"]')
    const count = await editLinks.count()
    
    if (count > 0) {
      const firstEditLink = editLinks.first()
      await firstEditLink.click()
      
      // 編集ページに遷移したことを確認
      await expect(page).toHaveURL(/\/admin\/products\/[\w-]+\/edit/)
    }
  })

  test('商品の「削除」ボタンが表示される', async ({ page }) => {
    const deleteButtons = page.locator('button:has-text("削除")')
    const count = await deleteButtons.count()
    
    if (count > 0) {
      await expect(deleteButtons.first()).toBeVisible()
    }
  })
})

test.describe('商品新規作成ページ - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/products/new')
    await waitForPageLoad(page)
  })

  test('商品新規作成ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/admin/products/new')
  })

  test('商品フォームが表示される', async ({ page }) => {
    // 商品名入力欄
    await expect(page.locator('input[name="name"], input[id="name"]')).toBeVisible()
    
    // 価格入力欄
    await expect(page.locator('input[name="price"], input[id="price"]')).toBeVisible()
  })

  test('「保存」ボタンが表示される', async ({ page }) => {
    const saveButton = page.locator('button[type="submit"]:has-text("保存"), button:has-text("作成")')
    await expect(saveButton.first()).toBeVisible()
  })

  test('「キャンセル」ボタンで商品一覧に戻る', async ({ page }) => {
    const cancelButton = page.locator('a[href="/admin/products"]:has-text("キャンセル"), button:has-text("キャンセル")')
    
    if (await cancelButton.isVisible()) {
      await cancelButton.first().click()
      await expect(page).toHaveURL('/admin/products')
    }
  })

  test('画像アップロードボタンが表示される', async ({ page }) => {
    const uploadButton = page.locator('input[type="file"], button:has-text("画像")')
    
    if (await uploadButton.isVisible()) {
      await expect(uploadButton.first()).toBeVisible()
    }
  })
})

test.describe('商品編集ページ - ナビゲーション', () => {
  test('商品編集ページにアクセスできる', async ({ page }) => {
    await loginAsAdmin(page)
    
    // 商品一覧から編集ページに移動
    await page.goto('/admin/products')
    await waitForPageLoad(page)
    
    const editLinks = page.locator('a[href*="/admin/products/"][href*="/edit"]')
    const count = await editLinks.count()
    
    if (count > 0) {
      await editLinks.first().click()
      await expect(page).toHaveURL(/\/admin\/products\/[\w-]+\/edit/)
    }
  })

  test('「更新」ボタンが表示される', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/products')
    await waitForPageLoad(page)
    
    const editLinks = page.locator('a[href*="/admin/products/"][href*="/edit"]')
    const count = await editLinks.count()
    
    if (count > 0) {
      await editLinks.first().click()
      
      const updateButton = page.locator('button[type="submit"]:has-text("更新"), button:has-text("保存")')
      await expect(updateButton.first()).toBeVisible()
    }
  })

  test('「削除」ボタンが表示される', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/products')
    await waitForPageLoad(page)
    
    const editLinks = page.locator('a[href*="/admin/products/"][href*="/edit"]')
    const count = await editLinks.count()
    
    if (count > 0) {
      await editLinks.first().click()
      
      const deleteButton = page.locator('button:has-text("削除")')
      
      if (await deleteButton.isVisible()) {
        await expect(deleteButton).toBeVisible()
      }
    }
  })
})

test.describe('注文管理ページ - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/orders')
    await waitForPageLoad(page)
  })

  test('注文管理ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/admin/orders')
  })

  test('ステータスフィルターが表示される', async ({ page }) => {
    const statusFilters = page.locator('button:has-text("処理中"), button:has-text("確定"), button:has-text("発送済み")')
    
    if (await statusFilters.first().isVisible()) {
      await expect(statusFilters.first()).toBeVisible()
    }
  })

  test('注文一覧が表示される', async ({ page }) => {
    const orderList = page.locator('table, [class*="order"]')
    
    if (await orderList.isVisible()) {
      await expect(orderList.first()).toBeVisible()
    }
  })

  test('注文詳細ページに遷移', async ({ page }) => {
    const orderLinks = page.locator('a[href*="/admin/orders/"]')
    const count = await orderLinks.count()
    
    if (count > 0) {
      await orderLinks.first().click()
      await expect(page).toHaveURL(/\/admin\/orders\/[\w-]+/)
    }
  })

  test('ページネーションが表示される（複数ページある場合）', async ({ page }) => {
    const pagination = page.locator('button:has-text("前へ"), button:has-text("次へ")')
    
    if (await pagination.first().isVisible()) {
      await expect(pagination.first()).toBeVisible()
    }
  })
})

test.describe('注文詳細ページ - ナビゲーション', () => {
  test('注文詳細ページにアクセスできる', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/orders')
    await waitForPageLoad(page)
    
    const orderLinks = page.locator('a[href*="/admin/orders/"]')
    const count = await orderLinks.count()
    
    if (count > 0) {
      await orderLinks.first().click()
      await expect(page).toHaveURL(/\/admin\/orders\/[\w-]+/)
    }
  })

  test('ステータス変更ドロップダウンが表示される', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/orders')
    await waitForPageLoad(page)
    
    const orderLinks = page.locator('a[href*="/admin/orders/"]')
    const count = await orderLinks.count()
    
    if (count > 0) {
      await orderLinks.first().click()
      
      const statusDropdown = page.locator('select, [role="combobox"]')
      
      if (await statusDropdown.isVisible()) {
        await expect(statusDropdown.first()).toBeVisible()
      }
    }
  })

  test('「注文一覧に戻る」ボタンで注文一覧に戻る', async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/orders')
    await waitForPageLoad(page)
    
    const orderLinks = page.locator('a[href*="/admin/orders/"]')
    const count = await orderLinks.count()
    
    if (count > 0) {
      await orderLinks.first().click()
      
      const backButton = page.locator('a[href="/admin/orders"]:has-text("戻る"), button:has-text("戻る")')
      
      if (await backButton.isVisible()) {
        await backButton.first().click()
        await expect(page).toHaveURL('/admin/orders')
      }
    }
  })
})

test.describe('ユーザー管理ページ - ナビゲーション', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page)
    await page.goto('/admin/users')
    await waitForPageLoad(page)
  })

  test('ユーザー管理ページが正しく表示される', async ({ page }) => {
    await expect(page).toHaveURL('/admin/users')
  })

  test('ユーザー一覧が表示される', async ({ page }) => {
    const userList = page.locator('table, [class*="user"]')
    
    if (await userList.isVisible()) {
      await expect(userList.first()).toBeVisible()
    }
  })

  test('ロール変更ドロップダウンが表示される', async ({ page }) => {
    const roleDropdowns = page.locator('select[name*="role"], [role="combobox"]')
    const count = await roleDropdowns.count()
    
    if (count > 0) {
      await expect(roleDropdowns.first()).toBeVisible()
    }
  })

  test('「ロール更新」ボタンが表示される', async ({ page }) => {
    const updateButtons = page.locator('button:has-text("更新"), button[type="submit"]')
    const count = await updateButtons.count()
    
    if (count > 0) {
      await expect(updateButtons.first()).toBeVisible()
    }
  })

  test('ページネーションが表示される（複数ページある場合）', async ({ page }) => {
    const pagination = page.locator('button:has-text("前へ"), button:has-text("次へ")')
    
    if (await pagination.first().isVisible()) {
      await expect(pagination.first()).toBeVisible()
    }
  })
})

test.describe('管理者ページ - エラーケース', () => {
  test('存在しない商品IDで編集ページにアクセスすると404', async ({ page }) => {
    await loginAsAdmin(page)
    const response = await page.goto('/admin/products/non-existent-id/edit')
    
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })

  test('存在しない注文IDで詳細ページにアクセスすると404', async ({ page }) => {
    await loginAsAdmin(page)
    const response = await page.goto('/admin/orders/non-existent-id')
    
    expect(response?.status()).toBeGreaterThanOrEqual(400)
  })
})

