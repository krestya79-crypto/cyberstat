import { test, expect, chromium } from '@playwright/test';
import { readFile, writeFile } from 'node:fs/promises';
test('unified solver, retained lecture search and explicit progress persist', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Equation Solver');
  await page.locator('.solver-lecture-tools>summary').click();
  await page
    .locator('.solver-topic-list a')
    .filter({ hasText: 'Normal distribution' })
    .first()
    .click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Normal distribution');
  await page.getByRole('button', { name: 'Mark as studied', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Marked as studied' })).toBeVisible();
  await page.goto('/#/course');
  await page.locator('.solver-lecture-tools>summary').click();
  await page
    .getByRole('searchbox', { name: 'Search topics, concepts, or formulas…' })
    .fill('not-a-real-topic');
  await expect(page.getByRole('heading', { name: 'No matching ideas yet.' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset search & filters' }).click();
  await page
    .getByRole('searchbox', { name: 'Search topics, concepts, or formulas…' })
    .fill('chi-square');
  await expect(
    page.locator('.solver-topic-list a').filter({ hasText: 'Chi-square distribution' }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test('source example, two solution modes, validation, reset and export', async ({
  page,
}, testInfo) => {
  await page.goto('/#/topic/normal?example=clinic-b');
  await expect(page.locator('.result-answer')).toContainText('69.1462');
  await expect(page.locator('.source-answer')).toContainText('0.5987');
  const quick = await page.locator('.result-answer').innerText();
  await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
  await expect(page.locator('.solution-steps li')).toHaveCount(4);
  expect(await page.locator('.result-answer').innerText()).toEqual(quick);
  await page.getByLabel('Standard deviation · σ', { exact: true }).fill('0');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('greater than zero');
  await page.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.locator('.result-answer')).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.goto('/#/topic/ci-t?example=cotton');
  await expect(page.locator('.result-answer')).toContainText('6.592142');
  await expect(page.locator('.source-answer')).toContainText('2.431');
  await page.evaluate(() => {
    window.print = () => {
      document.body.dataset.printRequested = 'true';
    };
  });
  await page.getByRole('button', { name: 'Export solution as PDF' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-print-requested', 'true');
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: testInfo.outputPath('cotton-solution.pdf'),
    format: 'A4',
    printBackground: true,
  });
});
test('all calculation examples have working solutions and rendered mathematics', async ({
  page,
}) => {
  const { examples } = await import('../../src/content/examples');
  for (const e of examples.filter((e) => e.method)) {
    await page.goto(`/#/topic/${e.topic}?example=${e.id}`);
    await expect(page.locator('.result-answer'), e.id).toBeVisible();
    await expect(page.getByRole('alert'), e.id).toHaveCount(0);
    await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
    await expect(page.locator('.katex-error'), e.id).toHaveCount(0);
    await expect(page.locator('.result-panel'), e.id).not.toContainText('could not be rendered');
  }
  await page.goto('/#/formulas');
  await expect(page.locator('.formula-library .katex')).not.toHaveCount(0);
  await expect(page.locator('main')).not.toContainText('could not be rendered');
});
test('responsive pages have no document overflow at 320, 375, 768, 1024 and 1440px', async ({
  page,
}, testInfo) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const route of [
      '',
      'dashboard',
      'course',
      'examples',
      'formulas',
      'topic/proportion?example=shelter',
      'topic/ci-summary?example=summary40',
      'about',
    ]) {
      await page.goto(`/#/${route}`);
      await page.evaluate(() => document.fonts.ready);
      const sizes = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }));
      expect(sizes.scroll, `${width}px ${route}`).toBeLessThanOrEqual(sizes.width);
    }
    await page.goto('/');
    await page.screenshot({ path: testInfo.outputPath(`solver-${width}.png`), fullPage: true });
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/#/topic/normal?example=weight-b');
  await page.screenshot({ path: testInfo.outputPath('workspace-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 375, height: 950 });
  await page.goto('/#/topic/normal?example=weight-b');
  await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('workspace-mobile.png'), fullPage: true });
});
test('PWA manifest, installability, offline reload and all bundled lecture PDFs', async () => {
  // Keep the profile path short: Chrome CacheStorage adds deeply nested paths on Windows.
  const context = await chromium.launchPersistentContext('test-results/pwa-profile', {
    channel: 'chrome',
    headless: true,
    baseURL: 'http://127.0.0.1:4173',
  });
  const page = await context.newPage();
  try {
    await page.goto('/');
    await page
      .waitForFunction(() => !!navigator.serviceWorker.controller, { timeout: 15000 })
      .catch(async (error) => {
        console.log(
          'SW diagnosis',
          await page.evaluate(async () => {
            const r = await navigator.serviceWorker.getRegistration();
            return {
              active: r?.active?.state,
              installing: r?.installing?.state,
              waiting: r?.waiting?.state,
              cache: await caches.keys(),
              text: document.body.innerText.slice(-500),
            };
          }),
        );
        throw error;
      });
    const href = await page.locator('link[rel=manifest]').getAttribute('href');
    expect(href).toBeTruthy();
    const manifest = await (await page.request.get(href!)).json();
    expect(manifest.display).toBe('standalone');
    expect(manifest.icons.some((i: { purpose: string }) => i.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons)
      expect((await page.request.get(icon.src)).status()).toBe(200);
    const cdp = await context.newCDPSession(page);
    const install = await cdp.send('Page.getInstallabilityErrors');
    expect(install.installabilityErrors).toEqual([]);
    await context.setOffline(true);
    await page.goto('/#/topic/sampling-variance?example=tablets');
    await expect(page.locator('.result-answer')).toBeVisible();
    await expect(page.locator('.online-state')).toContainText('Offline');
    for (const n of [1, 2, 3, 4])
      expect(
        await page.evaluate(async (n) => {
          const r = await fetch(`lectures/lecture-${n}.pdf`);
          return r.ok && (await r.blob()).size > 1000000;
        }, n),
      ).toBe(true);
    await page.reload();
    await expect(page.locator('.result-answer')).toBeVisible();
    await page.getByLabel('Population variance · σ²', { exact: true }).fill('20');
    await page.getByRole('button', { name: 'Calculate', exact: true }).click();
    await expect(page.getByRole('alert')).toHaveCount(0);
    await context.setOffline(false);
  } finally {
    await context.close();
  }
});
test('service worker update prompts before reloading and preserves drafts', async ({ page }) => {
  await page.goto('/#/topic/normal');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await page.getByLabel('Population mean · μ', { exact: true }).fill('123');
  await page.getByRole('button', { name: 'Calculate', exact: true }).click();
  const path = 'dist/sw.js',
    original = await readFile(path, 'utf8');
  try {
    await writeFile(path, `${original}\n// CyberStat QA update ${Date.now()}\n`);
    await page.evaluate(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      await registration?.update();
    });
    await expect(page.getByRole('button', { name: 'Update & reload' })).toBeVisible({
      timeout: 20000,
    });
    await page.getByRole('button', { name: 'Update & reload' }).click();
    await expect(page.getByLabel('Population mean · μ', { exact: true })).toHaveValue('123');
  } finally {
    await writeFile(path, original);
  }
});
test('keyboard navigation, form names, reduced motion and study-text contrast', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to content' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
  await page.goto('/#/topic/normal');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const fields = await page.locator('input:not([type=checkbox]),select').evaluateAll((elements) =>
    elements.map((el) => ({
      name:
        el.getAttribute('aria-label') || (el as HTMLInputElement).labels?.[0]?.textContent?.trim(),
      tag: el.tagName,
    })),
  );
  expect(fields.every((f) => !!f.name)).toBe(true);
  const checks = await page
    .locator('.button.primary')
    .first()
    .evaluate((el) => getComputedStyle(el).transitionDuration);
  expect(checks).toBe('0s');
  const contrast = await page
    .locator('.concept-panel>p')
    .first()
    .evaluate((el) => {
      function rgb(s: string) {
        return (s.match(/[\d.]+/g) ?? [])
          .slice(0, 3)
          .map(Number)
          .map((x) => {
            x /= 255;
            return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
          });
      }
      const text = rgb(getComputedStyle(el).color);
      const bg = rgb(getComputedStyle(document.documentElement).backgroundColor);
      const l = (c: number[]) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      return (Math.max(l(text), l(bg)) + 0.05) / (Math.min(l(text), l(bg)) + 0.05);
    });
  expect(contrast).toBeGreaterThanOrEqual(4.5);
});
