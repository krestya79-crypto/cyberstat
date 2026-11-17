import { test, expect } from '@playwright/test';
import { formulaCoverage, lectureDerivations } from '../../src/content/derivations';

test('Notebook opens source-based proofs grouped by lecture without changing sidebar navigation', async ({
  page,
}) => {
  await page.goto('/#/formulas');
  await expect(page.locator('.formula-library article')).toHaveCount(49);
  await page.getByRole('link', { name: 'Formula Derivations & Proofs', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Formula Derivations & Proofs');
  await expect(page.locator('.lecture-proof')).toHaveCount(11);
  await expect(page.locator('.formula-audit-entry')).toHaveCount(49);
  await expect(page.locator('.sidebar nav a')).toHaveText([
    'Statistical Solver',
    'Worked Examples',
    'Formula Notebook',
  ]);
  await page.getByRole('button', { name: 'Lecture 2', exact: true }).click();
  await expect(page.locator('.lecture-proof')).toHaveCount(0);
  await expect(page.locator('.proof-no-derivation')).toContainText(
    'without displaying their proofs',
  );
  await expect(page.locator('.formula-audit-entry')).toHaveCount(15);
  await page.getByRole('button', { name: 'Lecture 4', exact: true }).click();
  await expect(page.locator('.lecture-proof')).toHaveCount(3);
  await expect(page.locator('#proof-known-mean-interval .proof-steps li')).toHaveCount(7);
  await expect(page.locator('#proof-sample-size-example .proof-review')).toContainText('139');
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});

test('all 49 formula links show the correct source status and link back to the exact Notebook entry', async ({
  page,
}) => {
  test.setTimeout(90000);
  for (const c of formulaCoverage) {
    await page.goto('/#/formulas?view=proofs&entry=' + encodeURIComponent(c.key));
    const status = page.getByRole('region', { name: 'Selected formula derivation status' });
    await expect(status.getByRole('heading', { level: 2 })).toHaveText(c.formula.name);
    await expect(status).toContainText(c.note);
    await expect(page.locator('.lecture-proof')).toHaveCount(c.proofs.length);
    for (const [i, p] of c.pages.entries())
      await expect(status.locator('.source-link').nth(i)).toHaveAttribute(
        'href',
        new RegExp(`lectures/lecture-${c.topic.lecture}\\.pdf#page=${p}$`),
      );
    await page.getByRole('link', { name: /Return to this Notebook formula/ }).click();
    const entry = page.locator(`[id="formula-${c.key}"]`);
    await expect(entry.getByRole('heading', { level: 2 })).toHaveText(c.formula.name);
    await expect(entry).toBeFocused();
  }
});

test('all source chains render with responsive math and working lecture citations', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/#/formulas?view=proofs');
    for (const p of lectureDerivations) {
      await expect(page.locator(`#proof-${p.id} .proof-steps li`)).toHaveCount(p.steps.length);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await expect(page.locator('main [role="alert"]')).toHaveCount(0);
    await page
      .locator('#proof-known-mean-interval')
      .screenshot({ path: info.outputPath(`known-mean-${width}.png`) });
  }
  expect(errors).toEqual([]);
  for (const n of [1, 2, 3, 4]) {
    const response = await page.request.get(`/lectures/lecture-${n}.pdf`);
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toContain('application/pdf');
  }
});

test('lecture proofs and source PDFs remain available offline after an online load', async ({
  page,
  context,
}) => {
  await page.goto('/#/formulas?view=proofs');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.lecture-proof')).toHaveCount(11);
  await page.getByRole('button', { name: 'Lecture 3', exact: true }).click();
  await expect(page.locator('.lecture-proof')).toHaveCount(2);
  expect(
    await page.evaluate(async () => {
      const r = await fetch('lectures/lecture-3.pdf');
      return r.ok && (await r.blob()).size > 1000000;
    }),
  ).toBe(true);
});
