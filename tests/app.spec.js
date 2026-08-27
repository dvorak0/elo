import { expect, test } from "@playwright/test";

test("loads without browser or network errors", async ({ page }, testInfo) => {
  const errors = [];

  page.on("console", (message) => {
    if (message.type() === "error") errors.push(`console: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`pageerror: ${error.stack || error.message}`));
  page.on("requestfailed", (request) => {
    errors.push(`requestfailed: ${request.method()} ${request.url()} ${request.failure()?.errorText}`);
  });
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`http ${response.status()}: ${response.url()}`);
  });

  await page.goto("/", { waitUntil: "networkidle" });
  await page.screenshot({ path: testInfo.outputPath("page.png"), fullPage: true });
  await expect(page.locator("body")).not.toBeEmpty();

  expect(errors, errors.join("\n")).toEqual([]);
});
