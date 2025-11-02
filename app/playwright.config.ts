import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright MCP 設定
 * 
 * この設定は、Cursor チャットから Playwright MCP Server を通じて
 * アプリケーションを操作する際に使用されます。
 */
export default defineConfig({
  // テストディレクトリ（MCP使用時は不要だが、将来のE2Eテスト用に定義）
  testDir: './tests',
  
  // 完全並列実行
  fullyParallel: true,
  
  // CI環境でのみfail fast
  forbidOnly: !!process.env.CI,
  
  // 失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,
  
  // ワーカー数
  workers: process.env.CI ? 1 : undefined,
  
  // レポーター
  reporter: 'html',
  
  // 共通設定
  use: {
    // ベースURL
    baseURL: process.env.APP_URL || 'http://localhost:3000',
    
    // トレース設定（失敗時のみ記録）
    trace: 'on-first-retry',
    
    // スクリーンショット設定（失敗時のみ）
    screenshot: 'only-on-failure',
    
    // ビデオ設定（失敗時のみ）
    video: 'retain-on-failure',
    
    // タイムアウト
    actionTimeout: 30000,
    navigationTimeout: 30000,
  },

  // プロジェクト設定（ブラウザ種別）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // 必要に応じて他のブラウザも有効化
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
  ],

  // ローカル開発サーバー（オプション）
  // MCP使用時は手動でサーバーを起動するため、通常はコメントアウト
  // webServer: {
  //   command: 'npm run dev',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

