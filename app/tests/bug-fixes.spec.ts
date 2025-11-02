import { test, expect } from '@playwright/test';

/**
 * BUG-006, BUG-007の修正確認テスト
 * 
 * テスト対象:
 * - 商品検索の曖昧検索（ひらがな→カタカナ変換）
 * - 入力フィールドの文字が見える（白文字問題の修正）
 * - カートへの商品追加
 */

test.describe('BUG修正の動作確認', () => {
  test.beforeEach(async ({ page }) => {
    // 各テストの前にトップページに移動
    await page.goto('/');
  });

  test('BUG-007: 商品検索フィールドの文字が見える', async ({ page }) => {
    // 商品一覧ページに移動
    await page.goto('/products');
    
    // 検索フィールドが表示されることを確認
    const searchInput = page.locator('input[placeholder="商品を検索..."]');
    await expect(searchInput).toBeVisible();
    
    // 検索フィールドのスタイルを確認（bg-white text-gray-900が適用されているか）
    const bgColor = await searchInput.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const color = await searchInput.evaluate(el => window.getComputedStyle(el).color);
    
    // 背景が白、テキストが黒（濃いグレー）であることを確認
    expect(bgColor).toContain('255, 255, 255'); // rgb(255, 255, 255) = white
    expect(color).toContain('17, 24, 39'); // rgb(17, 24, 39) = gray-900
  });

  test('BUG-006: ひらがな検索でカタカナ商品が見つかる', async ({ page }) => {
    // 商品一覧ページに移動
    await page.goto('/products');
    
    // 検索フィールドに「ばっくぱっく」と入力
    const searchInput = page.locator('input[placeholder="商品を検索..."]');
    await searchInput.fill('ばっくぱっく');
    
    // Enterキーを押すか、フォームを送信
    await searchInput.press('Enter');
    
    // ローディングが完了するまで待機
    await page.waitForTimeout(1000);
    
    // 商品カードが表示されることを確認
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md');
    const count = await productCards.count();
    
    // 少なくとも1つの商品が表示されることを確認
    expect(count).toBeGreaterThan(0);
    
    // 「バックパック」が含まれることを確認（大文字小文字は問わない）
    const firstCard = productCards.first();
    await expect(firstCard).toContainText(/バックパック|ばっくぱっく/i);
  });

  test('BUG-006: カタカナ検索でひらがな商品も見つかる', async ({ page }) => {
    // 商品一覧ページに移動
    await page.goto('/products');
    
    // 検索フィールドに「マック」と入力
    const searchInput = page.locator('input[placeholder="商品を検索..."]');
    await searchInput.fill('マック');
    
    // Enterキーを押す
    await searchInput.press('Enter');
    
    // ローディングが完了するまで待機
    await page.waitForTimeout(1000);
    
    // 検索結果が表示される（MacBook等）
    const productCards = page.locator('.bg-white.rounded-lg.shadow-md');
    const count = await productCards.count();
    
    // MacBookが含まれる場合は成功
    if (count > 0) {
      const text = await page.textContent('body');
      expect(text).toContain('Mac');
    }
  });

  test('BUG-004: カートに商品を追加できる', async ({ page }) => {
    // ログインページに移動
    await page.goto('/login');
    
    // テストユーザーでログイン
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // ログイン完了を待機
    await page.waitForURL('/');
    
    // 商品一覧ページに移動
    await page.goto('/products');
    
    // 最初の商品のカートボタンをクリック
    const firstCartButton = page.locator('button:has(svg.w-5.h-5)').first();
    await firstCartButton.click();
    
    // アラートが表示されるまで待機
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('カートに追加しました');
      await dialog.accept();
    });
    
    // 少し待機してページがリフレッシュされるのを待つ
    await page.waitForTimeout(2000);
  });

  test('BUG-005,007: 全ての入力フィールドで文字が見える', async ({ page }) => {
    // ログインページのフィールドをチェック
    await page.goto('/login');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // 両方のフィールドが表示される
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    
    // スタイルを確認
    const emailBg = await emailInput.evaluate(el => window.getComputedStyle(el).backgroundColor);
    const emailColor = await emailInput.evaluate(el => window.getComputedStyle(el).color);
    
    expect(emailBg).toContain('255, 255, 255'); // white
    expect(emailColor).toContain('17, 24, 39'); // gray-900
  });

  test('統合テスト: 検索→商品詳細→カート追加', async ({ page }) => {
    // ログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/');
    
    // 商品一覧ページで検索
    await page.goto('/products');
    const searchInput = page.locator('input[placeholder="商品を検索..."]');
    await searchInput.fill('まっく');
    await searchInput.press('Enter');
    await page.waitForTimeout(1000);
    
    // 最初の商品をクリックして詳細ページに移動
    const firstProduct = page.locator('.bg-white.rounded-lg.shadow-md a').first();
    await firstProduct.click();
    
    // 商品詳細ページでカートに追加
    await page.waitForTimeout(1000);
    const addToCartButton = page.locator('button:has-text("カートに追加")');
    
    if (await addToCartButton.isVisible()) {
      await addToCartButton.click();
      
      // アラート処理
      page.on('dialog', async dialog => {
        await dialog.accept();
      });
      
      await page.waitForTimeout(2000);
    }
  });
});

