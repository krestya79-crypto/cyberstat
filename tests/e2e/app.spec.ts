import { test, expect, chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
import { statisticalFormulas } from '../../src/content/statistics';
import { examples } from '../../src/content/examples';
const solve = (page: import('@playwright/test').Page) =>
  page.getByRole('button', { name: 'Solve problem', exact: true }).click();
test('default workflow, exact navigation and project information', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Statistical Solver');
  await expect(
    page.getByRole('navigation', { name: 'Main navigation', exact: true }).getByRole('link'),
  ).toHaveText(['Statistical Solver', 'Worked Examples', 'Formula Notebook']);
  for (const s of [
    'Ahmed Waleed Reda Gad',
    'Horus University',
    'Dr. Mohamed Ibrahim Sobh',
    'Advanced Probability and Statistics',
  ])
    await expect(page.locator('.project-information')).toContainText(s);
  for (const s of [
    'SELECT STATISTICAL METHOD',
    'SELECT THE FORMULA',
    'ENTER PROBLEM DATA',
    'SOLVE THE PROBLEM',
  ])
    await expect(page.locator('main')).toContainText(s);
  await page.getByLabel('Statistical method', { exact: true }).selectOption('testing');
  await expect(
    page.getByLabel('Statistical formula', { exact: true }).locator('option'),
  ).toHaveText([
    'One-sample z-test',
    'One-sample t-test',
    'One-proportion z-test',
    'Chi-square goodness-of-fit test',
  ]);
  await page.getByLabel('Statistical formula', { exact: true }).selectOption('chi-square-test');
  await expect(page.getByLabel('Observed category counts', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Sample mean · x̄', { exact: true })).toHaveCount(0);
});
test('dynamic data, both modes, actual histogram and box plot, errors and reset', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Data set', { exact: true }).fill('2,4,4,4,5,5,7,9');
  await solve(page);
  await expect(page.locator('.result-answer')).toContainText('mean 5');
  await expect(page.getByRole('img', { name: /Histogram of 8 observations/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Box plot/ })).toBeVisible();
  const answer = await page.locator('.result-answer').innerText();
  await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
  expect(await page.locator('.result-answer').innerText()).toBe(answer);
  for (const s of [
    'REQUIRED INFORMATION',
    'VARIABLES & PARAMETERS',
    'SELECTED METHOD',
    'SELECTED FORMULA',
    'Assumptions and conclusions',
  ])
    await expect(page.locator('.stat-result')).toContainText(s);
  await page.getByLabel('Data set', { exact: true }).fill('1,wrong,3');
  await solve(page);
  await expect(page.getByRole('alert')).toContainText('Observation 2');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
});
test('all 40 formulas calculate, render mathematics, and generate graphs', async ({ page }) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const formula of statisticalFormulas) {
    await page.goto('/#/solver?formula=' + formula.id);
    await solve(page);
    await expect(page.locator('.result-answer'), formula.id).toBeVisible();
    await expect(page.getByRole('alert'), formula.id).toHaveCount(0);
    await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
    await expect(page.locator('.visualization svg'), formula.id).not.toHaveCount(0);
    await expect(page.locator('main'), formula.id).not.toContainText('could not be rendered');
  }
  expect(errors).toEqual([]);
});
test('preserved examples and formulas keep search, filters, content and working links', async ({
  page,
}) => {
  await page.goto('/#/examples');
  await expect(page.locator('.example-library article')).toHaveCount(47);
  await page
    .getByRole('searchbox', { name: 'Search examples, subjects, or given values…' })
    .fill('Clinic waiting');
  await expect(page.locator('.example-library article')).toHaveCount(3);
  await page
    .getByRole('link', { name: 'Work through Clinic waiting times part b', exact: true })
    .click();
  await expect(page.locator('.result-answer')).toContainText('69.1462');
  await expect(page.locator('.source-answer')).toContainText('0.5987');
  await page.goto('/#/formulas');
  await expect(page.locator('.formula-library article')).toHaveCount(49);
  await page
    .getByRole('searchbox', { name: 'Search formulas or statistical methods…' })
    .fill('F variance');
  const entry = page
    .locator('.formula-library article')
    .filter({ has: page.getByRole('heading', { name: 'F variance', exact: true }) });
  await expect(entry).toHaveCount(1);
  await entry.locator('.text-link').click();
  await expect(page.getByLabel('Statistical formula', { exact: true })).toHaveValue('f');
});
test('all 47 original examples and illustrations remain available', async ({ page }) => {
  test.setTimeout(90000);
  for (const e of examples) {
    await page.goto(`/#/solver?formula=${e.method ?? 'arithmetic-mean'}&example=${e.id}`);
    await expect(page.locator('.problem-panel')).toContainText(e.question);
    if (e.method) {
      await expect(page.locator('.result-answer'), e.id).toBeVisible();
      await expect(page.locator('.source-answer'), e.id).toContainText(e.sourceAnswer);
    } else {
      await expect(page.locator('.problem-panel')).toContainText('Preserved source illustration');
      await expect(page.locator('.result-answer')).toHaveCount(0);
    }
  }
});
test('responsive solver and preserved sections have no horizontal overflow', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      'solver',
      'examples',
      'formulas',
      'solver?formula=regression',
      'solver?formula=t-test',
      'solver?formula=binomial',
    ]) {
      await page.goto('/#/' + route);
      if (route.startsWith('solver')) {
        await solve(page);
        await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
        `${width}: ${route}`,
      ).toBeLessThanOrEqual(width);
    }
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: info.outputPath(`solver-${width}.png`), fullPage: true });
  }
});
test('installability and offline statistical solving, libraries and source citations', async () => {
  const context = await chromium.launchPersistentContext('test-results/pwa-profile', {
    channel: 'chrome',
    headless: true,
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    const cdp = await context.newCDPSession(page);
    expect((await cdp.send('Page.getInstallabilityErrors')).installabilityErrors).toEqual([]);
    await context.setOffline(true);
    await page.goto('/#/solver?formula=regression');
    await solve(page);
    await expect(page.getByRole('img', { name: /Observed X,Y pairs/ })).toBeVisible();
    await page.reload();
    await solve(page);
    await expect(page.locator('.result-answer')).toBeVisible();
    await page.goto('/#/formulas');
    await expect(page.locator('.formula-library article')).toHaveCount(49);
    for (const n of [1, 2, 3, 4])
      expect(
        await page.evaluate(async (n) => {
          const r = await fetch(`lectures/lecture-${n}.pdf`);
          return r.ok && (await r.blob()).size > 1000000;
        }, n),
      ).toBe(true);
  } finally {
    await context.close();
  }
});
test('safe application updates preserve the entered statistical data', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByLabel('Data set', { exact: true }).fill('1,2,9');
  await solve(page);
  const original = await readFile('dist/sw.js', 'utf8');
  try {
    await writeFile('dist/sw.js', `${original}\n// Statistics QA ${Date.now()}\n`);
    await page.evaluate(async () => {
      await (await navigator.serviceWorker.getRegistration())?.update();
    });
    await page.getByRole('button', { name: 'Update & reload' }).waitFor({ timeout: 20000 });
    await page.getByRole('button', { name: 'Update & reload' }).click();
    await expect(page.getByLabel('Data set', { exact: true })).toHaveValue('1,2,9');
    await solve(page);
    await expect(page.locator('.result-answer')).toContainText('mean 4');
  } finally {
    await writeFile('dist/sw.js', original);
  }
});
test('PDF export includes the detailed calculation, actual graphs and exact credits', async ({
  page,
}, info) => {
  await page.goto('/#/solver?formula=regression');
  await solve(page);
  await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printRequested = 'true';
    };
  });
  await page.getByRole('button', { name: 'Export solution as PDF', exact: true }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-requested', 'true');
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: info.outputPath('regression-solution.pdf'),
    format: 'A4',
    printBackground: true,
  });
  await expect(page.locator('.print-footer')).toContainText('Ahmed Waleed Reda Gad');
});
test('keyboard access works and obsolete routes do not render removed features', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  for (const route of ['dashboard', 'course', 'topic/normal', 'about']) {
    await page.goto('/#/' + route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'That page is no longer available.',
    );
    await page.getByRole('link', { name: 'Open Statistical Solver' }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Statistical Solver');
  }
});
