import { test, expect } from '@playwright/test';

test('Equation Solver is the main app and navigation contains exactly the requested sections', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Equation Solver');
  const nav = page.getByRole('navigation', { name: 'Main navigation', exact: true });
  await expect(nav.getByRole('link')).toHaveText([
    'Equation Solver',
    'Worked Examples',
    'Formula Notebook',
  ]);
  await expect(nav.getByText('Study overview')).toHaveCount(0);
  await expect(nav.getByText('Course explorer')).toHaveCount(0);
  for (const route of ['dashboard', 'course', 'solver']) {
    await page.goto(`/#/${route}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Equation Solver');
  }
  await nav.getByRole('link', { name: 'Worked Examples', exact: true }).click();
  await expect(page.locator('.example-library article')).toHaveCount(47);
  await nav.getByRole('link', { name: 'Formula Notebook', exact: true }).click();
  await expect(page.locator('.formula-library article')).not.toHaveCount(0);
});
test('the shared input and keypad calculate, solve, reuse Ans and show both solution modes', async ({
  page,
}) => {
  await page.goto('/#/solver');
  for (const symbol of ['√', 'π', 'sin⁻¹', '×', '÷']) {
    await expect(page.getByRole('button', { name: `Insert ${symbol}`, exact: true })).toBeVisible();
  }
  const input = page.getByRole('textbox', { name: 'Equation or calculation' });
  const run = page.getByRole('button', { name: 'Solve / calculate', exact: true });
  await input.fill('sqrt(144)+sin(30)');
  await page.getByRole('button', { name: 'Evaluate input', exact: true }).click();
  await expect(page.locator('.equation-result-panel .result-answer')).toContainText('12.5');
  await input.fill('ans*x=25');
  await run.click();
  await expect(page.locator('.equation-result-panel .result-answer')).toContainText('2');
  await expect(page.locator('.solution-working .answer-memory')).toContainText('12.5');
  const answer = await page.locator('.equation-result-panel .result-answer').innerText();
  await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
  expect(await page.locator('.equation-result-panel .result-answer').innerText()).toBe(answer);
  await expect(page.locator('.solution-steps')).toContainText('Divide by the coefficient');
  await page.getByRole('button', { name: 'Quadratic equation', exact: true }).click();
  await expect(page.locator('.equation-result-panel .result-answer')).toContainText(
    'two distinct real solutions',
  );
  await page.getByRole('button', { name: 'Clear input', exact: true }).click();
  await page.getByRole('button', { name: 'Insert 2', exact: true }).click();
  await page.getByRole('button', { name: 'Insert +', exact: true }).click();
  await page.getByRole('button', { name: 'Insert 3', exact: true }).click();
  await expect(input).toHaveValue('2+3');
  await run.click();
  await expect(page.locator('.equation-result-panel .result-answer')).toContainText('5');
  await page.getByRole('button', { name: 'Backspace', exact: true }).click();
  await expect(input).toHaveValue('2+');
});
test('angle mode, validation, draft persistence and offline calculations work', async ({
  page,
  context,
}) => {
  await page.goto('/#/solver');
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const input = page.getByRole('textbox', { name: 'Equation or calculation' });
  const run = page.getByRole('button', { name: 'Solve / calculate', exact: true });
  await page.getByRole('button', { name: 'RAD', exact: true }).click();
  await input.fill('sin(pi/2)');
  await input.press('Enter');
  await expect(page.locator('.result-answer')).toContainText('evaluates to 1');
  await input.fill('sin(x)=0');
  await run.click();
  await expect(page.getByRole('alert')).toContainText('not supported');
  await input.fill('x^2+1=0');
  await page.reload();
  await expect(input).toHaveValue('x^2+1=0');
  await expect(page.getByRole('button', { name: 'RAD', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await context.setOffline(true);
  await page.reload();
  await run.click();
  await expect(page.locator('.result-answer')).toContainText('complex conjugate');
  await expect(page.getByRole('alert')).toHaveCount(0);
  await context.setOffline(false);
});
test('the unified workspace has no horizontal overflow on small mobile, tablet or desktop', async ({
  page,
}, testInfo) => {
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    await page.goto('/#/solver');
    await page.getByRole('button', { name: 'Quadratic equation', exact: true }).click();
    await page.getByRole('button', { name: 'Detailed Step-by-Step', exact: true }).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      width,
    );
    await page.screenshot({
      path: testInfo.outputPath(`equation-solver-${width}.png`),
      fullPage: true,
    });
  }
});
