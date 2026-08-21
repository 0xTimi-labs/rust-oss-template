import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // CI 中防止误提交 .only 导致只跑部分用例
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  expect: {
    toHaveScreenshot: {
      // 图像快照必须禁用动画与光标，否则像素级比对在 CI 上极不稳定
      animations: "disabled",
      caret: "hide",
    },
  },
});
