import { test, expect } from '@playwright/test';

/**
 * サンプルテスト
 * 
 * このファイルは、将来的にE2Eテストを書く際の参考用です。
 * Playwright MCP を使用する場合は、Cursor チャットから直接操作するため、
 * このようなテストファイルは通常必要ありません。
 */

test.describe('ECサイト - 基本動作確認', () => {
  test('トップページが表示される', async ({ page }) => {
    await page.goto('/');
    
    // タイトルまたは主要な要素が表示されることを確認
    await expect(page).toHaveTitle(/ECサイト|Next.js/);
  });

  test('商品一覧ページに移動できる', async ({ page }) => {
    await page.goto('/products');
    
    // 商品一覧ページが表示されることを確認
    await expect(page.locator('h1')).toContainText(/商品|Products/);
  });

  test('ログインページに移動できる', async ({ page }) => {
    await page.goto('/login');
    
    // ログインフォームが表示されることを確認
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});

test.describe('ECサイト - ユーザーフロー', () => {
  test('商品詳細ページへの遷移', async ({ page }) => {
    // 商品一覧ページに移動
    await page.goto('/products');
    
    // 最初の商品をクリック
    const firstProduct = page.locator('article, .product-card').first();
    await firstProduct.click();
    
    // 商品詳細ページに遷移したことを確認
    await expect(page).toHaveURL(/\/products\/\d+/);
  });
});

/**
 * 注意: これらのテストは例です。
 * 実際のアプリケーションの構造に合わせて調整してください。
 * 
 * Playwright MCP を使用する場合は、Cursor チャットで以下のように指示できます：
 * 
 * 「商品一覧ページに移動して、最初の商品をクリックしてください」
 * 「ログインページに移動して、test@example.com でログインしてください」
 * 「カートに商品を追加して、チェックアウトまで進んでください」
 */

